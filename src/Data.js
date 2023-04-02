import './types';
import { v4 } from 'uuid';

import { uidCreator } from './utils';

const MAX_DEVICES_PER_gateway = 10;

const getUid = uidCreator();

class Bounds {
  /**
   * @private
   * @type {Map<string, Set<number>>}
   */
  $gateways = new Map();
  /**
   * @private
   * @type {Map<number, Set<string>>}
   */
  $devices = new Map();

  /**
   * @param {string} gateway
   * @param {number} device
   */
  bind({ gateway, device }) {
    if (!device || !Number.isInteger(device)) {
      throw new Error(`Wrong device uid '${device}'`);
    }
    if (!this.$gateways.has(gateway)) {
      this.$gateways.set(gateway, new Set());
    }

    if (this.$gateways.get(gateway).size >= MAX_DEVICES_PER_gateway) {
      throw new Error('Maximum device count exceeded');
    }

    this.$gateways.get(gateway).add(device);

    if (!this.$devices.has(device)) {
      this.$devices.set(device, new Set());
    }

    this.$devices.get(device).add(gateway);
  }

  /**
   * @param {string} gateway
   * @param {number} device
   */
  unbind({ gateway, device }) {
    if (!device || !Number.isInteger(device)) {
      throw new Error(`Wrong device uid '${device}'`);
    }

    if (!this.$gateways.has(gateway) || !this.$devices.has(device)) {
      return;
    }

    this.$gateways.get(gateway).delete(device);
    this.$devices.get(device).delete(gateway);
  }

  /**
   * Returns list of bound devices
   * @param {string} gateway
   * @return {number[]}
   */
  getDevices(gateway) {
    return this.$gateways.has(gateway)
      ? Array.from(this.$gateways.get(gateway))
      : [];
  }

  /**
   * Returns list of bound gateways
   * @param {number} device
   * @return {string[]}
   */
  getGateways(device) {
    return this.$gateways.has(device)
      ? Array.from(this.$gateways.get(device))
      : [];
  }
}

/*
 * Perhaps one day we will decide to fill an instance of this class with data at the time of initialization.
 * I think it' s not DataProvider's function so I decided to separate this classes.
 */
export default class Data {
  /**
   * @private
   * @type {Map<string, GatewayStorage>}
   */
  $gateways = new Map();

  /**
   * @private
   * @type {Map<number, Device>}
   */
  $devices = new Map();

  /**
   * @private
   * @type {Bounds}
   */
  $bounds = new Bounds();

  /**
   * @public
   * Returns list of available gateways
   * @return {SimpleGateway[]}
   */
  getGateways() {
    return Array.from(this.$gateways.values()).map(({ serial, name }) => ({
      serial,
      name
    }));
  }

  /**
   * @public
   * Returns information about gateway
   * @param {string} serial - gateway's unique serial number
   * @return {gateway|null}
   */
  getGateway(serial) {
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
   * @param {OptionalGateway}
   * @return {{serial: string}}
   */
  putGateway({ serial, devices, ...rest }) {
    if (Array.isArray(devices)) {
      for (const device of devices) {
        if (!Number.isInteger(device) || !this.$devices.has(device)) {
          throw new Error(`Wrong device uid: ${device}`);
        }
      }
    }

    if (!serial || !this.$gateways.has(serial)) {
      const { name, ip } = rest;

      if (!name || typeof name !== 'string') {
        throw new Error("gateway's name not set");
      }
      if (!Number.isInteger(ip) || isNaN(ip) || ~~ip !== ip) {
        throw new Error('Invalid IP');
      }

      serial = serial || v4();

      this.$gateways.set(serial, { serial, name, ip });

      if (Array.isArray(devices)) {
        devices.forEach(device =>
          this.$bounds.bind({ gateway: serial, device })
        );
      }
    } else {
      this.$gateways.set(serial, {
        ...this.$gateways.get(serial),
        ...rest
      });

      if (Array.isArray(devices)) {
        this.$bounds
          .getDevices(serial)
          .forEach(device => this.$bounds.unbind({ gateway: serial, device }));
        devices.forEach(device =>
          this.$bounds.bind({ gateway: serial, device })
        );
      }
    }

    return { serial };
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
        .forEach(device => this.$bounds.unbind({ gateway: serial, device }));
      this.$gateways.delete(serial);
    }
  }

  /**
   * @public
   * Returns list of available devices
   * @param {string} [serial] - unique gateway's serial number, should return all devices
   * @return {SimpleDevice[]|null}
   */
  getDevices(serial) {
    if (!serial) {
      return Array.from(this.$devices).map(({ uid, vendor }) => ({
        uid,
        vendor
      }));
    }

    if (!this.$gateways.has(serial)) {
      return null;
    }

    const result = [];

    for (const device of this.$bounds.getDevices(serial)) {
      if (this.$devices.has(device)) {
        const { uid, vendor } = this.$devices.get(device);
        result.push({ uid, vendor });
      }
    }

    return result;
  }

  /**
   * @public
   * Modifies or creates new device
   * @param {OptionalDevice}
   * @return {{uid: number}}
   */
  putDevice({ uid, ...rest }) {
    if (!uid || !this.$devices.has(uid)) {
      const { vendor, status } = rest;

      if (!vendor || typeof vendor !== 'string') {
        throw new Error('Vendor not set');
      }

      if (!status || typeof status !== 'string') {
        throw new Error('Status not set');
      }

      uid = uid || getUid();

      this.$devices.set(uid, { uid, date_created: Date.now(), status, vendor });
    } else {
      this.$devices.set(uid, { ...this.$devices.get(uid), ...rest });
    }

    return { uid };
  }

  /**
   * @public
   * Deletes device
   * @param {number} uid - gateway's unique serial number
   */
  deleteDevice(uid) {
    if (this.$devices.has(uid)) {
      this.$bounds
        .getGateways(uid)
        .forEach(gateway => this.$bounds.unbind({ gateway, device: uid }));
      this.$devices.delete(uid);
    }
  }

  /**
   * @public
   * Binds devices to gateway
   * @param {string} serial - gateway's unique serial number
   * @param {number[]} devices - list of devices' uids
   * @return {{bound: number[]}} - list of successfully bound devices' uids
   */
  bind(serial, devices) {
    if (!this.$gateways.has(serial)) {
      throw new Error(`Gateway ${serial} does not exist.`);
    }

    const success = [];

    for (const device of devices) {
      try {
        this.$bounds.bind({ gateway: serial, device });
        success.push(device);
      } catch (error) {
        console.error(error);
      }
    }

    return { bound: success };
  }

  /**
   * @public
   * Unbinds devices to gateway
   * @param {string} serial - gateway's unique serial number
   * @param {number[]} devices - list of devices' uids
   */
  unbind(serial, devices) {
    if (!this.$gateways.has(serial)) {
      throw new Error(`Gateway ${serial} does not exist.`);
    }

    devices.forEach(device => this.$bounds.unbind({ gateway: serial, device }));
  }
}
