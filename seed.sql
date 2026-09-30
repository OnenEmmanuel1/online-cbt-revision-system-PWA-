-- Insert users (password is 'password123' for both, hashed using bcrypt: $2b$10$5jQJ28/ecv7Bsx4RgJxql.90NyR24qj16ZtUROao1ikOk2fO0H3he)
INSERT INTO users (fullName, email, passwordHash, role, institution, totalPoints)
VALUES 
('Admin User', 'admin@cbtr.local', '$2b$10$5jQJ28/ecv7Bsx4RgJxql.90NyR24qj16ZtUROao1ikOk2fO0H3he', 'Admin', 'CBTR HQ', 0),
('Student User', 'student@student.local', '$2b$10$5jQJ28/ecv7Bsx4RgJxql.90NyR24qj16ZtUROao1ikOk2fO0H3he', 'Student', 'University of Tech', 150);

-- Insert courses
INSERT INTO courses (courseCode, title)
VALUES 
('CS101', 'Introduction to Computer Science'),
('CS202', 'Data Structures and Algorithms');

-- Insert topics
INSERT INTO topics (courseId, name)
VALUES 
(1, 'Basic Concepts'),
(1, 'Programming Fundamentals'),
(2, 'Arrays and Linked Lists'),
(2, 'Trees and Graphs');

-- Insert questions
INSERT INTO questions (topicId, text, difficulty, explanation, createdBy)
VALUES 
(1, 'What does CPU stand for?', 'Easy', 'CPU stands for Central Processing Unit.', 1),
(1, 'Which of the following is considered volatile memory?', 'Medium', 'RAM is volatile, meaning it loses data when power is turned off.', 1),
(2, 'Which language is known as the mother of all languages?', 'Easy', 'C is widely considered the mother of modern programming languages.', 1),
(3, 'What is the time complexity of searching an element in an unsorted array?', 'Medium', 'You must check each element one by one in an unsorted array, taking O(n) time.', 1),
(4, 'Which traversal visits the root node last?', 'Hard', 'Post-order traversal visits left subtree, right subtree, and then the root.', 1);

-- Insert options
-- Q1
INSERT INTO question_options (questionId, optionText, isCorrect) VALUES 
(1, 'Central Process Unit', FALSE),
(1, 'Central Processing Unit', TRUE),
(1, 'Computer Personal Unit', FALSE),
(1, 'Central Processor Unit', FALSE);

-- Q2
INSERT INTO question_options (questionId, optionText, isCorrect) VALUES 
(2, 'ROM', FALSE),
(2, 'Hard Drive', FALSE),
(2, 'RAM', TRUE),
(2, 'Flash Drive', FALSE);

-- Q3
INSERT INTO question_options (questionId, optionText, isCorrect) VALUES 
(3, 'Java', FALSE),
(3, 'Python', FALSE),
(3, 'C', TRUE),
(3, 'Assembly', FALSE);

-- Q4
INSERT INTO question_options (questionId, optionText, isCorrect) VALUES 
(4, 'O(1)', FALSE),
(4, 'O(log n)', FALSE),
(4, 'O(n)', TRUE),
(4, 'O(n log n)', FALSE);

-- Q5
INSERT INTO question_options (questionId, optionText, isCorrect) VALUES 
(5, 'In-order', FALSE),
(5, 'Pre-order', FALSE),
(5, 'Post-order', TRUE),
(5, 'Level-order', FALSE);
