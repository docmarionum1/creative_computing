#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 30
#define NUM_ROWS 5
#define DELAY 1
#define TOGGLE_PIN 13

/*
 * Button/LED Layout
 * Each row is a a softpot
 * arranged from min->max readings on the softpot
 * and each number is the button index in the neopixel chain
 *
 * 0  1  2  3  4  5
 * 11 10 9  8  7  6
 * 12 13 14 15 16 17
 * 23 22 21 20 19 18
 * 24 25 26 27 28 19
 *
 * The first row goes into A0, the second in A1 and so forth,
 * with the fifth going to A4.
 *
 * The neopixel data in pin goes to pin 6.
 */
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

byte loopCount = 0;

void setup() {
  pinMode(TOGGLE_PIN, INPUT);

  strip.begin();
  strip.setBrightness(64);
  strip.show(); // Initialize all pixels to 'off'

  Serial.begin(115200);

  while (!handshake()){}
}

bool handshake() {
  while (Serial.available() < 4) {}
  if (Serial.read() == 1 && Serial.read() == 3 && Serial.read() == 3 && Serial.read() == 7) {
    Serial.println("L:255");
    return true;
  }
  return false;
}

void readPixelColor() {
  for (int i = 0; i < NUM_LEDS; i++) {

    // Unpack color from 6 bits
    byte v = Serial.read();
    byte r = map(v & B000011, 0, 3, 0, 255);
    byte g = map((v & B001100) >> 2, 0, 3, 0, 255);
    byte b = map((v & B110000) >> 4, 0, 3, 0, 255);

    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
  Serial.println("L:sync");
}

void sendPotState() {
  String potState = "I:";
  for (int i = 0; i < NUM_ROWS; i++) {
    //potState += (String)i + "=" + (String)analogRead(i);
    potState += (String)analogRead(i);
    if (i < NUM_ROWS - 1) {
      potState += ",";
    }
  }
  Serial.println(potState);
}

void loop() {
  if (Serial.available() == NUM_LEDS) {
      readPixelColor();
  }

  // Every ~50ms send the pot state
  if ((loopCount+=DELAY) % 50 == 0) {
    sendPotState();
  }

  delay(DELAY);
}
