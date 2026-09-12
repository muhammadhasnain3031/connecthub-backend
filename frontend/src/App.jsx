import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div>
      {/* 1. Simple Navigation Menu bars bina kisi styling ke */}
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
        <Link to="/login" style={{ marginRight: '15px' }}>Login Page</Link>
        <Link to="/register">Register Page</Link>
      </nav>

      {/* 2. Routing Switchboard Engine Mapping */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<h3>Welcome to ConnectHub! Click above to Navigate.</h3>} />
      </Routes>
    </div>
  );
}

export default App;
