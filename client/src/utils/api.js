import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Crucial for sending JWT cookies
});

export default api;
