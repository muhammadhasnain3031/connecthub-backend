import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
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
            .then(() => {
                navigate('/dashboard/bookings');
            })
            .catch((err) => {
                console.error("Login failed:", err);
            });
    };

    return (
        <div>
            <h2>ConnectHub Login</h2>

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

                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
