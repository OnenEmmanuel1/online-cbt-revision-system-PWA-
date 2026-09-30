const dbPool = require('../config/db');

class ScoringEngine {
  
  // Accept optional connection for transaction safety during bulk offline sync
  async gradeSession(sessionId, userId, extConnection = null) {
    const connection = extConnection || await dbPool.getConnection();
    try {
      if (!extConnection) await connection.beginTransaction();

      // Check session
      const [sessions] = await connection.query(
        'SELECT * FROM test_sessions WHERE sessionId = ? AND studentId = ?',
        [sessionId, userId]
      );
      if (sessions.length === 0) throw new Error('Session not found');
      const session = sessions[0];

      if (session.status === 'Submitted') {
        if (!extConnection) await connection.rollback();
        return { score: session.score, points: session.pointsAwarded, message: 'Already submitted' };
      }

      // Fetch all answers for this session
      const [answers] = await connection.query(
        'SELECT * FROM test_answers WHERE sessionId = ?',
        [sessionId]
      );

      let correctCount = 0;
      let totalQuestions = answers.length;

      // Grade each answer
      for (let ans of answers) {
        if (!ans.selectedOptionId) {
          await connection.query(
            'UPDATE test_answers SET isCorrect = FALSE WHERE answerId = ?',
            [ans.answerId]
          );
          continue;
        }

        // We check the DB to ensure they didn't tamper with the client payload
        const [options] = await connection.query(
          'SELECT isCorrect FROM question_options WHERE optionId = ? AND questionId = ?',
          [ans.selectedOptionId, ans.questionId]
        );

        const isCorrect = options.length > 0 && options[0].isCorrect;
        if (isCorrect) correctCount++;

        await connection.query(
          'UPDATE test_answers SET isCorrect = ? WHERE answerId = ?',
          [isCorrect, ans.answerId]
        );
      }

      // Gamification: Award points (e.g., 10 points per correct answer)
      const pointsPerCorrect = 10;
      const pointsAwarded = correctCount * pointsPerCorrect;

      // Update session
      await connection.query(
        `UPDATE test_sessions 
         SET status = 'Submitted', submittedAt = NOW(), score = ?, pointsAwarded = ? 
         WHERE sessionId = ?`,
        [correctCount, pointsAwarded, sessionId]
      );

      // Update user total points
      await connection.query(
        'UPDATE users SET totalPoints = totalPoints + ? WHERE userId = ?',
        [pointsAwarded, userId]
      );

      if (!extConnection) await connection.commit();

      return {
        score: correctCount,
        total: totalQuestions,
        points: pointsAwarded
      };
    } catch (error) {
      if (!extConnection) await connection.rollback();
      throw error;
    } finally {
      if (!extConnection) connection.release();
    }
  }
}

module.exports = new ScoringEngine();
