#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 20

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

byte colors[NUM_LEDS][3];

void initColors() {
  for (int i = 0; i < NUM_LEDS; i++) {
    for (int j = 0; j < 3; j++) {
      colors[i][j] = 127;
    }
  }
}

void setColors() {
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(
      colors[i][0], colors[i][1], colors[i][2]
    ));
  }
}

/*
 * Modify all the colors based on `n`, the LED that was pushed
 */
void modifyColors(int n) {
  for (int i = 0; i < NUM_LEDS; i++) {
    byte r = n*17 + i*37;
    byte g = n*91 + i*52;
    byte b = n*31 + i*123;

    if (n % 2 == 1) {
      colors[i][0] += r;
      colors[i][1] += g;
      colors[i][2] += b;
    } else {
      colors[i][0] -= r;
      colors[i][1] -= g;
      colors[i][2] -= b;
    }
  }
}

void setup() {
  // put your setup code here, to run once:

  initColors();

  strip.begin();
  strip.setBrightness(16);
  setColors();
  strip.show(); // Initialize all pixels to 'off'

  
}

void loop() {
  // put your main code here, to run repeatedly:

  modifyColors(random(0, NUM_LEDS-1));
  setColors();
  strip.show();

  delay(500);

}
