import apiClient from '../api/client';
import { logout as logoutAction } from '../redux/slices/authSlice';

// dispatch: Redux dispatch function
// navigate: optional navigate function (from react-router) to redirect after logout
export default async function handleLogout(dispatch, navigate) {
  try {
    // Call backend logout to invalidate server-side sessions and clear refresh token cookie
    await apiClient.post('/protected/auth/logout');
  } catch (err) {
    // ignore network errors - still clear client state
    console.warn('Logout request failed', err?.response?.data || err.message || err);
  }

  // Clear client-side tokens
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (e) {
    // ignore
  }

  // Update Redux state
  if (typeof dispatch === 'function') dispatch(logoutAction());

  // Redirect to login
  if (typeof navigate === 'function') navigate('/login');
  else window.location.href = '/login';
}
