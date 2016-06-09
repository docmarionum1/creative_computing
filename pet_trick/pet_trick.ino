#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 30


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

int detectButton(int row) {
  int val = analogRead(row);

  Serial.println(val);

  if (val > 100 && val < 120) {
    return 0;
  } else if (val > 180 && val < 220) {
    return 1;
  } else if (val > 300 && val < 360) {
    return 2;
  } else if (val > 400 && val < 550) {
    return 3;
  } else if (val > 600 && val < 720) {
    return 4;
  } else if (val > 850 && val < 970) {
    return 5;
  }

  return -1;
}

void setup() {
  // put your setup code here, to run once:

  initColors();

  strip.begin();
  strip.setBrightness(16);
  setColors();
  strip.show(); // Initialize all pixels to 'off'

  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:

  /*modifyColors(random(0, NUM_LEDS-1));
  setColors();
  strip.show();*/

  int led = detectButton(5);
  if (led > -1) {
    //strip.setPixelColor(led, 255);
    modifyColors(led);
    setColors();
  }

  strip.show();

  //Serial.println(analogRead(5));

  delay(50);

}
