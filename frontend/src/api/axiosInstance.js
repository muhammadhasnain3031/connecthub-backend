import axios from 'axios';


const API = axios.create({
    baseURL : 'https://connecthub-backend-three.vercel.app/api',
    withCredentials : true,
});

export default API;