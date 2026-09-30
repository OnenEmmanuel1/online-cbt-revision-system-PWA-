CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Admin') NOT NULL,
    institution VARCHAR(150),
    totalPoints INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    courseId INT AUTO_INCREMENT PRIMARY KEY,
    courseCode VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL
);

CREATE TABLE topics (
    topicId INT AUTO_INCREMENT PRIMARY KEY,
    courseId INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE CASCADE
);

CREATE TABLE questions (
    questionId INT AUTO_INCREMENT PRIMARY KEY,
    topicId INT NOT NULL,
    text TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    explanation TEXT,
    createdBy INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topicId) REFERENCES topics(topicId) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE question_options (
    optionId INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    optionText VARCHAR(255) NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    FOREIGN KEY (questionId) REFERENCES questions(questionId) ON DELETE CASCADE
);

CREATE TABLE test_sessions (
    sessionId INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    courseId INT NOT NULL,
    topicId INT,
    startedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    durationSeconds INT NOT NULL,
    submittedAt DATETIME,
    status ENUM('InProgress', 'Submitted', 'Expired') NOT NULL,
    score INT,
    pointsAwarded INT,
    wasOffline BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (studentId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE CASCADE,
    FOREIGN KEY (topicId) REFERENCES topics(topicId) ON DELETE CASCADE
);

CREATE TABLE test_answers (
    answerId INT AUTO_INCREMENT PRIMARY KEY,
    sessionId INT NOT NULL,
    questionId INT NOT NULL,
    selectedOptionId INT,
    isCorrect BOOLEAN,
    answeredAt DATETIME,
    FOREIGN KEY (sessionId) REFERENCES test_sessions(sessionId) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES questions(questionId) ON DELETE CASCADE,
    FOREIGN KEY (selectedOptionId) REFERENCES question_options(optionId) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_test_sessions_student_status ON test_sessions(studentId, status);
CREATE INDEX idx_questions_topic ON questions(topicId);
CREATE INDEX idx_topics_course ON topics(courseId);
