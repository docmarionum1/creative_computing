#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 30
#define NUM_ROWS 6
#define DELAY 50

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

// The current colors of the LEDs
byte colors[NUM_LEDS][3];

// The state of the buttons
bool buttonState[NUM_LEDS];

// The threshold values for the softpots to register a button press
const int thresholds[6][2] = {
    {100, 120},
    {180, 220},
    {300, 360},
    {400, 550},
    {600, 720},
    {850, 970} 
  };

/*
 * Init Stuff that needs initing
 */
void initStuff() {
  for (int i = 0; i < NUM_LEDS; i++) {
    // Set the starting colors to a medium brightness white
    for (int j = 0; j < 3; j++) {
      colors[i][j] = 127;
    }

    // Set the button states to false
    buttonState[i] = false;
  }
}

/*
 * Apply the current colors array to the neopixels
 */
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
    // Generate some "random" rgb offsets
    byte r = n*17 + i*37;
    byte g = n*91 + i*52;
    byte b = n*31 + i*123;

    // If the button was odd, add the rgb values,
    // Else subtract them
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

/*
 * Get the state of a button
 * button is the index of the button from 0-29
 * See top of file for details on button/LED layout.
 * 
 */
bool detectButton(int button) {
  // Get the row the button is on based on it's index
  int row = button / NUM_ROWS;

  // Read the value of the softpot for that row
  int val = analogRead(row);

  // Debugging
  //Serial.println(val);

  // Figure out the LED's position along the softpot 
  // For even rows the higher the index, the further along the
  // softpot the LED will be.  For odd rows it's reversed.
  int idx = button % NUM_ROWS;

  // If row is odd
  if (row % 2 == 1) {
    //Reverse the index
    // 0 -> 5, 1 -> 4, 2 -> 3, 3 -> 2, 4 -> 1, 5 -> 0
    idx = 5 - idx;
  }

  // Debugging
  //Serial.println((String)"button = " + button + (String)" row = " + row + (String)" idx = " + idx);
  //return random(0,2);

  if (val > thresholds[idx][0] && val < thresholds[idx][1]) {
    return true;
  }

  return false;
}

void setup() {
  initStuff();

  strip.begin();
  strip.setBrightness(16);
  setColors();
  strip.show(); // Initialize all pixels to 'off'

  Serial.begin(9600);
}

void loop() {
  // Loop through all the LEDS/buttons and see whether they are being pressed.
  // If so, and the state has changed, update the colors and save the state.
  for (int i = 0; i < NUM_LEDS; i++) {
    bool newState = detectButton(i);
    if (newState && !buttonState[i]) {
      modifyColors(i);
    }
    buttonState[i] = newState;
  }

  // Set the colors to the neopixels and the refresh them
  setColors();
  strip.show();

  delay(DELAY);

}
