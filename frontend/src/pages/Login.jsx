import { useReducer,useState } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

// 1. Reducer function — state kaise change hogi, yahan decide hota hai
const loginReducer = (state, action) => {
    switch (action.type) {
        case 'SUBMIT_START':
            return { ...state, loading: true, error: null };
        case 'SUBMIT_SUCCESS':
            return { ...state, loading: false, error: null };
        case 'SUBMIT_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const initialState = {
    loading: false,
    error: null,
};

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2. useState ki jagah useReducer
    const [state, dispatch] = useReducer(loginReducer, initialState);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_START' });

        try {
            const response = await API.post('/users/login', { email, password });
            login(response.data.user);
            dispatch({ type: 'SUBMIT_SUCCESS' });
            alert("Login Successful!");
        } catch (err) {
            dispatch({ type: 'SUBMIT_FAIL', payload: err.response?.data?.message || "Connection failed." });
        }
    };

    return (
        <div>
            <h2>ConnectHub Login</h2>

            {state.error && <p style={{ color: 'red' }}><b>Error:</b> {state.error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email ID:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={state.loading}
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={state.loading}
                    />
                </div>

                <button type="submit" disabled={state.loading}>
                    {state.loading ? 'Verifying...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;