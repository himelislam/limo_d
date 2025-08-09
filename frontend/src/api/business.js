
import api from './config';

export const getBusinesses = async () => {
  const response = await api.get('/business');
  return response.data;
};

export const getActiveBusinesses = async () => {
  const response = await api.get('/business/active');
  return response.data;
};

export const getMyBusiness = async () => {
  const response = await api.get('/business/my-business');
  return response.data;
};

export const registerBusiness = async (businessData) => {
  const response = await api.post('/business/register', businessData);
  return response.data;
};

export const createBusiness = async (businessData) => {
  const response = await api.post('/business', businessData);
  return response.data;
};

export const updateBusiness = async (businessData) => {
  const response = await api.put('/business/my-business', businessData);
  return response.data;
};

export const updateBusinessSettings = async (settings) => {
  const response = await api.put('/business/my/settings', settings);
  return response.data;
};

export const deleteBusiness = async (id) => {
  const response = await api.delete(`/business/${id}`);
  return response.data;
};

export const updateBusinessStatus = async (id, status) => {
  const response = await api.patch(`/business/${id}/status`, { status });
  return response.data;
};

export const getBusinessStats = async () => {
  const response = await api.get('/business/my/stats');
  return response.data;
};

export const getBusinessWidget = async (widgetId) => {
  const response = await api.get(`/business/widget/${widgetId}`);
  return response.data;
};

export const getBusinessByWidgetId = async (widgetId) => {
  const response = await api.get(`/business/widget/${widgetId}/info`);
  return response.data;
};
