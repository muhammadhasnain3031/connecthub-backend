import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/users/register', { name, email, password });
      console.log('Registration Payload Data:', response.data);
      alert("Registration Successful!");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Network link broken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create account 🚀</h2>
        <p className="sub">ConnectHub join karo, bas 1 minute lagega</p>

        {error && <div className="alert-error"><b>Error:</b> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name-input">Full Name</label>
            <input id="name-input" className="input" type="text" placeholder="Muhammad Ali"
              value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" className="input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>

          <div className="field">
            <label htmlFor="reg-pass">Password</label>
            <input id="reg-pass" className="input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Register Account'}
          </button>
        </form>

        <p className="auth-foot">Pehle se account hai? <Link to="/login">Login karo</Link></p>
      </div>
    </div>
  );
};

export default Register;