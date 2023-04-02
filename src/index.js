import Server from 'gateway-bg-interface';
import Data from './Data';
import DataProvider from './DataProvider';

const MAX_PORT_VALUE = 65535;

let port = 8000;

if (process.argv.length > 4) {
  throw new Error('Incorrect number of arguments');
}

if (process.argv.length > 2) {
  const arg1 = process.argv[2];

  if (/^--port=\d{1,5}$/.test(arg1)) {
    if (process.argv.length > 3) {
      throw new Error('Incorrect number of arguments');
    }

    port = Number(arg1.split('=')[1]);
  } else if (arg1 === '-p') {
    if (process.argv.length < 4) {
      throw new Error('Port value not set');
    }

    const arg2 = process.argv[3];

    if (/^\d+$/.test(arg2)) {
      port = Number(arg2);
    } else {
      throw new Error(`Incorrect port's value '${arg2}'`);
    }
  } else {
    throw new Error(`Unknown argument '${arg1}'`);
  }

  if (!Number.isInteger(port) || port <= 0 || port > MAX_PORT_VALUE) {
    throw new Error(`Incorrect port's value '${port}'`);
  }
}

new Server(new DataProvider(new Data()), port).start();
