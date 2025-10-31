import { useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate('/', { replace: true });
    };

    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
