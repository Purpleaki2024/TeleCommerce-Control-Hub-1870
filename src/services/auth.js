import axios from 'axios';

export const login = async (username, password) => {
  try {
    const response = await axios.post('/api/admin/login', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};