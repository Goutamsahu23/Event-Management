
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export function useAuth() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isAuthenticated = !!auth.token;
  const isLoading = auth.status === 'loading';
  const user = auth.profile;

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    isAuthenticated,
    isLoading,
    user,
    logout: handleLogout,
  };
}
