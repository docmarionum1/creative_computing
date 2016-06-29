var serial; // variable to hold an instance of the serialport library
var portName = 'COM3'; // fill in your serial port name here
var inData; // for incoming serial data
var LEDState = [];
var numLEDs = 30;
var numRows = 5;
var rowLength = numLEDs/numRows;
var synth;
var primes = [
  5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233
];
var inputThresholds = [
    [20, 120],
    [180, 240],
    [300, 360],
    [400, 550],
    [600, 720],
    [850, 970]
];
var notes = [
    'A1', 'B1', 'C1', 'D1', 'E1', 'F1',
    'F2', 'E2', 'D2', 'C2', 'B2', 'A2',
    'A3', 'B3', 'C3', 'D3', 'E3', 'F3',
    'F4', 'E4', 'D4', 'C4', 'B4', 'A4',
    'A5', 'B5', 'C5', 'D5', 'E5', 'F5'
];

// xylophone, steel_drums, acoustic_guitar_nylon, violin, choir_aahs
var instruments = [13, 114, 24, 40, 52];

//distances[odd/even][direction][rowIdx]
var distances = {
  0: {
    'right': [1, 1, 1, 1, 1, 1],
    'left': [-1, -1, -1, -1, -1, -1],
    'up': [-1, -3, -5, -7, -9, -11],
    'down': [11, 9, 7, 5, 3, 1]
  },
  1: {
    'left': [1, 1, 1, 1, 1, 1],
    'right': [-1, -1, -1, -1, -1, -1],
    'down': [1, 3, 5, 7, 9, 11],
    'up': [-11, -9, -7, -5, -3, -1]
  }
}

class Pulse {
  constructor(velocity, direction, i, freq, instrument) {
    this.instrument = instrument;
    this.i = i;
    this.velocity = velocity;
    this.direction = direction;
    this.freq = freq;
    this.noteVel = 127;
    this.count = 0;
    this.r = 100+parseInt(freq/100)*50;
    this.g = 100+parseInt(freq%100);
    this.b = 100+parseInt(freq%10)*10;

    this.playing = false;
    this.start();
  }

  // Update the pulse - if it moves, return the new location, else return null
  // if return -1, remove the Pulse
  update(row, idx) {
    if (++this.count == this.velocity) {
      this.count = 0;
      this.noteVel -= 10;
      var oldLoc = this.i;
      var newLoc = this.i + distances[row % 2][this.direction][idx];

      if (
        newLoc < 0 || newLoc >= numLEDs ||
        ((this.direction == 'left' || this.direction == 'right') && parseInt(oldLoc/rowLength) != parseInt(newLoc/rowLength))
      ) {
        return -1;
      }

      this.i = newLoc;
      return this.i;
    }
    return null;
  }

  togglePlaying() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.playing) {
      this.playing = true;
      //this.midi = synth.noteOnWithFreq(this.freq, this.noteVel);
      this.note = MIDI.keyToNote[notes[this.i]];
      MIDI.noteOn(this.instrument, this.note, 127, 0);
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      //synth.noteOff(this.midi, 100);
      MIDI.noteOff(this.instrument, this.note, 0);
    }
  }
}

class LED {
  constructor(i) {
    this.i = i;

    this.r = 0;
    this.g = 0;
    this.b = 0;

    this.freq = 0;//
    this.innateFreq = i*17 + 51;
    this.beatLength = primes[i];

    this.playing = false;

    this.pulses = [];

    this.buttonState = false;
    this.buttonRow = parseInt(i / rowLength);
    this.buttonIdx = i % rowLength;

    // Reverse for odd numbered rows
    if (this.buttonRow % 2 == 1) {
        this.buttonIdx = rowLength - 1 - this.buttonIdx;
    }

    this.button = createButton(' ');
    this.button.position(this.buttonIdx*50, this.buttonRow*50);
    this.button.mousePressed(this.activate.bind(this));
  }

  processInput(values) {
      var val = parseInt(values[this.buttonRow]);
      if (
          val > inputThresholds[this.buttonIdx][0] &&
          val < inputThresholds[this.buttonIdx][1]
      ) {
          this.updateButtonState(true);
          //this.button.elt.style.backgroundColor = "white";
      } else {
          this.updateButtonState(false);
          //this.button.elt.style.backgroundColor = "black";
      }
  }

  updateButtonState(state) {
      if (state && state != this.buttonState) {
          this.activate();
      }
      this.buttonState = state;
  }

  activate() {
    //var dirs = [-1, 1, rowLength, -rowLength];
    var dirs = ['left', 'right', 'up', 'down'];

    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];
      var j = this.i + distances[this.buttonRow % 2][dir][this.buttonIdx];

      // Don't spawn off grid
      if (j >= 0 && j < numLEDs ) {
        // If it's a left/right pulse, don't spawn onto next row
        if ((dir == 'left' || dir == 'right') && parseInt(this.i/rowLength) != parseInt(j/rowLength)) {
          continue;
        }
        LEDState[j].pulses.push(new Pulse(this.beatLength, dir, j, this.innateFreq, this.buttonRow));
      }
    }
  }

  send() {
    // Compress color to 6 bits
    var val =
      map(this.r, 0, 255, 0, 3) +
      (map(this.g, 0, 255, 0, 3) << 2) +
      (map(this.b, 0, 255, 0, 3) << 4);

    serial.write(val);
  }

  getColor() {
      if (this.pulses.length > 0) {
          var r = 0;
          var g = 0;
          var b = 0;
          var n = this.pulses.length;

          for (var i = 0; i < n; i++) {
              r += this.pulses[i].r;
              g += this.pulses[i].g;
              b += this.pulses[i].b;
          }

          r = parseInt(r/n);
          g = parseInt(g/n);
          b = parseInt(b/n);

          this.r = r;
          this.g = g;
          this.b = b;

          return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else {
          this.r = 0;
          this.g = 0;
          this.b = 0;
          return 'rgb(0,0,0)';
      }
  }

  update() {
    for (var i = this.pulses.length; i--;) {
      var j = this.pulses[i].update(this.buttonRow, this.buttonIdx);
      if (j !== null) {
        var pulse = this.pulses.splice(i, 1)[0];
        pulse.stop();
        if (j > -1) {
          LEDState[j].pulses.push(pulse);
          pulse.start();
        }
      }
    }
    this.button.elt.style.backgroundColor = this.getColor();
  }
}

function setup() {
  //synth = T("OscGen", {wave:"sin", mul:0.25}).play();
  var env = T("perc", {a:50, r:2500});
  synth = T("PluckGen", {env:env, mul:0.5}).play();

  frameRate(60);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.open(portName, {baudrate: 115200}); // open a serial port
  serial.clear();

  for (var i = 0; i < numLEDs; i++) {
    LEDState[i] = new LED(i);
  }

  MIDI.loadPlugin({
      //soundfontUrl: "../../MIDI.js/examples/soundfont/",
      soundfontUrl: "../../midi-js-soundfonts/MusyngKite/",
      //soundfontUrl: "http://gleitz.github.io/midi-js-soundfonts/FluidR3_GM",
      //instrument: "acoustic_grand_piano",
      //instrument: "steel_drums",
      instruments: instruments.slice(0),
      onprogress: function(state, progress) {
          console.log(state, progress);
      },
      onsuccess: function() {
          for (var i = 0; i < instruments.length; i++) {
              MIDI.programChange(i, instruments[i]);
          }

          /*var delay = 0; // play one note every quarter second
          var note = 21; // the MIDI note
          var velocity = 127; // how hard the note hits*/
          // play the note
          //MIDI.setVolume(0, 255);
          //MIDI.programChange(0, 114);
          //MIDI.setVolume(14, 127);
          //MIDI.noteOn(13, 48, 127, 0);
          //MIDI.noteOff(13, 48, 0.75); // Stop note on channel 0
          /*MIDI.noteOn(0, note, velocity, delay);
          MIDI.noteOff(0, note, delay + 1.75);*/

          // Handshake
          serial.write(1); serial.write(3); serial.write(3); serial.write(7);

          LEDState[0].activate();
      }
  });



}

function sendLED(i) {
  for (var i = 0; i < numLEDs; i++) {
    LEDState[i].send();
  }
}

function draw() {
    for (var i = 0; i < numLEDs; i++) {
      LEDState[i].update();
    }
}

function processInput(data) {
    var values = data.split(':')[1].split(',');

    for (var i = 0; i < numLEDs; i++) {
        LEDState[i].processInput(values);
    }
}

function serialEvent() {
  var data = serial.readLine();//readStringUntil('\r\n');

  if (data) {
    // LED message
    if (data.charAt(0) == 'L') {
      //console.log(data);
      sendLED();
    }

    // Debug
    if (data.charAt(0) == 'D') {
      console.log(data);
    }

    // Input
    if (data.charAt(0) == 'I') {
        //console.log(data);
        processInput(data);
    }
  }
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
