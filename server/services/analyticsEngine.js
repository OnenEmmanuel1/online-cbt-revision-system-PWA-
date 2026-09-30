const pool = require('../config/db');

class AnalyticsEngine {
  
  async getStudentAnalytics(userId) {
    const [user] = await pool.query('SELECT totalPoints, fullName FROM users WHERE userId = ?', [userId]);
    
    // Performance over time (last 10 sessions)
    const [history] = await pool.query(
      `SELECT s.sessionId, c.title as courseTitle, t.name as topicName, s.score, s.pointsAwarded, s.submittedAt
       FROM test_sessions s
       JOIN courses c ON s.courseId = c.courseId
       LEFT JOIN topics t ON s.topicId = t.topicId
       WHERE s.studentId = ? AND s.status = 'Submitted'
       ORDER BY s.submittedAt DESC
       LIMIT 10`,
      [userId]
    );

    // Topic performance aggregation (true accuracy)
    const [topicStats] = await pool.query(
      `SELECT t.topicId,
              t.name as topicName, 
              COUNT(a.answerId) as totalAttempts,
              SUM(CASE WHEN a.isCorrect = TRUE THEN 1 ELSE 0 END) as correctCount,
              COUNT(DISTINCT s.sessionId) as sessionCount
       FROM test_sessions s
       JOIN topics t ON s.topicId = t.topicId
       JOIN test_answers a ON s.sessionId = a.sessionId
       WHERE s.studentId = ? AND s.status = 'Submitted'
       GROUP BY t.topicId`,
      [userId]
    );

    const [totalSessions] = await pool.query(
      'SELECT COUNT(sessionId) as total FROM test_sessions WHERE studentId = ? AND status = "Submitted"',
      [userId]
    );

    return {
      points: user[0].totalPoints,
      totalTests: totalSessions[0].total,
      history,
      topicStats
    };
  }

  async getSessionFeedback(sessionId, userId) {
    const [session] = await pool.query(
      'SELECT score, pointsAwarded FROM test_sessions WHERE sessionId = ? AND studentId = ?',
      [sessionId, userId]
    );

    if (session.length === 0) throw new Error('Session not found');

    const [details] = await pool.query(
      `SELECT 
        q.text as questionText,
        q.explanation,
        a.isCorrect,
        (SELECT optionText FROM question_options WHERE optionId = a.selectedOptionId) as selectedText,
        (SELECT optionText FROM question_options WHERE questionId = q.questionId AND isCorrect = TRUE) as correctText
       FROM test_answers a
       JOIN questions q ON a.questionId = q.questionId
       WHERE a.sessionId = ?`,
      [sessionId]
    );

    return {
      summary: session[0],
      details
    };
  }

  async getAdminAnalytics() {
    const [systemStats] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'Student') as totalStudents,
        (SELECT COUNT(*) FROM questions) as totalQuestions,
        (SELECT COUNT(*) FROM test_sessions WHERE status = 'Submitted') as totalSessionsCompleted`
    );

    const [courseCoverage] = await pool.query(
      `SELECT c.title, COUNT(q.questionId) as questionCount
       FROM courses c
       LEFT JOIN topics t ON c.courseId = t.courseId
       LEFT JOIN questions q ON t.topicId = q.topicId
       GROUP BY c.courseId`
    );

    // Hardest questions (lowest success rate)
    const [hardestQuestions] = await pool.query(
      `SELECT q.text, 
              SUM(CASE WHEN a.isCorrect = TRUE THEN 1 ELSE 0 END) as correctCount,
              COUNT(a.answerId) as totalAttempts
       FROM test_answers a
       JOIN questions q ON a.questionId = q.questionId
       GROUP BY q.questionId
       HAVING COUNT(a.answerId) > 0
       ORDER BY (SUM(CASE WHEN a.isCorrect = TRUE THEN 1 ELSE 0 END) / COUNT(a.answerId)) ASC
       LIMIT 5`
    );

    return {
      systemStats: systemStats[0],
      courseCoverage,
      hardestQuestions
    };
  }
}

module.exports = new AnalyticsEngine();
