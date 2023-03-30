import Server, { getInterface } from 'gateway-bg-interface';

class DataProvider extends getInterface() {}

new Server(new DataProvider(), 8000).start();
