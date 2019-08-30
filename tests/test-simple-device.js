/**
 * Copyright (c) 2019 Devicebook Inc.  All rights reserved.
 */

 /**
  * Test UNO-SimpleDevice with serial-proxy.
  *  - this test blinks the bulitin LED once per second
  */

let net = require('net');
const log4js = require('log4js');
const logger = log4js.getLogger();

logger.level = 'debug';

const TcpHost = '127.0.0.1';
const TcpPort = 8989;

let timer;

function blinkBuiltInLED() {
  let buffer = new Buffer([1, 0x80]);
  logger.debug('to device:', buffer.toString('hex'), '|', buffer.toString());
  client.write(buffer);
}

const client = net.createConnection({ host: '127.0.0.1', port: 8989 }, () => {
  logger.info(`Connected to ${TcpHost}:${TcpPort}`);
  timer = setInterval(blinkBuiltInLED, 1000);
});
client.on('data', (data) => {
  logger.debug('from device:', data.toString('hex'), '|', data.toString());
});
client.on('error', (error) => {
  logger.info('socket error: ' + error);
  process.exit();
});
client.on('end', () => {
  clearInterval(timer);
  logger.info('disconnected from device');
});
