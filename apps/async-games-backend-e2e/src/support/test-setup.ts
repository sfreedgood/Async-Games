/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Skip database connection for e2e tests
  process.env.DB_SKIP = 'true';

  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
