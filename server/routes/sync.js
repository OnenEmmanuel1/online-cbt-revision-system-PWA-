const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const scoringEngine = require('../services/scoringEngine');

router.use(authenticateToken);

router.post('/offline-sessions', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { sessions } = req.body;
    // sessions is an array of offline sessions to sync
    
    await connection.beginTransaction();

    const results = [];

    for (const session of sessions) {
      // Create session record
      const startedAtDate = new Date(session.startedAt);
      const [sessRes] = await connection.query(
        `INSERT INTO test_sessions 
         (studentId, courseId, topicId, startedAt, durationSeconds, submittedAt, status, wasOffline) 
         VALUES (?, ?, ?, ?, ?, ?, 'Submitted', TRUE)`,
        [req.user.userId, session.courseId, session.topicId, startedAtDate, session.durationSeconds, new Date(session.submittedAt)]
      );
      
      const sessionId = sessRes.insertId;

      // Insert answers ensuring they were answered within the allowed timeframe
      for (const ans of session.answers) {
        const answeredAtDate = new Date(ans.answeredAt);
        const elapsed = (answeredAtDate.getTime() - startedAtDate.getTime()) / 1000;
        
        // Prevent spoofing by dropping answers marked as answered significantly after duration
        if (elapsed <= session.durationSeconds + 10) {
          await connection.query(
            'INSERT INTO test_answers (sessionId, questionId, selectedOptionId, answeredAt) VALUES (?, ?, ?, ?)',
            [sessionId, ans.questionId, ans.selectedOptionId || null, answeredAtDate]
          );
        }
      }

      // We must grade it server side to prevent cheating
      const gradeResult = await scoringEngine.gradeSession(sessionId, req.user.userId, connection);
      results.push({ localSessionId: session.localId, serverSessionId: sessionId, score: gradeResult.score, points: gradeResult.points });
    }

    await connection.commit();
    res.json({ success: true, syncedSessions: results });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
