/**
 * @typedef {Object} SimpleGateway
 * @property {string} serial
 * @property {string} name
 */

/**
 * @typedef {Object} gateway
 * @property {string} serial
 * @property {string} name
 * @property {number} ip
 * @property {number[]} devices
 */

/**
 * @typedef {Object} GatewayStorage
 * @property {string} serial
 * @property {string} name
 * @property {number} ip
 */

/**
 * @typedef {Object} OptionalGateway
 * @property {string} [serial]
 * @property {string} [name]
 * @property {number} [ip]
 * @property {number[]} [devices]
 */

/**
 * @typedef {Object} SimpleDevice
 * @property {number} uid
 * @property {string} vendor
 */

/**
 * @typedef {'online'|'offline'} Status
 */

/**
 * @typedef {Object} Device
 * @property {number} uid
 * @property {string} vendor
 * @property {number} date_created
 * @property {Status} status
 */

/**
 * @typedef {Object} OptionalDevice
 * @property {string} [uid]
 * @property {string} [vendor]
 * @property {Status} [status]
 */
