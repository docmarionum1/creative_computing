#include <Adafruit_NeoPixel.h>

#define LED_PIN 6
#define NUM_LEDS 30
#define NUM_ROWS 6
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

// State to handle whether we're sending input data to the computer
// Or recieving data from the computer for the RGB display
// 0 - init
// 1 - read RGB
// 2 - send input
#define RGB 1
#define POT 2
//int state = 0;

// Special value to signify the end of sending LED states
#define SYNC 255

//L(ED), I(NPUT), D(EBUG)

byte loopCount = 0;

void setup() {
  pinMode(TOGGLE_PIN, INPUT);

  strip.begin();
  strip.setBrightness(16);
  strip.show(); // Initialize all pixels to 'off'

  Serial.begin(115200);

  /*while (Serial.available() == 0) {
    // Look for magic value 1337 to make sure we're ready
    
    /*if (Serial.readStringUntil('\n') == "1337\r") {
      //Serial.println("D:1337");
      Serial.println("L:start");
      //state = 1;
      break;
    }*/
  //}

  //Serial.println(Serial.readStringUntil('\n'));*/
  while (!handshake()){}
  
  
}

bool handshake() {
  while (Serial.available() < 4) {}
  if (Serial.read() == 1 && Serial.read() == 3 && Serial.read() == 3 && Serial.read() == 7) {
    Serial.println("L:-1");
    return true;
  }
  return false;
}

void readPixelColor() {
  byte i = Serial.read();
  byte r = Serial.read();
  byte g = Serial.read();
  byte b = Serial.read();
  
  if (i < NUM_LEDS) {
    // If i is less than the number of LEDs, it corresponds to an LED to set
    strip.setPixelColor(i, strip.Color(r, g, b));
  } else if (i == SYNC) {
    strip.show();
    //state = POT;
  }

  // Send of a response that will tell us that we've finished reading the packet
  Serial.println("L:" + (String)i);
  Serial.println("D:"+(String)i + " = (" +(String)r + " " + (String)g + " " + (String)b + ")");
}

void sendPotState() {
  String potState = "I:";
  for (int i = 0; i < NUM_ROWS; i++) {
    potState += (String)i + "=" + (String)analogRead(i);
    if (i < NUM_ROWS - 1) {
      potState += ",";
    }
  }
  Serial.println(potState);
}

void loop() {
  if (Serial.available() == 4) {
      readPixelColor();
  }

  // Every ~50ms send the pot state
  if ((loopCount+=DELAY) % 50 == 0) {
    sendPotState();
  }
  
  
  /*if (state == RGB) {
    if (Serial.available() == 4) {
      readPixelColor();
    }
  } else if (state == POT) {
    
  }

  // Send the status of each soft pot
  for (int i = 0; i < NUM_ROWS; i++) {
    //Serial.println((String)i + " " + (String)analogRead(i));
  }

  // Read data from Serial to light LEDs
  // Only do it when we have at least 4 bytes (i, r, g, b)
  while (Serial.available() >= 4) {
    
    
  }*/

  delay(DELAY);
}
