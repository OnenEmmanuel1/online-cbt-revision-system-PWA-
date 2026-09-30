import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { DownloadCloud, CheckCircle, ClipboardList, CloudOff } from 'lucide-react';
import { saveCourseOffline, getOfflineCourse } from '../services/offlineDB';

const CourseBrowse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineStatus, setOfflineStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/student/courses');
      setCourses(res.data);
      
      // Check which ones are available offline
      const statuses = {};
      for (const course of res.data) {
        const cached = await getOfflineCourse(course.courseId);
        if (cached) statuses[course.courseId] = true;
      }
      setOfflineStatus(statuses);
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOffline = async (courseId) => {
    try {
      setOfflineStatus(prev => ({ ...prev, [courseId]: 'downloading' }));
      const res = await api.get(`/student/download-course/${courseId}`);
      await saveCourseOffline(res.data);
      setOfflineStatus(prev => ({ ...prev, [courseId]: true }));
      alert('Course downloaded for offline use!');
    } catch (error) {
      console.error('Download failed', error);
      setOfflineStatus(prev => ({ ...prev, [courseId]: false }));
      alert('Failed to download course.');
    }
  };

  const startTest = (courseId, topicId = null) => {
    navigate('/test/setup', { state: { courseId, topicId } });
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Browse Courses</h2>
      <p style={{ color: 'var(--cbtr-text-secondary)', marginBottom: '2rem' }}>
        Select a course or topic to start revising. You can also download complete courses for offline revision.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {courses.map(course => (
          <div key={course.courseId} className="cbtr-course-card" style={{ padding: '1.5rem', alignItems: 'stretch' }}>
            
            <div className="cbtr-card-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--cbtr-primary)' }}>{course.courseCode}</span>
                {offlineStatus[course.courseId] === true && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--cbtr-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle size={10} /> Offline Ready
                  </span>
                )}
              </div>
              
              <div 
                className="cbtr-card-header-icon" 
                style={{ 
                  cursor: 'pointer', 
                  backgroundColor: offlineStatus[course.courseId] ? 'var(--cbtr-badge-green)' : 'var(--cbtr-badge-purple)',
                  color: offlineStatus[course.courseId] ? 'var(--cbtr-success)' : 'var(--cbtr-primary)'
                }}
                onClick={() => !offlineStatus[course.courseId] && handleDownloadOffline(course.courseId)}
                title={offlineStatus[course.courseId] ? "Available Offline" : "Download for Offline"}
              >
                {offlineStatus[course.courseId] === 'downloading' ? (
                  <span style={{ fontSize: '0.5rem', color: 'var(--cbtr-primary)' }}>...</span>
                ) : offlineStatus[course.courseId] === true ? (
                  <CloudOff size={16} />
                ) : (
                  <DownloadCloud size={16} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="cbtr-card-main-icon">
                <ClipboardList size={32} />
              </div>
              <h4 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--cbtr-text-primary)' }}>{course.title}</h4>
            </div>
            
            <button className="cbtr-card-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => startTest(course.courseId)}>
              Start Full Course
            </button>

            {course.topics && course.topics.length > 0 && (
              <div style={{ marginTop: 'auto' }}>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--cbtr-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Topics</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {course.topics.map(topic => (
                    <div key={topic.topicId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--cbtr-bg)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{topic.name}</span>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--cbtr-primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }} 
                        onClick={() => startTest(course.courseId, topic.topicId)}
                      >
                        Practice
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseBrowse;
