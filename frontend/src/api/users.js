import api, { handleApiResponse, handleApiError } from './index';

const USERS_ENDPOINTS = {
  BASE: '/users',
  BY_ID: (id) => `/users/${id}`
};

export const getUsers = async (params = {}) => {
  try {
    const response = await api.get(USERS_ENDPOINTS.BASE, { params });
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(USERS_ENDPOINTS.BY_ID(userId));
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post(USERS_ENDPOINTS.BASE, userData);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(USERS_ENDPOINTS.BY_ID(userId), userData);
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(USERS_ENDPOINTS.BY_ID(userId));
    return handleApiResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};
