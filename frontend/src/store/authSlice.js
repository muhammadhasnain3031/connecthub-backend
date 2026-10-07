import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axiosInstance'; 

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const response = await API.post('/users/login', credentials);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Connection failed.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  loading: false,
  error: null, 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true; 
        state.error = null;   
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; 
        state.user = action.payload; 
        localStorage.setItem('user', JSON.stringify(action.payload)); 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      });
  },
});

export { authSlice };
export const { logout } = authSlice.actions; 
export default authSlice.reducer;
