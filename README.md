# Connect Arduino Uno to Devicebook Cloud

Devicebook Cloud supports fast prototyping using Arduino Uno, supporting connections via the USB serial connection, Bluetooth SPP module (e.g. HC-06) or Bluetooth BLE module (e.g., HC-08).   This library demonstrates the how to program the SoftDevice Adapter in the Devicebook Cloud to interact with the Arduino Uno board.  One example uses a simple serial-based protocol format.  Another example uses the firmata protocol.

Devicebook Cloud can also support devices connecting via WiFi through a Bridge or connecting directly to Cloud by TLS.  Please refer to the Devicebook Bridge Connector library and Devicebook Cloud Connector Library for details.

# Supported Platform

This library has been ported and tested on Arduino Uno, with 3 kinds of connections.
* Connecting via USB serial port
* Connecting via a HC-06 Bluetooth SPP module
* Connecting via a HC-08 Bluetooth BLE module

# Installation this library

The library is packaged in Arduino Library rev 2.1 format, and works the Library Manager in the Arduino IDE.   It requires Arduino IDE 1.6.10 or later, but Arduino 1.8.21 or newer is recommended.

The library is hosted at https://github.com/devicebook/devicebook-arduino-uno

To install:

* Download the ZIP file from the URL list above.  Click the "Zip" button on the Github repositary page.
* Unzip and place the devicebook-arduino-bridge-connector folder into your Sketchbook Libraries folder.  The location of your Sketchbook location is under File->Preferenes->Setting->Sketchbook location.  The default location is C:/Users/<user>/Documents/Arduino.   The Sketch Libraries folder would be C:/Users/<user>/Documents/Arduino/libraries.
* Restart the IDE.   Restart the Arduino IDE and verify that that library appears in the File->Examples menu.  Upload the UNO-FirmataDevice example to your Arduino board.

#  Install Devicebook App

You will need to run the Devicebook App on your PC.  The Devicebook App acts a bridge to connect the IoT devices in your local area network to the Devicebook Cloud.

See http://www.devicebook.com for installation instructions.

# Arduino Uno via USB

If Arduino Uno is connected via USB, run the serial-connector program to relay the USB serial port to the Devicebook App via the local IP network.  The serial-connector is a nodejs program.  See https://nodejs.org/en/ to install the nodejs runtime.

    cd serial-connector
    npm install
    node index.js [-c <COM port>]

Reminder: Exit the serial-connector before uploading an Arduino Sketch to the board.  Exit the IDE serial monitor before running the serial-connector.  Both requires exclusive access to the COM port.

# Arduino Uno via HC-06 and HC-08

Here are some information on how to wire HC-06 and HC-08 to the Arduino TX and RX pins.

The HC-06 and HC-08 has 6 pins: wakeup, VCC, GND, TXD, RXD, and State. You only need to use 4 pins: VCC, GND, TXD< RXD.

Here is how you should connect the Bluetooth module to Arduino Uno.

    HC-06/08  -->   Arduino Uno

      TXD --> RXD
      RXD --> Voltage Divider --> TXD
      GND --> GND
      VCC --> 5V


Note: While the HC-0x module will tolerate 5V power, the RXD pin can only handle 3.3V.   As the Arduino pins uses 5V logic, use a voltage divider to shift the voltage level. See https://learn.sparkfun.com/tutorials/voltage-dividers/all?print=1


After power-on the Arduino Uno and the attached module,  on your Windows PC,  go to Settings -> Devices -> Add Bluetooth or other devices.  You should be able to pair the "HC-06", "HC-08" or "SH-HC-08" device.  Once paired, the Arduino Uno device can be added from Devicebook Showroom.


# Programming Model

A device is a server,  while the software running in the Cloud is a client to the device.  In other words, the software in the Cloud issues commands to ask the device to carry an action, e.g.,  turn on the light, or request the device to report temperatures whenever there is a change.


# SoftPanel Adapter Programming

See https://www.devicebook.com/references  (TBD)


# Connect your Arduino Uno from Devicebook Cloud

Now your Arduino is ready.  Make sure the Arduino Uno is running the UNO-FirmataDevice.ino example.

* Open Devicebook App
* In Showroom, search for Arduino Uno SoftDevice, you will see
  * Arduino Uno (via USB)
  * Arduino Uno (via HC-06)
  * Arduino Uno (via HC-08)
  * Arduino Uno (via SH-HC-08)
* The first entry assumes running the serial-connector program with USB-serial.  The others are for the corresponding Bluetooth modules.  Pick the one matching your setup.
* Click on "SCAN" on the SoftDevice.  You should see your device listed.
* Add the device.
* Go to Devicebook Home -> My Devices.  Click on the device you just added.  You will see a SoftPanel allowing you to access the I/O pins.  If the connection to the device is successfull, you will see a "green" ring around the device logo on the top left corner.   A "red" ring is shown if connection is not successfully.


# Control your Arduino Uno remotely

Download the Devicebook Android App.  You can control your Arduino Uno when you are away from your Home.

To access your Arduino Uno device,  on any Devicebook App, go to Home -> My Devices and click on the Arduino Uno device.  You will enter the device detail page.  There is a SoftPanel on the left side.  You can do the following to turn on/off the on-board LED.  Give it a try.

* Execute the "SetPinMode" commamnd in the "Hardware Config" service.
  * Set pin to D13
  * Set mode to OUTPUT
  * Click Execute
* Change the output of D13 in "Digital Output" service.
  * Enter 1 and press SET, or
  * Enter 0 and press SET


# Automate your Arduino Device using DeviceScript

DeviceScript is a visual drag-and-drop language, to simplify the programming of IoT devices.  See https://www.devicebook.com/references for details (TBD).


# Fast Prototyping

Arduino Uno is a great platform for prototyping IoT devices hardware components.  With SoftPanel Adapter, now it is possiible to include software in the product prototype.  The followings are some examples that can be found on Devicebook Showroom!

* Bosch BMP280
* AMS CCS811
* Shinyei PPD42NJ
* iDesign AirQ

# Arduino-based Products

If you are interested in seeing more Arduino-based products supported on the Devicebook Cloud, the following are some examples.

* ELEGOO Smart Robot Car V3.0
* Makeblock mBot
* Makeblock mCore via Bluetooth














