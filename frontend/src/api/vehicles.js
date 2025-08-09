import api from './config';

export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const getVehicle = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const updateVehicleStatus = async ({ id, status }) => {
  const response = await api.patch(`/vehicles/${id}/status`, { status });
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

export const getAvailableVehicles = async () => {
  const response = await api.get('/vehicles?status=active');
  return response.data;
};

export const assignVehicleToTrip = async (vehicleId, tripId) => {
  const response = await api.post(`/vehicles/${vehicleId}/assign-trip`, { tripId });
  return response.data;
};
