import api from './index';

// Ensure consistent API_URL usage
const API_URL = '/trips';

export const getTrips = async (params = {}) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const getMyTrips = async (params = {}) => {
  const response = await api.get(`${API_URL}/my-trips`, { params });
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await api.post(API_URL, tripData);
  return response.data;
};

export const assignTrip = async (tripId, assignmentData) => {
  const response = await api.put(`${API_URL}/${tripId}/assign`, assignmentData);
  return response.data;
};

export const updateTripStatus = async (tripId, statusData) => {
  const response = await api.put(`${API_URL}/${tripId}/status`, statusData);
  return response.data;
};

export const addFeedback = async (tripId, feedbackData) => {
  const response = await api.put(`${API_URL}/${tripId}/feedback`, feedbackData);
  return response.data;
};

export const getPendingTrips = async () => {
  const response = await api.get(`${API_URL}/pending`);
  return response.data;
};

export const getAvailableResources = async (tripId) => {
  const response = await api.get(`${API_URL}/${tripId}/available-resources`);
  return response.data;
};

export const getTripById = async (tripId) => {
  const response = await api.get(`${API_URL}/${tripId}`);
  return response.data;
};

export const updateTrip = async (tripId, tripData) => {
  const response = await api.put(`${API_URL}/${tripId}`, tripData);
  return response.data;
};

// Add missing export aliases to match frontend usage
export const addTripFeedback = addFeedback;
export const assignTripToDriver = assignTrip;
