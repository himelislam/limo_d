// JSDoc type definitions for better IDE support

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string} [message]
 * @property {string} [error]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success
 * @property {Array} data
 * @property {number} count
 * @property {Object} pagination
 */

/**
 * @typedef {Object} Trip
 * @property {string} _id
 * @property {string} origin
 * @property {string} destination
 * @property {string} status
 * @property {Date} scheduledTime
 * @property {Object} vehicle
 * @property {Object} driver
 * @property {Object} passenger
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} _id
 * @property {string} make
 * @property {string} model
 * @property {string} licensePlate
 * @property {number} seatingCapacity
 * @property {string} status
 */

/**
 * @typedef {Object} Driver
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} licenseNumber
 * @property {string} status
 */

export {};