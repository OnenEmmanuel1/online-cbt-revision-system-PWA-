import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Code, Book, List, PlusCircle } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ courseCode: '', title: '' });
  
  // For Topics
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchTopics(selectedCourseId);
    } else {
      setTopics([]);
    }
  }, [selectedCourseId]);

  const fetchTopics = async (courseId) => {
    try {
      const res = await api.get(`/admin/courses/${courseId}/topics`);
      setTopics(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', newCourse);
      setNewCourse({ courseCode: '', title: '' });
      fetchCourses();
    } catch (error) {
      alert('Failed to create course');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      await api.post('/admin/topics', { courseId: selectedCourseId, name: newTopic });
      setNewTopic('');
      fetchTopics(selectedCourseId);
    } catch (error) {
      alert('Failed to create topic');
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Manage Courses & Topics</h2>

      <div className="grid">
        {/* Create Course Form */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PlusCircle size={20} color="var(--cbtr-primary)" /> Create New Course
          </h3>
          <form onSubmit={handleCreateCourse}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="cbtr-form-label">Course Code</label>
              <div className="cbtr-input-wrapper">
                <Code className="cbtr-input-icon" size={20} />
                <input 
                  type="text" 
                  value={newCourse.courseCode}
                  onChange={e => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                  placeholder="e.g. CS101"
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="cbtr-form-label">Course Title</label>
              <div className="cbtr-input-wrapper">
                <Book className="cbtr-input-icon" size={20} />
                <input 
                  type="text" 
                  value={newCourse.title}
                  onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Introduction to Computer Science"
                  required
                />
              </div>
            </div>
            <button type="submit" className="cbtr-btn cbtr-btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '24px' }}>Create Course</button>
          </form>
        </div>

        {/* Existing Courses List */}
        <div className="card">
          <h3>Existing Courses</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {courses.map(course => (
              <li key={course.courseId} style={{ padding: '1rem', borderBottom: '1px solid var(--cbtr-border)' }}>
                <strong>{course.courseCode}</strong> - {course.title}
              </li>
            ))}
            {courses.length === 0 && <p>No courses found.</p>}
          </ul>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {/* Topics Manager */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <List size={20} color="var(--cbtr-primary)" /> Manage Topics
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Select Course to View/Add Topics</label>
            <div className="cbtr-input-wrapper">
              <Book className="cbtr-input-icon" size={20} />
              <select 
                value={selectedCourseId} 
                onChange={e => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Select a Course --</option>
                {courses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseCode} - {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCourseId && (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <h4>Topics for Selected Course</h4>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {topics.map(topic => (
                    <li key={topic.topicId} style={{ marginBottom: '0.5rem' }}>{topic.name}</li>
                  ))}
                  {topics.length === 0 && <p>No topics yet.</p>}
                </ul>
              </div>

              <div style={{ flex: 1, backgroundColor: 'var(--cbtr-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--cbtr-border)' }}>
                <h4 style={{ marginBottom: '1rem' }}>Add Topic</h4>
                <form onSubmit={handleCreateTopic}>
                  <div className="cbtr-input-wrapper" style={{ marginBottom: '1rem' }}>
                    <List className="cbtr-input-icon" size={20} />
                    <input 
                      type="text" 
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      placeholder="Topic Name"
                      required
                    />
                  </div>
                  <button type="submit" className="cbtr-btn cbtr-btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>Add Topic</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminCourses;
