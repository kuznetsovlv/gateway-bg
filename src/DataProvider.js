import { getInterface } from 'gateway-bg-interface';
import { v4 } from 'uuid';

const MAX_DEVICES_PER_GATEWAY = 10;

/**
 * @typedef {Object} SimpleGateway
 * @property {string} serial
 * @property {string} name
 */

/**
 * @typedef {Object} Gateway
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
 * @property {number} [dateCreated]
 * @property {Status} [status]
 */

class Bounds {
  /**
   * @type {Map<string, Set<number>>}
   */
  $gateways = new Map();
  /**
   * @type {Map<number, Set<string>>}
   */
  $devices = new Map();

  /**
   * @param {string} gateWay
   * @param {number} device
   */
  bind({ gateWay, device }) {
    if (!this.$gateways.has(gateWay)) {
      this.$gateways.set(gateWay, new Set());
    }

    if (this.$gateways.get(gateWay).size >= MAX_DEVICES_PER_GATEWAY) {
      throw new Error('Maximum device count exceeded');
    }

    this.$gateways.get(gateWay).add(device);

    if (!this.$devices.has(device)) {
      this.$devices.set(device, new Set());
    }

    this.$devices.get(device).add(gateWay);
  }

  /**
   * @param {string} gateWay
   * @param {number} device
   */
  unbind({ gateWay, device }) {
    if (!this.$gateways.has(gateWay) || !this.$devices.has(device)) {
      return;
    }

    this.$gateways.get(gateWay).delete(device);
    this.$devices.get(device).delete(gateWay);
  }

  /**
   * Returns list of bound devices
   * @param gateway
   * @return number[]
   */
  getDevices(gateway) {
    return this.$gateways.has(gateway)
      ? Array.from(this.$gateways.get(gateway))
      : [];
  }
}

export class Data {
  /**
   * @type {Map<string, GatewayStorage>}
   */
  $gateways = new Map();

  /**
   * @type {Map<number, Device>}
   */
  $devices = new Map();

  $bounds = new Bounds();

  /**
   * @public
   * Returns list of available gateways
   * @return {SimpleGateway[]}
   */
  getGateWays() {
    return Array.from(this.$gateways.values()).map(({ serial, name }) => ({
      serial,
      name
    }));
  }

  /**
   * @public
   * Returns information about gateway
   * @param {string} serial - gateway's unique serial number
   * @return {Gateway|null}
   */
  getGateWay(serial) {
    if (!this.$gateways.has(serial)) {
      return null;
    }

    return {
      ...this.$gateways.get(serial),
      devices: this.$bounds.getDevices(serial)
    };
  }

  /**
   * @public
   * Modifies or creates new gateway
   * @param {OptionalGateway} gateway
   * @return {{serial: string}}
   */
  putGateway(gateway) {
    const { serial: currentSerial, devices, ...rest } = gateway;

    if (!currentSerial || !this.$gateways.has(currentSerial)) {
      const { name, ip } = rest;

      if (!name || typeof name !== 'string') {
        throw new Error("Gateway's name not set");
      }
      if (!Number.isInteger(ip) || isNaN(ip) || ~~ip !== ip) {
        throw new Error('Invalid IP');
      }

      const serial = currentSerial || v4();

      this.$gateways.set(serial, { serial, name, ip });

      if (Array.isArray(devices)) {
        devices.forEach(device =>
          this.$bounds.bind({ gateWay: serial, device })
        );
      }

      return { serial };
    }

    this.$gateways.set(currentSerial, {
      ...this.$gateways.get(currentSerial),
      ...rest
    });

    if (Array.isArray(devices)) {
      this.$bounds
        .getDevices(currentSerial)
        .forEach(device =>
          this.$bounds.unbind({ gateWay: currentSerial, device })
        );
      devices.forEach(device =>
        this.$bounds.bind({ gateWay: currentSerial, device })
      );
    }

    return { serial: currentSerial };
  }

  /**
   * @public
   * Deletes gateway
   * @param {string} serial - gateway's unique serial number
   */
  deleteGateway(serial) {
    if (this.$gateways.has(serial)) {
      this.$bounds
        .getDevices(serial)
        .forEach(device => this.$bounds.unbind({ gateWay: serial, device }));
      this.$gateways.delete(serial);
    }
  }
}

export default class DataProvider extends getInterface() {
  /**
   * @param {Data} data
   */
  constructor(data) {
    super();

    this.$data = data;
  }

  /**
   * @public
   * Returns list of available gateways
   * @return {SimpleGateway[]}
   */
  getGateways() {
    return this.$data.getGateWays();
  }

  /**
   * @public
   * Returns information about gateway
   * @param {string} serial - gateway's unique serial number
   * @return {Gateway|null}
   */
  getGateway(serial) {
    return this.$data.getGateWay(serial);
  }

  /**
   * @public
   * Modifies or creates new gateway
   * @param {OptionalGateway} gateway
   * @return {{serial: string}}
   */
  putGateway(gateway) {
    return this.$data.putGateway(gateway);
  }

  /**
   * @public
   * Deletes gateway
   * @param {string} serial - gateway's unique serial number
   */
  deleteGateway(serial) {
    this.$data.deleteGateway(serial);
  }
}
