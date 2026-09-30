const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const analyticsEngine = require('../services/analyticsEngine');

const upload = multer({ dest: 'uploads/' });

router.use(authenticateToken);
router.use(authorizeRole('Admin'));

// ---------------------------------------------------------
// COURSE MANAGEMENT
// ---------------------------------------------------------

router.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { courseCode, title } = req.body;
    const [result] = await pool.query('INSERT INTO courses (courseCode, title) VALUES (?, ?)', [courseCode, title]);
    res.status(201).json({ courseId: result.insertId, courseCode, title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// TOPIC MANAGEMENT
// ---------------------------------------------------------

router.get('/courses/:courseId/topics', async (req, res) => {
  try {
    const [topics] = await pool.query('SELECT * FROM topics WHERE courseId = ?', [req.params.courseId]);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/topics', async (req, res) => {
  try {
    const { courseId, name } = req.body;
    const [result] = await pool.query('INSERT INTO topics (courseId, name) VALUES (?, ?)', [courseId, name]);
    res.status(201).json({ topicId: result.insertId, courseId, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// QUESTION MANAGEMENT
// ---------------------------------------------------------

router.post('/questions', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { topicId, text, difficulty, explanation, options } = req.body;
    
    // Validate exactly one correct option
    const correctOptions = options.filter(o => o.isCorrect);
    if (correctOptions.length !== 1) {
      return res.status(400).json({ error: 'Question must have exactly one correct option' });
    }

    const [qResult] = await connection.query(
      'INSERT INTO questions (topicId, text, difficulty, explanation, createdBy) VALUES (?, ?, ?, ?, ?)',
      [topicId, text, difficulty, explanation, req.user.userId]
    );
    const questionId = qResult.insertId;

    for (const opt of options) {
      await connection.query(
        'INSERT INTO question_options (questionId, optionText, isCorrect) VALUES (?, ?, ?)',
        [questionId, opt.optionText, opt.isCorrect]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Question created successfully', questionId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Bulk Import
router.post('/questions/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const results = [];
  const errors = [];
  let rowCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          rowCount++;
          
          try {
            // Expected CSV format: topicId, text, difficulty, explanation, option1, isCorrect1, option2, isCorrect2, ...
            const { topicId, text, difficulty, explanation, option1, isCorrect1, option2, isCorrect2, option3, isCorrect3, option4, isCorrect4 } = row;
            
            const options = [
              { text: option1, isCorrect: isCorrect1 === 'true' || isCorrect1 === '1' },
              { text: option2, isCorrect: isCorrect2 === 'true' || isCorrect2 === '1' },
              { text: option3, isCorrect: isCorrect3 === 'true' || isCorrect3 === '1' },
              { text: option4, isCorrect: isCorrect4 === 'true' || isCorrect4 === '1' }
            ].filter(o => o.text);

            const correctCount = options.filter(o => o.isCorrect).length;
            if (correctCount !== 1) {
              errors.push({ row: rowCount, error: 'Must have exactly one correct option' });
              continue; // Skip this row
            }

            const [qRes] = await connection.query(
              'INSERT INTO questions (topicId, text, difficulty, explanation, createdBy) VALUES (?, ?, ?, ?, ?)',
              [topicId, text, difficulty || 'Medium', explanation, req.user.userId]
            );

            for (const opt of options) {
              await connection.query(
                'INSERT INTO question_options (questionId, optionText, isCorrect) VALUES (?, ?, ?)',
                [qRes.insertId, opt.text, opt.isCorrect]
              );
            }
          } catch (rowErr) {
             errors.push({ row: rowCount, error: rowErr.message });
          }
        }

        await connection.commit();
        res.json({ message: 'Bulk import complete', processed: rowCount, errors });
      } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Bulk import failed', details: err.message });
      } finally {
        connection.release();
        fs.unlinkSync(req.file.path); // clean up file
      }
    });
});

// ---------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------

router.get('/analytics', async (req, res) => {
  try {
    const data = await analyticsEngine.getAdminAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
