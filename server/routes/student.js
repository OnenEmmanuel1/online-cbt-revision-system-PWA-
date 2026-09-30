const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const assessmentEngine = require('../services/assessmentEngine');
const scoringEngine = require('../services/scoringEngine');
const analyticsEngine = require('../services/analyticsEngine');

router.use(authenticateToken); // Both students and potentially admins can use these

// ---------------------------------------------------------
// BROWSING & SEARCH
// ---------------------------------------------------------

// Get all courses with topics
router.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses');
    for (let course of courses) {
      const [topics] = await pool.query('SELECT * FROM topics WHERE courseId = ?', [course.courseId]);
      course.topics = topics;
    }
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// ASSESSMENT ENGINE
// ---------------------------------------------------------

// Start a test session
router.post('/sessions/start', async (req, res) => {
  try {
    const { courseId, topicId, questionCount, durationSeconds } = req.body;
    const sessionData = await assessmentEngine.startSession(
      req.user.userId, 
      courseId, 
      topicId, 
      questionCount, 
      durationSeconds
    );
    res.json(sessionData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save an answer during a session
router.post('/sessions/:sessionId/answers', async (req, res) => {
  try {
    const { questionId, selectedOptionId } = req.body;
    await assessmentEngine.saveAnswer(req.params.sessionId, req.user.userId, questionId, selectedOptionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a session
router.post('/sessions/:sessionId/submit', async (req, res) => {
  try {
    const result = await scoringEngine.gradeSession(req.params.sessionId, req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// OFFLINE SUPPORT (Download for Offline)
// ---------------------------------------------------------

router.get('/download-course/:courseId', async (req, res) => {
  try {
    const data = await assessmentEngine.getCourseDataForOffline(req.params.courseId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// ANALYTICS & FEEDBACK
// ---------------------------------------------------------

router.get('/analytics', async (req, res) => {
  try {
    const data = await analyticsEngine.getStudentAnalytics(req.user.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions/:sessionId/results', async (req, res) => {
  try {
    const data = await analyticsEngine.getSessionFeedback(req.params.sessionId, req.user.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
