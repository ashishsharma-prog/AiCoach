import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      // Reload the page to trigger AuthContext to pick up the new JWT
      window.location.href = '/';
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return <div className="flex items-center justify-center min-h-screen">Logging you in...</div>;
};

export default OAuthSuccess; 