import api from './config';

export const getDrivers = async () => {
  const response = await api.get('/drivers');
  return response.data;
};

export const getDriver = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};

export const updateDriverStatus = async ({ id, status }) => {
  const response = await api.patch(`/drivers/${id}/status`, { status });
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};

export const getAvailableDrivers = async () => {
  const response = await api.get('/drivers?status=available');
  return response.data;
};

export const assignDriverToTrip = async (driverId, tripId) => {
  const response = await api.post(`/drivers/${driverId}/assign-trip`, { tripId });
  return response.data;
};
