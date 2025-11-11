import React, { useState, useEffect } from 'react';
import './App.css';

function HeartRain({ show, duration = 2500, count = 30 }) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);
  if (!visible) return null;
  return (
    <div className="heart-rain">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const size = 18 + Math.random() * 16;
        const delay = Math.random() * 1.2;
        const durationAnim = 2.2 + Math.random() * 1.2;
        return (
          <span
            key={i}
            className="heart-emoji"
            style={{
              left: `${left}%`,
              fontSize: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${durationAnim}s`,
            }}
          >
            ❤️
          </span>
        );
      })}
    </div>
  );
}


function PasswordPrompt({ onSubmit, onCancel, label }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === '1965') {
      onSubmit();
      setPw('');
      setErr('');
    } else {
      setErr('Wrong password');
    }
  };

  return (
    <div className="pw-modal">
      <form className="pw-form" onSubmit={handleSubmit}>
        <div>{label || 'Enter password to confirm:'}</div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          maxLength={4}
          autoFocus
          inputMode="numeric"
        />
        <div className="pw-btns">
          <button type="submit">OK</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
        {err && <div className="pw-error">{err}</div>}
      </form>
    </div>
  );
}

function CloudObscured({ text, revealed }) {
  if (revealed) return <span className="question-revealed">{text}</span>;
  // Obscure text with cloud SVG overlays
  return (
    <span className="cloud-obscured">
      {text.split('').map((char, i) => (
        <span key={i} className="cloud-char">{char.trim() ? <span className="cloud-svg">☁️</span> : ' '}</span>
      ))}
    </span>
  );
}

// Get API URL - detects Netlify automatically or uses environment variable
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Check if we're on Netlify (at runtime)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      return ''; // Use relative URL, Netlify will route to functions via netlify.toml
    }
  }
  // Local development
  return 'http://localhost:3001';
};

function App() {
  // Load from localStorage initially (for fast startup)
  const [questions, setQuestions] = useState(() => {
    try {
      const q = localStorage.getItem('hiban_questions');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });
  const [showHearts, setShowHearts] = useState(true);
  useEffect(() => {
    setShowHearts(true);
    const timer = setTimeout(() => setShowHearts(false), 2600);
    return () => clearTimeout(timer);
  }, []);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(() => {
    try {
      const r = localStorage.getItem('hiban_revealed');
      return r ? JSON.parse(r) : Array(questions.length).fill(false);
    } catch {
      return Array(questions.length).fill(false);
    }
  });
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pwPrompt, setPwPrompt] = useState({ open: false, idx: null, all: false });
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');

  // Load questions from server on mount
  useEffect(() => {
    const loadFromServer = async () => {
      const apiUrl = getApiUrl();
      try {
        const response = await fetch(`${apiUrl}/api/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Always use server data if available (even if empty)
          if (data.questions) {
            setQuestions(data.questions);
            setRevealed(data.revealed || Array(data.questions.length).fill(false));
            // Update localStorage with server data
            localStorage.setItem('hiban_questions', JSON.stringify(data.questions));
            localStorage.setItem('hiban_revealed', JSON.stringify(data.revealed || []));
            setSyncError(''); // Clear any previous errors
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to load from server:', error);
        // Check if we have local data to show error
        const localQuestions = localStorage.getItem('hiban_questions');
        if (localQuestions) {
          try {
            const parsed = JSON.parse(localQuestions);
            if (parsed && parsed.length > 0) {
              setSyncError('Cannot connect to server. Using local data.');
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadFromServer();
  }, []);

  // Save to server whenever questions or revealed change
  const saveToServer = async (questionsToSave, revealedToSave, retries = 2) => {
    const apiUrl = getApiUrl();
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${apiUrl}/api/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: questionsToSave,
            revealed: revealedToSave,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        setSyncError('');
        return; // Success, exit function
      } catch (error) {
        console.error(`Failed to save to server (attempt ${i + 1}/${retries + 1}):`, error);
        if (i === retries) {
          // Last attempt failed
          setSyncError('Cannot sync with server. Changes saved locally only.');
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
  };

  // Persist questions and revealed to localStorage and server
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hiban_questions', JSON.stringify(questions));
      localStorage.setItem('hiban_revealed', JSON.stringify(revealed));
      // Debounce server save to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveToServer(questions, revealed);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [questions, revealed, loading]);

  // Add a new question
  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setQuestions([...questions, input.trim()]);
      setRevealed([...revealed, false]);
      setInput('');
    }
  };

  // Handle tap/click when in unlocked mode
  const handleReveal = (idx) => {
    if (!unlocked) return;
    setRevealed(revealed => revealed.map((r, i) => i === idx ? true : r));
  };

  // When "face to face" button pressed
  const handleFaceToFace = () => {
    setPinMode(true);
    setPin('');
    setPinError('');
  };

  // PIN submit
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1965') {
      setUnlocked(true);
      setPinMode(false);
    } else {
      setPinError('Wrong PIN');
    }
  };

  // Clear one question
  const handleClearOne = (idx) => {
    setQuestions(questions => questions.filter((_, i) => i !== idx));
    setRevealed(revealed => revealed.filter((_, i) => i !== idx));
    setPwPrompt({ open: false, idx: null, all: false });
  };
  // Clear all questions
  const handleClearAll = () => {
    setQuestions([]);
    setRevealed([]);
    setPwPrompt({ open: false, idx: null, all: false });
  };

  // Show password prompt for one or all
  const openPwPrompt = (idx = null, all = false) => setPwPrompt({ open: true, idx, all });
  const closePwPrompt = () => setPwPrompt({ open: false, idx: null, all: false });

  // Password prompt submit
  const handlePwSubmit = () => {
    if (pwPrompt.all) handleClearAll();
    else if (pwPrompt.idx !== null) handleClearOne(pwPrompt.idx);
  };

  return (
    <>
      <HeartRain show={showHearts} />
      <div className="app-container">
      <h1>Ask Hiban</h1>
      {syncError && (
        <div className="sync-error" style={{ 
          color: 'orange', 
          fontSize: '12px', 
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107'
        }}>
          ⚠️ {syncError}
          <br />
          <small style={{ fontSize: '10px' }}>Assurez-vous que le serveur backend est démarré: <code>npm run server</code></small>
        </div>
      )}
      <form className="question-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Type your question about her..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={pinMode || unlocked}
        />
        <button type="submit" disabled={!input.trim() || pinMode || unlocked}>Add</button>
      </form>
      <div className="questions-list">
        {questions.map((q, i) => (
          <div
            key={i}
            className={`question-item${unlocked && !revealed[i] ? ' revealable' : ''}`}
            onClick={() => handleReveal(i)}
          >
            <CloudObscured text={q} revealed={revealed[i]} />
            <button
              className="clear-btn"
              title="Delete this question"
              onClick={e => { e.stopPropagation(); openPwPrompt(i, false); }}
              disabled={pinMode || pwPrompt.open}
            >🗑️</button>
          </div>
        ))}
      </div>
      {questions.length > 0 && (
        <button
          className="clear-all-btn"
          onClick={() => openPwPrompt(null, true)}
          disabled={pinMode || pwPrompt.open}
        >Clear All</button>
      )}
      {!unlocked && !pinMode && questions.length > 0 && (
        <button className="face-to-face-btn" onClick={handleFaceToFace}>Face to Face</button>
      )}
      {pinMode && (
        <form className="pin-form" onSubmit={handlePinSubmit}>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={4}
            autoFocus
            inputMode="numeric"
          />
          <button type="submit">Unlock</button>
          {pinError && <div className="pin-error">{pinError}</div>}
        </form>
      )}
      {pwPrompt.open && (
        <PasswordPrompt
          onSubmit={handlePwSubmit}
          onCancel={closePwPrompt}
          label={pwPrompt.all ? 'Enter password to clear ALL questions:' : 'Enter password to delete this question:'}
        />
      )}
      {unlocked && <div className="unlocked-msg">Tap a question to reveal it!</div>}
    </div>
    </>
  );
}

export default App;
