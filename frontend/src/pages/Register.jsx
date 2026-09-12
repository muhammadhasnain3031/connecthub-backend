import { useState } from "react";
import API from "../api/axiosInstance";

const Register = () => {
    // 1. Core State Hooks (Register ke liye 3 fields)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Register Form Request Handler Logic
    const handleSubmit = async (e) => {
        e.preventDefault(); // Page refresh control state handler interception
        setLoading(true);
        setError(null);

        try {
            // Processing server data orchestration
            const response = await API.post('/users/register', { name, email, password });
            console.log('Registration Payload Data:', response.data);
            alert("Registration Successful!");
        } catch (err) {
            // Polymorphic validation check response
            const errorMessage = err.response?.data?.message || "Registration failed. Network link broken.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 3. Plain HTML Output Stack
    return (
        <div>
            <h2>ConnectHub Registration</h2>

            {/* Error Notification Alert */}
            {error && <p style={{ color: 'red' }}><b>Error:</b> {error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Full Name:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>

                <div>
                    <label>Email Address:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>

                <div>
                    <label>Secure Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>

                {/* Processing execution tracking controller */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Profile...' : 'Register Account'}
                </button>
            </form>
        </div>
    );
};

export default Register;
