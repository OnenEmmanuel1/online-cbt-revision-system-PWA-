import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UploadCloud, PlusCircle, Book, List, FileText, Target, Info, CheckCircle2 } from 'lucide-react';

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Bulk Upload State
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Manual Question State
  const [manualQ, setManualQ] = useState({
    topicId: '',
    text: '',
    difficulty: 'Medium',
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    api.get('/admin/courses').then(res => setCourses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      api.get(`/admin/courses/${selectedCourseId}/topics`)
        .then(res => setTopics(res.data))
        .catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedCourseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setUploadStatus('Uploading...');
      const res = await api.post('/admin/questions/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus(`Success! Processed ${res.data.processed} rows. ${res.data.errors.length} errors.`);
      setFile(null);
    } catch (error) {
      setUploadStatus('Upload failed.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/questions', manualQ);
      alert('Question added successfully!');
      // Reset form but keep topic selected
      setManualQ({
        ...manualQ,
        text: '',
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add question');
    }
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...manualQ.options];
    if (field === 'isCorrect' && value === true) {
      // Ensure only one correct option
      newOptions.forEach(o => o.isCorrect = false);
    }
    newOptions[index][field] = value;
    setManualQ({ ...manualQ, options: newOptions });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Manage Questions</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Bulk Upload Card */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <UploadCloud size={20} color="var(--cbtr-primary)" /> Bulk Question Upload
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', marginBottom: '1.5rem' }}>
            Upload a CSV with columns: <code>topicId, text, difficulty, explanation, option1, isCorrect1, ... option4, isCorrect4</code>
          </p>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="cbtr-input-wrapper">
                <UploadCloud className="cbtr-input-icon" size={20} />
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={e => setFile(e.target.files[0])} 
                  required 
                  style={{ border: 'none', background: 'transparent', width: '100%' }}
                />
              </div>
            </div>
            <button type="submit" className="cbtr-btn cbtr-btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '24px' }} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>
          {uploadStatus && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Manual Addition Card */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PlusCircle size={20} color="var(--cbtr-primary)" /> Add Question Manually
          </h3>
          
          <form onSubmit={handleManualSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="cbtr-form-label">Course</label>
                <div className="cbtr-input-wrapper" style={{ padding: '0.5rem 1rem' }}>
                  <Book className="cbtr-input-icon" size={18} />
                  <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ fontSize: '0.9rem' }}>
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="cbtr-form-label">Topic</label>
                <div className="cbtr-input-wrapper" style={{ padding: '0.5rem 1rem' }}>
                  <List className="cbtr-input-icon" size={18} />
                  <select 
                    value={manualQ.topicId} 
                    onChange={e => setManualQ({...manualQ, topicId: e.target.value})}
                    required
                    style={{ fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Topic --</option>
                    {topics.map(t => <option key={t.topicId} value={t.topicId}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="cbtr-form-label">Difficulty</label>
                <div className="cbtr-input-wrapper" style={{ padding: '0.5rem 1rem' }}>
                  <Target className="cbtr-input-icon" size={18} />
                  <select value={manualQ.difficulty} onChange={e => setManualQ({...manualQ, difficulty: e.target.value})} style={{ fontSize: '0.9rem' }}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="cbtr-form-label">Question Text</label>
                <div className="cbtr-input-wrapper" style={{ alignItems: 'flex-start', padding: '0.5rem 1rem' }}>
                  <FileText className="cbtr-input-icon" size={18} style={{ marginTop: '0.2rem' }} />
                  <textarea 
                    rows="2"
                    value={manualQ.text}
                    onChange={e => setManualQ({...manualQ, text: e.target.value})}
                    required
                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="cbtr-form-label">Explanation (Optional)</label>
                <div className="cbtr-input-wrapper" style={{ alignItems: 'flex-start', padding: '0.5rem 1rem' }}>
                  <Info className="cbtr-input-icon" size={18} style={{ marginTop: '0.2rem' }} />
                  <textarea 
                    rows="2"
                    value={manualQ.explanation}
                    onChange={e => setManualQ({...manualQ, explanation: e.target.value})}
                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>


            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Options</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', marginBottom: '1rem' }}>Select the radio button next to the correct answer.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {manualQ.options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    border: opt.isCorrect ? '5px solid var(--cbtr-primary)' : '2px solid var(--cbtr-border)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }} 
                  onClick={() => updateOption(idx, 'isCorrect', true)}
                  >
                    <input type="radio" name="correctOption" checked={opt.isCorrect} onChange={() => updateOption(idx, 'isCorrect', true)} required style={{ opacity: 0, width: 0, height: 0 }} />
                  </div>
                  
                  <div className="cbtr-input-wrapper" style={{ flex: 1, padding: '0.5rem 1rem', borderColor: opt.isCorrect ? 'var(--cbtr-primary)' : 'var(--cbtr-border)' }}>
                    <input 
                      type="text" 
                      placeholder={`Option ${idx + 1}`}
                      value={opt.optionText}
                      onChange={e => updateOption(idx, 'optionText', e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="cbtr-btn cbtr-btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '24px' }}>
              Add Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestions;
