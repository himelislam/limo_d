// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Common API Headers
export const API_HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
  CONTENT_TYPE_MULTIPART: 'multipart/form-data'
};

// Trip Status Values
export const TRIP_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  ON_THE_WAY: 'on-the-way',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Vehicle Status Values
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  DRIVER: 'driver',
  PASSENGER: 'passenger'
};