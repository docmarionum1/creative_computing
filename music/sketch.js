var analyser;
var frequencyData;
var cubeSize = 1;
var a = .5;
var cubes = [];
var numCubes = 16;
var freqLength = 1024;
var freqChunk = freqLength/numCubes;
var minSize = 20;
var maxSize = 350;

class Cube {
    constructor(freqStart, freqEnd) {
        this.freqStart = freqStart;
        this.freqEnd = freqEnd;
        this.size = minSize;
        //this.average = numCubes;
        //this.count = 1;
        this.min = 50000;
        this.max = 0;
    }

    changeSize(frequencyData) {
        var sum = sumArray(frequencyData, this.freqStart, this.freqEnd);

        if (sum < this.min) {
            this.min = sum;
        }
        if (sum > this.max) {
            this.max = sum;
        }

        //this.count++;
        //this.average = this.average * ((this.count - 1) / this.count) + sum * (1/this.count);
        //this.average = this.average * .95 + sum * .05;

        //console.log(sum);
        //scale(sum/10000, sum/10000);
        //var w = 10 * sum/(this.average/numCubes);
        //var w = 10 * sum/(this.average/numCubes/2);
        var w = map(sum, this.min, this.max, minSize, maxSize);

        if (w) {
            this.size = this.size * a + w * (1 - a);
        }

        this.width = max(min(this.size, maxSize), minSize);
    }
}

function sumArray(a, i, j) {
    var s = 0;
    for (var x = i; x < j; x++) {
        s += a[x];
    }
    return s;
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);


    for (var i = 0; i < numCubes; i++) {
        cubes.push(new Cube(i*freqChunk, (i+1)*freqChunk));
    }

    audio_file.onchange = function() {
        audio_file.style.display = 'none';
        var file = URL.createObjectURL(this.files[0]);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            var start = (new Date()).getTime();
            var cx = new AudioContext() ;
            cx.decodeAudioData(xhr.response, function(decodedBuffer) {
                var source = cx.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(cx.destination);

                analyser = cx.createAnalyser();
                source.connect(analyser);
                frequencyData = new Uint8Array(analyser.frequencyBinCount);
                source.start(0);
            });
        };
        xhr.send(null);
    };
}

function draw() {
    if (analyser) {
        background(0);
        analyser.getByteFrequencyData(frequencyData);
        translate(0, 0, -3000);
        for (var i = 0; i < numCubes; i++) {
            cubes[i].changeSize(frequencyData);

            push();

            translate(
                500 + (i % (numCubes/4))*1000 - (1000*numCubes/8),
                1000*floor(i / (numCubes/4)) - 1500,
                0
            );



            rotateZ(frameCount * 0.01);
            rotateX(frameCount * 0.01);
            rotateY(frameCount * 0.01);
            box(cubes[i].width, cubes[i].width, cubes[i].width);

            pop();
        }


    }
}
