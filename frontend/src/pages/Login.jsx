import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => navigate('/dashboard/bookings'))
      .catch((err) => console.error("Login failed:", err));
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back 👋</h2>
        <p className="sub">Apne ConnectHub account mein login karo</p>

        {error && <div className="alert-error"><b>Error:</b> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email-input">Email ID</label>
            <input id="email-input" className="input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="field">
            <label htmlFor="password-input">Password</label>
            <input id="password-input" className="input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <p className="auth-foot">Account nahi hai? <Link to="/register">Register karo</Link></p>
      </div>
    </div>
  );
};

export default Login;