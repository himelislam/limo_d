import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../api/auth';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log("stored token")
        try {
          const userData = await getCurrentUser(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data, token } = await loginUser(email, password);
    setUser(data);
    setToken(token);
    localStorage.setItem('token', token);
    navigate(`/${user.role}/dashboard`);
  };

  const register = async (userData) => {
    const { data, token } = await registerUser(userData);
    setUser(data);
    setToken(token);
    console.log('token set', token);
    console.log('user set', data);
    localStorage.setItem('token', token);
    navigate(`/${user.role}/dashboard`);
    console.log("first")
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
