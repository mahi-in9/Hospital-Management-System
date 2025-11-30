import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';

const Activate = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const tenantId = params.get('tenantId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const activate = async () => {
      if (!token || !tenantId) {
        setError('Missing activation token');
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.post('/auth/activate', { token, tenantId });
        const { accessToken, refreshToken, user } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(loginSuccess(user));
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Activation failed');
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [token, tenantId, navigate, dispatch]);

  if (loading) return <div className="p-8">Activating account...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  return null;
};

export default Activate;
