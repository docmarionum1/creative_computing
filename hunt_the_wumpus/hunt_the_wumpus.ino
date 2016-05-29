/*
 * Hunt the Wumpus
 * 
 * A game where one player secretly chooses an LED and then a second player has to guess which LED was chosen.
 * 
 * The left button moves the selected LED left, the right, right.  The center button selects the current LED.
 * 
 * The guessing player has three guesses to find the LED.  If the player guess the location correctly, the LEDs will "dance".
 * If the guess is wrong a number of LEDs will flash showing possible locations.  The closer the player is the tighter the ranger of possibilities will be.
 * 
 * If the player doesn't get the correct location within three guesses, then the player loses and the correct location will blink.
 * 
 */

// The LED currently selected
int currentLED = 0;

// The number of LEDs
unsigned int numLEDs = 10;

// Pins and current state for the three switches
int leftPin = 13;
int leftState = LOW;

int rightPin = 11;
int rightState = LOW;

int selectPin = 12;
int selectState = LOW;

// The state the game is in
// 0 - hide
// 1 - seek
int gameState = 0;

const int HIDE = 0;
const int SEEK = 1;

// Location of wumpus
int location = 0;

// Number of tries the player has left to find the wumpus
int tries = 3;

void setup() {
  //Serial.begin(9600);

  for (int i = 0; i < numLEDs; i++) {
    pinMode(i, OUTPUT);
  }

  pinMode(leftPin, INPUT);
  pinMode(rightPin, INPUT);
  pinMode(selectPin, INPUT);
}

/*
 * Reset the game back to the original state after the game ends.
 */
void reset() {
  location = 0;
  tries = 3;
  currentLED = 0;
  gameState = HIDE;
}

/*
 * Turn all the LEDs off.
 */
void clear() {
  // Clear LEDs
  for (int i = 0; i < numLEDs; i++) {
    digitalWrite(i, LOW);
  }
}

/*
 * Display LED pattern for winning
 * The pattern is flashing the LEDs in sequence three times.
 */
void win() {
  clear();

  // Display pattern 3 times
  for (int j = 0; j < 3; j++) {
    for (int i = 0; i < numLEDs; i++) {
      // For each LED, turn it on, wait 100 ms then turn it off.
      digitalWrite(i, HIGH);
      delay(100);
      digitalWrite(i, LOW);
    }
  }
}

/*
 * Display the LED pattern for losing.
 * Slowly blink the currect LED.
 */
void lose() {
  clear();

  for (int j = 0; j < 5; j++) {
    digitalWrite(location, HIGH);
    delay(400);
    digitalWrite(location, LOW);
    delay(400);
  }
}

/*
 * Flash LEDs for hint
 * If you are right next to the true location, flash the two LEDs next to you.
 * 
 * Otherwise flash all other LEDs besides the current and adjacent ones.
 */
void hint() {
  clear();
  bool state = 0;

  for (int j = 0; j < 6; j++) {
    state = !state;

    // If within 1
    if (abs(location - currentLED) == 1) {
      for (int i = currentLED - 1; i <= currentLED + 1; i++) {
        if (i != currentLED && i >= 0 && i < numLEDs) {
          digitalWrite(i, state);
        }
      }
    }

    // Else further out
    else {
      for (int i = 0; i < numLEDs; i++) {
        if (i < currentLED - 1 || i > currentLED + 1) {
          digitalWrite(i, state);
        }
      }
    }
    
    delay(200);
  }
  

  //Turn current selection back on
  digitalWrite(currentLED, HIGH);
}

void loop() {
  // Get the current state of the input pins
  int newLeftState = digitalRead(leftPin);
  int newRightState = digitalRead(rightPin);
  int newSelectState = digitalRead(selectPin);

  if (gameState == HIDE || gameState == SEEK) {
    // Only control in hiding and seeking states
    digitalWrite(currentLED, LOW);
  
    if (newLeftState && newLeftState != leftState) {
      // Left button pressed, move LED left
      currentLED = (currentLED + 1) % numLEDs;
    } else if (newRightState && newRightState != rightState) {
      // Right button pressed, move LED right
      currentLED = (currentLED - 1);
      if (currentLED > numLEDs) {
        currentLED = numLEDs - 1;
      }
    } else if (newSelectState && newSelectState != selectState) {
      // Select button pressed

      // If hiding, hide wumpus and then move to seek state
      if (gameState == HIDE) {
        // Save location
        location = currentLED;

        // Reset LED location so that the location isn't revealed
        currentLED = 0;

        // Move to seek gamestate
        gameState = SEEK;
      } else if (gameState == SEEK) {
        if (currentLED == location) {
          // If the location was correct
          win();
          reset();
        } else if (--tries > 0) {
          // If location was incorrect but there are tries remaining give a hint.
          hint();
        } else {
          // Else the player lost
          lose();
          reset();
        }
      }
    }
  
    digitalWrite(currentLED, HIGH);
  }

  // Update the saved input states
  leftState = newLeftState;
  rightState = newRightState;
  selectState = newSelectState;

  delay(50);
}
