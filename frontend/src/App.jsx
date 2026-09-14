import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import useDebounce from './hooks/useDebounce';

// Temporary test component — Day 9 ke baad delete kar dena
function DebounceTest() {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 500);

  return (
    <div style={{ padding: '10px' }}>
      <h3>Debounce Test</h3>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Yahan type karo..."
      />
      <p>Typing (live): {text}</p>
      <p>Debounced (500ms baad): {debouncedText}</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div>
        {/* 1. Simple Navigation Menu bars bina kisi styling ke */}
        <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
          <Link to="/login" style={{ marginRight: '15px' }}>Login Page</Link>
          <Link to="/register" style={{ marginRight: '15px' }}>Register Page</Link>
          <Link to="/debounce-test">Debounce Test</Link>
        </nav>

        {/* 2. Routing Switchboard Engine Mapping */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/debounce-test" element={<DebounceTest />} />
          <Route path="/" element={<h3>Welcome to ConnectHub! Click above to Navigate.</h3>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;