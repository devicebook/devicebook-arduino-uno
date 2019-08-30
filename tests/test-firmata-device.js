/**
 * Copyright (c) 2019 Devicebook Inc.  All rights reserved.
 */

 /**
  * Test UNO-FirmataDevice with serial-proxy.
  *  - this test blinks the bulitin LED once per second
  */

const net = require('net');
const EventEmitter = require('events');
const Firmata = require("firmata");
const log4js = require('log4js');
const logger = log4js.getLogger();

logger.level = 'debug';

const TcpHost = '127.0.0.1';
const TcpPort = 8989;
const BUILTIN_LED = 13;

class Transport extends EventEmitter {

  constructor() {
    super();
    logger.info(`Connect to ${TcpHost}:${TcpPort}`);
    this.client = net.createConnection({ host: TcpHost, port: TcpPort }, err => {
      if (err) {
        logger.info('Invalid IP/Port Configuration');
        process.exit();
      } else {
        this.client.on('error', (error) => {
          logger.info('socket error: ' + error);
          process.exit();
        });
        this.client.on('close', () => {
          logger.info('socket closed.');
          process.exit();
        });
        this.client.on('data', (data) => {
          this.emit('data', data);
        });
      }
    });
  }

  write(uint8Array) {
    if (this.client) {
      this.client.write(uint8Array);
    }
  }

  destroy() {
    if (this.client) {
      this.client.destroy();
    }
  }
}

function blinkBuiltInLED()
{
  board.digitalWrite(BUILTIN_LED, 1);
  setTimeout(() => {
    board.digitalWrite(BUILTIN_LED, 0);
  }, 200);
}

const transport = new Transport();
const board = new Firmata(transport, { skipCapabilities: true });

board.on("ready", () => {
  // Arduino is ready to communicate
  logger.info('board is ready');
  board.reset();
  board.pinMode(BUILTIN_LED, board.MODES.OUTPUT);
  setInterval(blinkBuiltInLED, 1000);
});