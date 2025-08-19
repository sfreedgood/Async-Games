import axios from 'axios';
const baseURL = 'http://localhost';
const PORT = 3000;

export const basePath = `${baseURL}:${PORT}/api`;

export const getData = async (endpoint: string) => {
  try {
    const response = await axios.get(`${basePath}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
