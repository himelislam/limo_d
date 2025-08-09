import api from './config';

export const submitWidgetBooking = async (widgetId, bookingData) => {
  const response = await api.post(`/bookings/widget/${widgetId}`, bookingData);
  return response.data;
};

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};