/*
  Arduino Mario Bros Tunes
  With Piezo Buzzer and PWM
 
  Connect the positive side of the Buzzer to pin 3,
  then the negative side to a 1k ohm resistor. Connect
  the other side of the 1 k ohm resistor to
  ground(GND) pin on the Arduino.
 
  by: Dipto Pratyaksa
  last updated: 31/3/13
*/
 
/*************************************************
 * Public Constants
 *************************************************/
 
#define NOTE_B0  31
#define NOTE_C1  33
#define NOTE_CS1 35
#define NOTE_D1  37
#define NOTE_DS1 39
#define NOTE_E1  41
#define NOTE_F1  44
#define NOTE_FS1 46
#define NOTE_G1  49
#define NOTE_GS1 52
#define NOTE_A1  55
#define NOTE_AS1 58
#define NOTE_B1  62
#define NOTE_C2  65
#define NOTE_CS2 69
#define NOTE_D2  73
#define NOTE_DS2 78
#define NOTE_E2  82
#define NOTE_F2  87
#define NOTE_FS2 93
#define NOTE_G2  98
#define NOTE_GS2 104
#define NOTE_A2  110
#define NOTE_AS2 117
#define NOTE_B2  123
#define NOTE_C3  131
#define NOTE_CS3 139
#define NOTE_D3  147
#define NOTE_DS3 156
#define NOTE_E3  165
#define NOTE_F3  175
#define NOTE_FS3 185
#define NOTE_G3  196
#define NOTE_GS3 208
#define NOTE_A3  220
#define NOTE_AS3 233
#define NOTE_B3  247
#define NOTE_C4  262
#define NOTE_CS4 277
#define NOTE_D4  294
#define NOTE_DS4 311
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_FS4 370
#define NOTE_G4  392
#define NOTE_GS4 415
#define NOTE_A4  440
#define NOTE_AS4 466
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_CS5 554
#define NOTE_D5  587
#define NOTE_DS5 622
#define NOTE_E5  659
#define NOTE_F5  698
#define NOTE_FS5 740
#define NOTE_G5  784
#define NOTE_GS5 831
#define NOTE_A5  880
#define NOTE_AS5 932
#define NOTE_B5  988
#define NOTE_C6  1047
#define NOTE_CS6 1109
#define NOTE_D6  1175
#define NOTE_DS6 1245
#define NOTE_E6  1319
#define NOTE_F6  1397
#define NOTE_FS6 1480
#define NOTE_G6  1568
#define NOTE_GS6 1661
#define NOTE_A6  1760
#define NOTE_AS6 1865
#define NOTE_B6  1976
#define NOTE_C7  2093
#define NOTE_CS7 2217
#define NOTE_D7  2349
#define NOTE_DS7 2489
#define NOTE_E7  2637
#define NOTE_F7  2794
#define NOTE_FS7 2960
#define NOTE_G7  3136
#define NOTE_GS7 3322
#define NOTE_A7  3520
#define NOTE_AS7 3729
#define NOTE_B7  3951
#define NOTE_C8  4186
#define NOTE_CS8 4435
#define NOTE_D8  4699
#define NOTE_DS8 4978
 
#define melodyPin 3
//Mario main theme melody
int melody[] = {
  NOTE_E5, NOTE_E5, NOTE_E5, NOTE_E5, 
  NOTE_B4, NOTE_C5, NOTE_E5,
  NOTE_C5, NOTE_E5,
  0, 0, 0
  
};

int tempo[] = {
  12, 12, 12, 4, 
  4, 4, 6,
  12, 1,
  1, 1, 1
};

int numLEDs = 4;
int LEDs[] = {
  10, 11, 12, 13
};
 
void setup(void)
{
  pinMode(3, OUTPUT);//buzzer
  pinMode(13, OUTPUT);//led indicator when singing a note

  for (int i = 0; i < numLEDs; i++) {
    pinMode(LEDs[i], OUTPUT);
  }
  
  Serial.begin(9600);
 
}

/*
 * Turn all the LEDs off.
 */
void clear() {
  // Clear LEDs
  for (int i = 0; i < numLEDs; i++) {
    digitalWrite(LEDs[i], LOW);
  }
}

// Light up 
void lights(int val) {
  clear();
  //int maxLED = min(max(val - 400, 0) / 100, 4);
  int maxLED = min(max(val/200, 0), 4);
  Serial.println(maxLED);

  for (int i = 0; i < maxLED; i++) {
    digitalWrite(LEDs[i], HIGH);
  }
}

void loop()
{
  //sing();
  int val = 0;
  delay(5);
  do {
    delay(10);
    val = analogRead(5);
    Serial.println(analogRead(5));
    Serial.println("hi");
  } while (val < 100);
  
  // Read a bunch of times and get the max value:
  int maxVal = 0;
  for (int i = 0; i < 100; i++) {
    val = analogRead(5);
    Serial.println(val);  
    maxVal = max(maxVal, val);

    // Add a bit of randomness to val
    val += random(-100,100);
    val = max(min(val, 800), 0);
    //val += max(min(random(-50, 50), 400), 0);
    
    lights(val);
    buzz(melodyPin, val*2, 50);
    delay(50);
  }
  
  //Victory!
  if (maxVal > 800) {
    sing();
  } else {
    // Blink final score
    lights(maxVal);
    delay(1000);
    clear();
    delay(1000);
    lights(maxVal);
    delay(1000);
    clear();
    delay(1000);
    lights(maxVal);
    delay(1000);
    clear();
    delay(1000);
  }

  clear();
}
 
void sing() {
  // iterate over the notes of the melody:
  
 
  Serial.println(" 'Mario Theme'");
  int size = sizeof(melody) / sizeof(int);
  for (int thisNote = 0; thisNote < size; thisNote++) {

    // to calculate the note duration, take one second
    // divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int noteDuration = 1000 / tempo[thisNote];

    buzz(melodyPin, melody[thisNote], noteDuration);

    // to distinguish the notes, set a minimum time between them.
    // the note's duration + 30% seems to work well:
    int pauseBetweenNotes = noteDuration * 1.30;
    
    clear();
    delay(pauseBetweenNotes);
    lights(1000);
    

    // stop the tone playing:
    buzz(melodyPin, 0, noteDuration);

  }
}
 
void buzz(int targetPin, long frequency, long length) {
 if (frequency == 0)
    return;

 long duration = frequency * length / 1000;
 tone(targetPin, frequency, duration);
 delay(duration);
 //digitalWrite(targetPin, LOW);
}
