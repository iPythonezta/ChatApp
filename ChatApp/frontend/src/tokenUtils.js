let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

const saveTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const getAccessToken = () => accessToken;

const getRefreshToken = () => JSON.stringify(localStorage.getItem('refresh_token'));

export { saveTokens, getAccessToken, getRefreshToken };
