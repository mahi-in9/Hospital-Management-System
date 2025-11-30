import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const SignUp = () => {
  const { register, handleSubmit } = useForm();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activationLink, setActivationLink] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await apiClient.get('/hospitals');
        if (mounted) setHospitals(res.data.data.hospitals || []);
      } catch (err) {}
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register-user', data);
      const dataResp = res.data?.data || {};
      // If backend returned tokens (AUTO_ACTIVATE_USERS), store and redirect to dashboard
      if (dataResp.accessToken && dataResp.refreshToken) {
        const user = dataResp.user;
        localStorage.setItem('accessToken', dataResp.accessToken);
        localStorage.setItem('refreshToken', dataResp.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setMessage('Registration successful. Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
        return;
      }

      const link = dataResp.activationLink;
      const preview = dataResp.previewUrl;
      if (link) {
        setActivationLink(link);
        setPreviewUrl(preview || null);
        setMessage('Registration submitted. Activation required.');
      } else {
        setMessage('Registration submitted. Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold">Sign up</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-4">
            <input {...register('firstName')} placeholder="First name" className="input-field" />
            <input {...register('lastName')} placeholder="Last name" className="input-field" />
            <input {...register('email')} placeholder="Email" className="input-field" />
            <input {...register('phone')} placeholder="Phone" className="input-field" />
            <input {...register('password')} type="password" placeholder="Password" className="input-field" />
            <select {...register('tenantId')} className="input-field">
              <option value="">Select hospital</option>
              {hospitals.map((h) => <option key={h.tenantId} value={h.tenantId}>{h.name} - {h.city}</option>)}
            </select>

            {message && <div className="p-2 bg-secondary-50 rounded">{message}</div>}
            {activationLink && (
              <div className="p-2 mt-2">
                <a className="text-primary-600" href={activationLink} target="_blank" rel="noreferrer">Activate account (dev link)</a>
              </div>
            )}
            {previewUrl && (
              <div className="p-2 mt-2">
                <a className="text-sm text-gray-600" href={previewUrl} target="_blank" rel="noreferrer">View email (preview)</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Submitting...' : 'Sign up'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
