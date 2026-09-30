const pool = require('../config/db');

class AssessmentEngine {
  
  async startSession(userId, courseId, topicId, questionCount, durationSeconds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create session
      const [res] = await connection.query(
        `INSERT INTO test_sessions (studentId, courseId, topicId, durationSeconds, status) 
         VALUES (?, ?, ?, ?, 'InProgress')`,
        [userId, courseId, topicId || null, durationSeconds]
      );
      const sessionId = res.insertId;

      // Fetch random questions
      let query = 'SELECT questionId, text, difficulty FROM questions WHERE ';
      let params = [];
      if (topicId) {
        query += 'topicId = ?';
        params.push(topicId);
      } else {
        query += 'topicId IN (SELECT topicId FROM topics WHERE courseId = ?)';
        params.push(courseId);
      }
      query += ' ORDER BY RAND() LIMIT ?';
      params.push(parseInt(questionCount, 10) || 10);

      const [questions] = await connection.query(query, params);

      // Fetch options for these questions
      for (let q of questions) {
        const [options] = await connection.query(
          'SELECT optionId, optionText FROM question_options WHERE questionId = ?',
          [q.questionId]
        );
        q.options = options;
      }

      await connection.commit();
      return { sessionId, questions, durationSeconds, startedAt: new Date() };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveAnswer(sessionId, userId, questionId, selectedOptionId) {
    // Validate session ownership and status
    const [sessions] = await pool.query(
      'SELECT status, startedAt, durationSeconds FROM test_sessions WHERE sessionId = ? AND studentId = ?',
      [sessionId, userId]
    );

    if (sessions.length === 0) throw new Error('Session not found');
    const session = sessions[0];

    if (session.status !== 'InProgress') throw new Error('Session is already submitted or expired');

    // Server-side timer enforcement
    const now = new Date();
    const started = new Date(session.startedAt);
    const elapsedSeconds = (now.getTime() - started.getTime()) / 1000;
    
    // allow a small buffer for network latency
    if (elapsedSeconds > session.durationSeconds + 10) {
      await pool.query('UPDATE test_sessions SET status = "Expired" WHERE sessionId = ?', [sessionId]);
      throw new Error('Time expired');
    }

    // Check if answer already exists
    const [existing] = await pool.query(
      'SELECT answerId FROM test_answers WHERE sessionId = ? AND questionId = ?',
      [sessionId, questionId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE test_answers SET selectedOptionId = ?, answeredAt = NOW() WHERE answerId = ?',
        [selectedOptionId, existing[0].answerId]
      );
    } else {
      await pool.query(
        'INSERT INTO test_answers (sessionId, questionId, selectedOptionId, answeredAt) VALUES (?, ?, ?, NOW())',
        [sessionId, questionId, selectedOptionId]
      );
    }
  }

  async getCourseDataForOffline(courseId) {
    const [course] = await pool.query('SELECT * FROM courses WHERE courseId = ?', [courseId]);
    if (course.length === 0) throw new Error('Course not found');

    const [topics] = await pool.query('SELECT * FROM topics WHERE courseId = ?', [courseId]);
    const [questions] = await pool.query(
      'SELECT q.* FROM questions q JOIN topics t ON q.topicId = t.topicId WHERE t.courseId = ?', 
      [courseId]
    );
    
    for (let q of questions) {
      const [options] = await pool.query('SELECT * FROM question_options WHERE questionId = ?', [q.questionId]);
      q.options = options;
    }

    return {
      course: course[0],
      topics,
      questions
    };
  }
}

module.exports = new AssessmentEngine();
