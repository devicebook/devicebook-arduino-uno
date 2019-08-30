/**
 * Copyright (c) 2019 Devicebook Inc.  All rights reserved.
 */

/**
 * Define the pin number of the builtin LED.  The PIN is board dependent.
 *   Set pin output to HIGH to turn off LED
 *   and to LOW to turn on LED.
 */
const int BUILTIN_LED_PIN = LED_BUILTIN;
const int BUILTIN_LED_OFF = LOW;
const int BUILTIN_LED_ON = HIGH;

// Builtin LED state
static int ledState = BUILTIN_LED_OFF;
static unsigned long offAfter = 0;

// the number of the external LED pin
const int INPUT_PIN = 7;

const int inputDebouncingInterval = 100; // 100ms
static int prevInputState;
static unsigned int lastInputTimestamp;
static unsigned int lastInputUpdate;

/**
 * Initialize device state upon boot
 */
void
deviceSetup()
{
  // enable builtin LED
  pinMode(BUILTIN_LED_PIN, OUTPUT);
  digitalWrite(BUILTIN_LED_PIN, ledState);

  // enable INPUT PIN
  pinMode(INPUT_PIN, INPUT_PULLUP);
  prevInputState = HIGH;
  lastInputTimestamp = 0;
  lastInputUpdate = 0;
}

/**
 *  Called during loop() to process device events.
 */
void
deviceUpdate()
{
  if (ledState == BUILTIN_LED_ON && millis() > offAfter) {
    ledState = BUILTIN_LED_OFF;
    digitalWrite(BUILTIN_LED_PIN, ledState);
  }

  int in = digitalRead(INPUT_PIN);
  if (prevInputState == HIGH && in == LOW) {
    if (millis() - lastInputUpdate > inputDebouncingInterval) {
      lastInputUpdate = millis();
      lastInputTimestamp = millis();
    }
  }
  prevInputState = in;
}

/**
 * Turn On Builtin LED and set the time to turn it off
 */
void
blinkBuiltInLed()
{
  ledState = BUILTIN_LED_ON;
  digitalWrite(BUILTIN_LED_PIN, ledState);
  offAfter = millis() + 200; // keep it on for 200ms
}

/**
 * Report the timestamp of last input change
 */
unsigned long
getLastInputTimestamp()
{
  unsigned long t = lastInputTimestamp;
  lastInputTimestamp = 0;
  return t;
}
