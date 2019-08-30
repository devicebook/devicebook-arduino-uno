/**
 * Copyright (c) 2019 Devicebook Inc.  All rights reserved.
 */

#include "UNO-IO.h"

void
setup()
{
  Serial.begin(9600);
  deviceSetup();
  while (!Serial) {
    ; // wait for serial port to connect. Needed for ATmega32u4-based boards and
    // Arduino 101
  }
}

void
loop()
{
  if (Serial) {
    uint8_t cmdBuffer[4];
    int cmdLen = 0;
    int bufLen = 0;
    while (Serial) {
      deviceUpdate();
      // Read and process a hwPanel command from Adapter
      // The Adapter sends comamnd in a sequence of bytes.
      //  - first byte is the length of the command frame
      //  - second byte is the command
      //  - the rest is the data, if any
      //
      if (Serial.available()) {
        uint8_t c = Serial.read();
        if (cmdLen == 0) {
          if (c >= 1 && c <= 4) {
            cmdLen = c;
            bufLen = 0;
          } else {
            // invalid length, skip
          }
        } else {
          cmdBuffer[bufLen++] = c;
        }
        if (cmdLen >= 1 && cmdLen == bufLen) {
          processCmd(cmdBuffer, cmdLen);
          cmdLen = 0;
          bufLen = 0;
        }
      }
      reportEvents();
    }
  }
}

/**
   Process hwPanel commands from Adapter
   The Adapter sends comamnd in a sequence of bytes.
   - first byte is the length of the command frame excluding the length
   - second byte is the command
   - the rest is the data, if any
*/
void
processCmd(uint8_t* cmd, int len)
{
  if (len == 1) {
    switch (cmd[0]) {
      case 0x80:
        blinkBuiltInLed();
        break;
    }
  }
}

/**
   Report interrupt-driven events to Devicebook Cloud
   - first byte is the length of the event frame excluding the length
   - second byte identifies the variable to be updated
   - the rest is the data
*/
void
reportEvents()
{
  unsigned long ts = getLastInputTimestamp();
  if (ts) {
    uint8_t buf[6];
    buf[0] = 5;
    buf[1] = 0XC1;
    buf[2] = ts & 0xff;
    buf[3] = (ts >> 8) & 0xff;
    buf[4] = (ts >> 16) & 0xff;
    buf[5] = (ts >> 24) & 0xff;
    Serial.write(buf, 6);
  }
}
