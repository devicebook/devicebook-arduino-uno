#!/usr/bin/env node

/**
 * Copyright (c) 2019 Devicebook Inc.  All rights reserved.
 */

/**
 * Future improvements
 * 1. detect when a COM port is removed (e.g. USB)
 * 2. load config from a JSON file
 * 3. enable mdns responder after device is ready
 */

const SerialPort = require('serialport');
const os = require('os');
const net = require('net');
const multicastdns = require('multicast-dns');
const txt = require('dns-txt')({ binary: true });
const commander = require('commander');
const log4js = require('log4js');
const logger = log4js.getLogger();
const datalog = log4js.getLogger('data');

// default log level
logger.level = 'info';
datalog.level = 'debug';

// default configuration for Arduino Uno
var config = {
  comPort: 4,
  localecho: false,
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  tcpPort: 8989,

  mfr: 'Arduino',
  md: 'Uno via USB',
  instanceName: '0001'
};


function openSerialPort(comPortNum) {
  var selectedPort = 'COM' + comPortNum;
  const openOptions = {
    baudRate: config.baudRate,
    dataBits: config.dataBits,
    parity: config.parity,
    stopBits: config.stopBits,
  }

  logger.info(`# Open ${selectedPort} with ${JSON.stringify(openOptions, null, null)}\r\n`);
  const port = new SerialPort(selectedPort, openOptions);

  port.on('error', err => {
    logger.verbose(`# ${selectedPort} error`);
    throw new Error('COM port error');
  })

  port.on('data', (data) => {
    datalog.debug('from device: ', data.toString('hex'), '|', data.toString());
  });

  return port;
}


function associateSockToDevice(sock, comPort) {
  let remotePort = sock.remotePort;
  let remoteAddress = sock.remoteAddress;

  function sendToSocket(data) {
    sock.write(data);
  }

  function sendToCom(data) {
    datalog.debug('to device: ', data.toString('hex'), '|', data.toString());
    comPort.write(data);
  }

  function tearDown() {
    comPort.removeListener('data', sendToSocket);
    sock.removeListener('data', sendToCom);
    logger.info(`# DISCONNECTED: ${remoteAddress}:${remotePort}`);
  }

  function setup() {
    logger.info(`# CONNECTED: ${remoteAddress}:${remotePort}`);
    comPort.on('data', sendToSocket);
    sock.on('data', sendToCom);
    sock.on('end', tearDown);
    sock.on('error', tearDown);
  }

  setup();
}

function createConnector() {
  const comPortNum = config.comPort;
  let comPort = openSerialPort(comPortNum);
  var server = new net.Server();
  server.listen({
    port: config.tcpPort,
  });
  server.on('connection', (sock) => {
    logger.debug('on connection');
    associateSockToDevice(sock, comPort);
  });
}


//  Returns the MAC address of the first !internal interface
//
function findAddress() {
  var nets = os.networkInterfaces();
  for (const ifaceName in nets) {
    for (let iface of nets[ifaceName]) {
      if (iface.family == 'IPv4' && !iface.internal) {
        logger.debug(iface);
        return { ip: iface.address, mac: iface.mac };
      }
    }
  }
  return 'error';
}


function initConfig() {
  const addr = findAddress();
  config.ipAddress = addr.ip;
  config.mac = addr.mac;
  config.hwid = config.mac.replace(/:/g, '') + config.instanceName;
  config.deviceName = `${config.mfr}-${config.md}-${config.hwid}`;
  config.hostname = config.deviceName + '.local';
  config.serviceType = '_devicebook';
  config.serviceProto = '_tcp';
  config.serviceName = `${config.serviceType}.${config.serviceProto}.local`;
  config.serviceInstance = `${config.deviceName}.${config.serviceType}.${config.serviceProto}.local`;
  config.txtData = [ `mfr=${config.mfr}`, `md=${config.md}`, `hwid=${config.hwid}`, 't=b0', 'v=1.0' ];
}


function enableMDNSResponder() {
  var mdns = multicastdns({
    multicast: true,
    loopback: true,
    reuseAddr: true
  });

  function sendResponse(rinfo) {
    mdns.respond({
      answers: [
        {
          name: config.serviceName,
          type: 'PTR',
          ttl: 4500,
          data: config.serviceInstance
        },
        {
          name: config.serviceInstance,
          type: 'SRV',
          ttl: 4500,
          data: {
            port: config.tcpPort,
            target: config.hostname
          }
        },
        {
          name: config.serviceInstance,
          type: 'TXT',
          ttl: 4500,
          data: config.txtData
        }
      ],
      additionals: [
        {
          name: config.hostname,
          type: 'A',
          ttl: 120,
          data: config.ipAddress
        }
      ]
    }, rinfo, (err) => { if (err) { log.debug('mdns.respond:', err); } });
  }

  sendResponse();

  mdns.on('query', (query, rinfo) => {
    if (query.questions[0]) {
      const questionName = query.questions[0].name.toLowerCase();
      if (questionName === config.serviceName) {
        logger.debug(`Respond to DNS-SD: ${rinfo.address}:${rinfo.port}`);
        sendResponse(rinfo);
      } else if (questionName === config.hostname && query.questions[0].type === 'A') {
        logger.debug(`Respond to A query: ${rinfo.address}:${rinfo.port}`);
        // unicast response
        mdns.respond({
          answers: [{
            name: config.hostname,
            type: 'A',
            ttl: 120,
            data: ipAddress
          }]
        }, rinfo);
      }
    }
  });
}

function main() {

  commander
    .version('0.1.0')
    .option('-c, --com <n>', 'Com Port Number', parseInt)
    .option('-M, --mfr <name>', 'Device manufacturer. Defaults to \'Arduino\'')
    .option('-m, --md <name>', 'Device model. Defaults to \'Uno via USB\'')
    .option('-d, --debug', 'Turn on debug log')
    .parse(process.argv);

  if (commander.com) {
    config.comPort = commander.com;
  }

  if (commander.mfr) {
    config.mfr = commander.mfr;
  }

  if (commander.md) {
    config.md = commander.md;
  }

  if (commander.debug) {
    logger.level = 'debug';
    datalog.level = 'debug';
  }

  initConfig();

  logger.debug(config);

  // Connect to COM port
  createConnector();

  // Enable mDNS Responder
  enableMDNSResponder();
}

main();
