import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your server IP for mobile testing

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;

