import './types';
import { getInterface } from 'gateway-bg-interface';

import Data from './Data';

export default class DataProvider extends getInterface() {
  /**
   * @param {Data} [data]
   */
  constructor(data = new Data()) {
    super();

    this.$data = data;
  }

  /**
   * @public
   * Returns list of available gateways
   * @return {SimpleGateway[]}
   */
  getGateways() {
    return this.$data.getGateways();
  }

  /**
   * @public
   * Returns information about gateway
   * @param {string} serial - gateway's unique serial number
   * @return {gateway|null}
   */
  getGateway(serial) {
    return this.$data.getGateway(serial);
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

  /**
   * @public
   * Returns list of available devices
   * @param {string} [serial] - unique gateway's serial number, should return all devices
   * @return {SimpleDevice[]|null}
   */
  getDevices(serial) {
    return this.$data.getDevices(serial);
  }

  /**
   * @public
   * @param {number} uid
   * @return {Device|null}
   */
  getDevice(uid) {
    return this.$data.getDevice(uid);
  }

  /**
   * @public
   * Modifies or creates new device
   * @param {OptionalDevice} device
   * @return {{uid: number}}
   */
  putDevice(device) {
    return this.$data.putDevice(device);
  }

  /**
   * @public
   * Deletes device
   * @param {number} uid - gateway's unique serial number
   */
  deleteDevice(uid) {
    this.$data.deleteDevice(uid);
  }

  /**
   * @public
   * Binds devices to gateway
   * @param {string} serial - gateway's unique serial number
   * @param {number[]} devices - list of devices' uids
   * @return {{bound: number[]}} - list of successfully bound devices' uids
   */
  bind(serial, devices) {
    return this.$data.bind(serial, devices);
  }

  /**
   * @public
   * Unbinds devices to gateway
   * @param {string} serial - gateway's unique serial number
   * @param {number[]} devices - list of devices' uids
   */
  unbind(serial, devices) {
    this.$data.unbind(serial, devices);
  }
}
