import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await getCurrentUser(storedToken);
          setUser(userData.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const userData = response.data;
      const authToken = response.token;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      // Navigate based on role (no business status checks needed)
      const userRole = userData.role;
      
      if (userRole === 'business_owner') {
        navigate('/business/dashboard');
      } else if (userRole === 'super_admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'driver') {
        navigate('/driver/dashboard');
      } else if (userRole === 'passenger') {
        navigate('/passenger/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      const user = response.data;
      const authToken = response.token;
      
      setUser(user);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      // Passengers go to dashboard after registration
      navigate('/passenger/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setUser,
    setToken,
    isAuthenticated: !!token && !!user,
    isBusinessOwner: user?.role === 'business_owner',
    isDriver: user?.role === 'driver',
    isPassenger: user?.role === 'passenger',
    isSuperAdmin: user?.role === 'super_admin',
    business: user?.business
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
