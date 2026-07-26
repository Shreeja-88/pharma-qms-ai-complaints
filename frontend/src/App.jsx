import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormData, addMessage, setLoading } from './store';
import axios from 'axios';
import { Send, Upload, ShieldAlert, CheckCircle, FileText, Bot, User } from 'lucide-react';
import './App.css';

const API_BASE_URL = "https://pharma-qms-backend.onrender.com";
export default function App() {
  const dispatch = useDispatch();
  const { formData, chatHistory, loading } = useSelector((state) => state.complaint);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const userText = inputMessage;
    setInputMessage('');

    // If a file is selected, run document extraction
    if (selectedFile) {
      dispatch(addMessage({ sender: 'user', message: `Uploaded Document: ${selectedFile.name}` }));
      dispatch(setLoading(true));

      const formDataPayload = new FormData();
      formDataPayload.append('file', selectedFile);

      try {
      // 1. Updated Document Extraction Endpoint
      const res = await axios.post(`${API_BASE_URL}/api/extract-document`, formDataPayload);
        dispatch(updateFormData(res.data.form_data));
        dispatch(addMessage({ sender: 'ai', message: res.data.assistant_message }));
      } catch (err) {
        dispatch(addMessage({ sender: 'ai', message: 'Failed to parse document.' }));
      } finally {
        setSelectedFile(null);
        dispatch(setLoading(false));
      }
      return;
    }

    // Normal natural language chat / edit
    dispatch(addMessage({ sender: 'user', message: userText }));
    dispatch(setLoading(true));

    // Determine if user is logging or editing
    const isEdit = userText.toLowerCase().includes('sorry') || userText.toLowerCase().includes('change') || userText.toLowerCase().includes('update') || userText.toLowerCase().includes('batch');
    const actionType = isEdit ? 'edit' : 'log';

        try {
          // 2. Updated Chat Endpoint
          const res = await axios.post(`${API_BASE_URL}/api/chat`, {
            message: userText,
            action_type: actionType,
            current_data: formData
          });
          dispatch(updateFormData(res.data.form_data));
          dispatch(addMessage({ sender: 'ai', message: res.data.assistant_message }));
        } catch (err) {
          dispatch(addMessage({ sender: 'ai', message: 'Failed to process chat message.' }));
        } finally {
          dispatch(setLoading(false));
        }
  };
  

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="navbar">
        <h2>PharmaPulse AI <span>QMS Customer Complaint Management</span></h2>
        <span className="badge">Pharma AI Co-pilot</span>
      </header>

      {/* Split Screen */}
      <div className="main-content">
        {/* LEFT PANEL: Form & Risk Assessment */}
        <div className="panel left-panel">
          <h3>Log Customer Complaint</h3>
          <p className="subtitle">Populated automatically via AI Co-pilot assistant</p>

          <form onSubmit={(e) => e.preventDefault()} className="complaint-form">
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={formData.customer_name || ''} readOnly placeholder="Auto-filled by AI" />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={formData.product_name || ''} readOnly placeholder="Auto-filled by AI" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Strength / Grade</label>
                <input type="text" value={formData.product_strength || ''} readOnly placeholder="Auto-filled by AI" />
              </div>
              <div className="form-group">
                <label>Batch / Lot Number</label>
                <input type="text" value={formData.batch_number || ''} readOnly className="highlight-field" placeholder="Auto-filled by AI" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Affected Quantity</label>
                <input type="text" value={formData.affected_quantity || ''} readOnly className="highlight-field" placeholder="Auto-filled by AI" />
              </div>
              <div className="form-group">
                <label>Manufacturing Date</label>
                <input type="text" value={formData.manufacturing_date || ''} readOnly placeholder="Auto-filled by AI" />
              </div>
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" value={formData.expiry_date || ''} readOnly placeholder="Auto-filled by AI" />
            </div>

            <div className="form-group">
              <label>Defect Description</label>
              <textarea rows="3" value={formData.defect_description || ''} readOnly placeholder="Auto-filled by AI"></textarea>
            </div>
          </form>

          {/* AI Co-pilot Risk Assessment Box */}
          <div className="risk-card">
            <h4><ShieldAlert size={18} /> AI Co-pilot Risk Assessment</h4>
            <div className="risk-grid">
              <div>
                <strong>Severity:</strong> 
                <span className={`severity-tag ${formData.risk_severity?.toLowerCase()}`}>
                  {formData.risk_severity || 'Pending'}
                </span>
              </div>
              <div>
                <strong>Next Action:</strong> {formData.next_action || 'Pending AI reasoning...'}
              </div>
              <div>
                <strong>Root Cause Hypothesis:</strong> {formData.suggested_root_cause || 'Pending AI reasoning...'}
              </div>
              <div>
                <strong>Recommended CAPA:</strong> {formData.recommended_capa || 'Pending AI reasoning...'}
              </div>
            </div>
          </div>

          <div className="risk-item">
            <br></br>
            <span><strong>Data Completeness:</strong></span>
            <span style={{
              fontWeight: 'bold',
              color: formData.completeness_status === 'Complete' ? '#16a34a' : '#d97706'
            }}>
              {formData.completeness_score || '0%'} ({formData.completeness_status || 'Pending'})
            </span>
          </div>

          {formData.missing_fields && formData.missing_fields.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>
              Missing required fields: {formData.missing_fields.join(', ')}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: AI Assistant Chat */}
        <div className="panel right-panel">
          <div className="chat-header">
            <Bot size={22} />
            <div>
              <h3>PharmaPulse AI Co-pilot Assistant</h3>
              <small>LangGraph Powered Agent (Groq LLM)</small>
            </div>
          </div>

          <div className="chat-messages">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                <div className="bubble-text">{msg.message}</div>
              </div>
            ))}
            {loading && <div className="chat-bubble ai loading">Analyzing request & updating QMS form...</div>}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            {selectedFile && (
              <div className="file-preview">
                <FileText size={14} /> {selectedFile.name}
                <button type="button" onClick={() => setSelectedFile(null)}>✕</button>
              </div>
            )}
            <div className="input-row">
              <label className="upload-btn">
                <Upload size={18} />
                <input 
                  type="file" 
                  accept=".txt,.pdf" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  hidden 
                />
              </label>
              <input
                type="text"
                placeholder="Log complaint or edit details (e.g. 'Sorry, batch number is BMX24602')..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" disabled={loading} className="send-btn">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}