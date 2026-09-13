import { useState } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";


const Login = () => {
    // 1. Core State Hooks
    const {login} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Form Request Handler Logic
    const handleSubmit = async (e) => {
        e.preventDefault(); // Page refresh handler interception
        setLoading(true);
        setError(null);

        try {
            const response = await API.post('/users/login', { email, password });
            login(response.data.user)
            alert("Login Successful!");
        } catch (err) {
            setError(err.response?.data?.message || "Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Clean HTML Return Stack (No Styling Layers)
    return (
        <div>
            <h2>ConnectHub Login</h2>

            {/* Error Notification Alert (Short-circuit conditional) */}
            {error && <p style={{ color: 'red' }}><b>Error:</b> {error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email ID:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>

                {/* State-dependent button control */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
