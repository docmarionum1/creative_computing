var serial; // variable to hold an instance of the serialport library
var portName = 'COM4'; // fill in your serial port name here
var inData; // for incoming serial data
var LEDState = [];
var numLEDs = 30;

class LED {
  constructor(i) {
    this.i = i;
    this.r = 0;
    this.g = 0;
    this.b = 0;
  }

  send() {
    serial.write(this.i);
    serial.write(this.r);
    serial.write(this.g);
    serial.write(this.b);
  }

  update(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  inc() {
    this.r++;
    this.g++;
    this.b++;
  }
}

function setup() {
  frameRate(60);
  createCanvas(400, 300);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors

  serial.open(portName, {baudrate: 115200}); // open a serial port
  serial.clear();

  for (var i = 0; i < numLEDs; i++) {
    LEDState[i] = new LED(i);
    LEDState[i].update(0,0,0);
  }

  serial.write(1); serial.write(3); serial.write(3); serial.write(7);
}

function sendLED(i) {
  i = (i + 1) % numLEDs;
  LEDState[i].send();

  /*if (i < numLEDs) {
    LEDState[i].send();
  } else {

  }*/
}

function draw() {
  // black background, white text:
  background(0);
  fill(255);
  // display the incoming serial data as a string:
  text("incoming value: " + inData, 30, 30);
  /*for (var i = 0; i < numLEDs; i++) {
    //LEDState[i].update(frameCount % 256, frameCount % 128, frameCount % 64);
    LEDState[i].update(i, i, i);
  }*/
  LEDState[frameCount % numLEDs].inc();
}

function serialEvent() {
  // read a byte from the serial port:
  //var inByte = serial.readLine();
  var data = serial.readLine();//readStringUntil('\r\n');

  //println("inByte: " + inByte);
  if (data) {
    //console.log(data);
    //inData = data;

    if (data.charAt(0) == 'L') {
      //console.log(data);
      sendLED(parseInt(data.split(":")[1]));
    }

    if (data.charAt(0) == 'D') {
      inData = data;
      console.log(data);
    }
  }

  //console.log(inByte);
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
