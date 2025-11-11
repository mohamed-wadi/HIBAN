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

function App() {
  const [questions, setQuestions] = useState([]);
  const [showHearts, setShowHearts] = useState(true);
  useEffect(() => {
    setShowHearts(true);
    const timer = setTimeout(() => setShowHearts(false), 2600);
    return () => clearTimeout(timer);
  }, []);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(Array(questions.length).fill(false));
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pwPrompt, setPwPrompt] = useState({ open: false, idx: null, all: false });

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
