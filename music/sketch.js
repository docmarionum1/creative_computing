var analyser;
var frequencyData;
var cubeSize = 1;
var a = 0.7;
var cubes = [];
var numCubes = 16;
var freqLength = 1024;
var freqChunk = freqLength/numCubes;
var minSize = 20;
var maxSize = 350;
var beatThreshold = 1.1;

class Cube {
    constructor(freqStart, freqEnd) {
        this.freqStart = freqStart;
        this.freqEnd = freqEnd;
        this.size = minSize;
        //this.average = numCubes;
        //this.count = 1;
        this.min = 50000;
        this.max = 0;
        this.rot = 0;
        this.drot = 0;
        this.previous = [];
    }

    update(frequencyData) {
        var sum = sumArray(frequencyData, this.freqStart, this.freqEnd);

        if (sum < this.min) {
            this.min = sum;
        }
        if (sum > this.max) {
            this.max = sum;
        }

        /*if (sum > (this.previous * beatThreshold)) {
            this.drot += .01;
        } else {
            this.drot -= .001;
            if (this.drot < 0) {
                this.drot = 0;
            }
        }


        this.previous = sum;
        */

        this.previous.unshift(sum);
        this.previous = this.previous.slice(0, 120);

        this.drot = .01 * countPeaks(this.previous);
        console.log(this.drot);
        this.rot += this.drot;



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

function isPeak(a) {

}

function countPeaks(a) {
    var peaks = 0;
    for (var i = 2; i < a.length - 2; i++) {
        if (a[i] > a[i - 1] && a[i] > a[i + 1] && a[i] > a[i - 2] && a[i] > a[i + 2]) {
            peaks++
        }
    }
    return peaks;
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);


    for (var i = 0; i < numCubes; i++) {
        cubes.push(new Cube(i*freqChunk, (i+1)*freqChunk));
    }

    audio_file.onchange = function() {
        document.getElementById('upload').style.display = 'none';
        var file = URL.createObjectURL(this.files[0]);

        id3(this.files[0], function(err, tags) {
            // tags now contains your ID3 tags
            console.log(tags);
            document.getElementById('title').innerHTML = tags.title;
            document.getElementById('artist').innerHTML = tags.artist;
        });

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
        document.getElementById('splash').style.opacity -= 0.01;
        /*ambientLight(200);
        ambientMaterial(255);
        pointLight(255, 255, 255, 10, 1, -1);*/
        background(0);
        analyser.getByteFrequencyData(frequencyData);
        translate(0, 0, -3000);
        for (var i = 0; i < numCubes; i++) {
            cubes[i].update(frequencyData);

            push();

            translate(
                500 + (i % (numCubes/4))*1000 - (1000*numCubes/8),
                1000*floor(i / (numCubes/4)) - 1500,
                0
            );



            if (i % 3 == 0)
                rotateZ(cubes[i].rot);
            else if (i % 3 == 1)
                rotateX(cubes[i].rot);
            else
                rotateY(cubes[i].rot);
            box(cubes[i].width, cubes[i].width, cubes[i].width);

            pop();
        }


    }
}
