import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    login,
    logout,
    clearAuth,
    updateUser,
  } = useAuthStore();

  const isOwner = user?.role === 'owner';
  const isEmployee = user?.role === 'employee';
  
  const hasRole = (role: 'owner' | 'employee'): boolean => {
    return user?.role === role;
  };

  const getUserId = (): string | null => {
    return user?.id || null;
  };

  const getUserName = (): string => {
    return user?.name || user?.email || user?.phoneNumber || 'Unknown User';
  };

  const isUserActive = (): boolean => {
    return user?.status === 'active' || user?.status === undefined;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    
    isOwner,
    isEmployee,
    
    setUser,
    setLoading,
    setError,
    login,
    logout,
    clearAuth,
    updateUser,
    
    hasRole,
    getUserId,
    getUserName,
    isUserActive,
  };
}; 