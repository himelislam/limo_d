
import api from './config';

export const getTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await api.post('/trips', tripData);
  return response.data;
};

export const updateTrip = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};

export const updateTripStatus = async (id, status) => {
  const response = await api.put(`/trips/${id}/status`, { status });
  return response.data;
};

export const assignTripDriver = async (tripId, driverId, vehicleId) => {
  const response = await api.patch(`/trips/${tripId}/assign`, {
    driver: driverId,
    vehicle: vehicleId
  });
  return response.data;
};

export const getPendingTrips = async () => {
  const response = await api.get('/trips/pending');
  return response.data;
};

export const getMyTrips = async () => {
  const response = await api.get('/trips/my');
  return response.data;
};

export const getDriverTrips = async () => {
  const response = await api.get('/trips/driver');
  return response.data;
};

export const calculateFare = async (from, to, distance) => {
  const response = await api.post('/trips/calculate-fare', {
    from,
    to,
    distance
  });
  return response.data;
};

export const addTripFeedback = async (tripId, feedback) => {
  const response = await api.post(`/trips/${tripId}/feedback`, feedback);
  return response.data;
};
