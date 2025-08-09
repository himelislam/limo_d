import api, { handleApiResponse, handleApiError } from './index';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me'
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await api.get(AUTH_ENDPOINTS.ME, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};
