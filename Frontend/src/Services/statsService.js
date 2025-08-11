import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/stats';

export const getStats = (token) => {
  return axios.get(`${BASE_URL}/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
