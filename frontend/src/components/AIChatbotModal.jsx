import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bot, Send, X, Sparkles, User, AlertCircle, Shield } from 'lucide-react';

const AIChatbotModal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.name || 'Patient'}! 👋 I am your Personal AI Health Assistant. I analyze your query against your personal Health ID records (allergies, past diagnoses, active medicines) to give you safe, custom medical advice. What symptoms or questions do you have today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { sender: 'user', text: userText, timestamp: new Date() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await axios.post('/api/ai-chatbot/query', { message: userText });
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: res.data.botResponse,
          category: res.data.category,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: 'I am sorry, I encountered an error checking your medical records. Please try again or consult your doctor.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, width: '420px', maxWidth: 'calc(100vw - 40px)', height: '560px', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }} className="glass-card">
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', borderRadius: '16px 16px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.4rem', background: '#0ea5e9', borderRadius: '8px', color: '#fff' }}>
            <Bot size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Personal Health Bot</h4>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Sparkles size={12} /> Syncs with Health ID records
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.sender === 'bot' && (
              <div style={{ padding: '0.35rem', background: 'rgba(14, 165, 233, 0.2)', borderRadius: '50%', color: '#38bdf8', height: 'fit-content' }}>
                <Bot size={16} />
              </div>
            )}
            <div style={{ 
              maxWidth: '80%', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px',
              fontSize: '0.88rem',
              lineHeight: '1.4',
              background: m.sender === 'user' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
              whiteSpace: 'pre-line'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Bot size={16} className="text-primary" /> Analyzing allergies & medical data...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Ask about symptoms e.g. fever, headache..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          style={{ fontSize: '0.88rem', padding: '0.65rem 0.85rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }} disabled={loading}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIChatbotModal;
