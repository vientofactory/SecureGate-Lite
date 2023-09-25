export const normalizePort = function (port: any): number {
  if (typeof port === 'number' && port >= 0) {
    return port;
  } else if (typeof port === 'number' && port < 0) {
    return 3001;
  } else if (isNaN(parseInt(port))) {
    return 3001;
  } else {
    return parseInt(port);
  }
}