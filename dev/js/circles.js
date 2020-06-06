movement = function () {
    var t = new Date();
    // while (true) {
    let time = (new Date() - t) / 1000,
        mult1 = Math.sin(time),
        mult2 = Math.cos(time);
    values.speedx = values.dx.map(d => d * mult1 + 2 * Math.cos(d));
    values.speedy = values.dy.map(d => d * mult2 + 2 * Math.sin(d));
    values.xpos = values.xpos.map((d, i) => (d + values.speedx[i] + width) % width)
    values.ypos = values.ypos.map((d, i) => (d + values.speedy[i] + height) % height)
    values.rad = []
    for (var i = 0; i < values.xpos.length; i++) {
        var d2 = (values.xpos[i] - 200) ** 2 + (values.ypos[i] - 200) ** 2
        values.rad.push(Math.sqrt(d2))
    }
    //   yield time;
    // }
}

kernel = function (
    xpos,
    ypos,
    values,
    speedx,
    speedy,
    colorScaleImageData,
    rad,
    distance_type,
    radius
) {
    var flagDist = -1;
    var mindist = radius;
    var dist = 0;
    var A = 20; // speed look-ahead (for speed-based distance)
    var border = 0;
    var r = 0.0;
    var g = 0.0;
    var b = 0.0;

    var doOverlap = true;

    for (var i = 0; i < this.constants.numPoints; i++) {
        var x = this.thread.x - xpos[i],
            y = this.thread.y - ypos[i];

        // x and y are the distance to each point




        // show speed arrow
        if (
            Math.abs(Math.atan2(y, x) - Math.atan2(speedy[i], speedx[i])) < 0.02 &&
            x * x + y * y < A * A * (speedy[i] * speedy[i] + speedx[i] * speedx[i])
        ) {
            this.color(1, 0, 0, 1);
            continue; //  fixed in v2.0.1 😇
        }

        if (Math.sqrt(x * x + y * y) < 4) {
            mindist = 0;
            flagDist = 0;
        }

        // fwd
        if (distance_type == 4 || distance_type == 5) {
            x = x - A * speedx[i];
            y = y - A * speedy[i];
        }
        // euclidian
        if (distance_type != 1) {
            dist = Math.sqrt(x * x + y * y);
        }
        // weighted
        if (distance_type == 3 || distance_type == 5) {
            dist = dist * (1 + (4 * i) / this.constants.numPoints);
        }
        // manhattan
        if (distance_type == 1) {
            dist = Math.abs(x) + Math.abs(y);
        }


        if (doOverlap) {

            if (dist > rad[i]) { // dist is the distance to a point, mindist is the radius

                var flagDist = i + 1;
                var value = values[flagDist];
                var c = Math.ceil(255 * value);

                r = r + (colorScaleImageData[c * 4] / 255) **2  / this.constants.numPoints;
                g = g + (colorScaleImageData[1 + c * 4] / 255) **2  / this.constants.numPoints;
                b = b + (colorScaleImageData[2 + c * 4] / 255) **2  / this.constants.numPoints;
                // r = r + colorScaleImageData[c * 4] / 255 / this.constants.numPoints;
                // g = g + colorScaleImageData[1 + c * 4] / 255 / this.constants.numPoints;
                // b = b + colorScaleImageData[2 + c * 4] / 255 / this.constants.numPoints;
            } else { // white
                r = r + 1 / this.constants.numPoints;
                g = g + 1 / this.constants.numPoints;
                b = b + 1 / this.constants.numPoints;
            }
            
        } else {
            if (dist < mindist) {
                if (mindist - dist < 3) {
                    border = 1;
                } else {
                    border = 0;
                }
                mindist = dist;
                flagDist = i + 1;
            }
        }

    }

    if (doOverlap) {
        // this.color(r,g,b,1)
        this.color(Math.sqrt(r),Math.sqrt(g),Math.sqrt(b),1)
    } else {
        var value = values[flagDist];
        var c = Math.ceil(255 * value);
    
        if (flagDist == 0) {
            this.color(0.2, 0.2, 0.2, 1);
        } else if (border == 1) {
            this.color(1, 1, 1, 1);
        } else if (flagDist > 0) {
            this.color(
                colorScaleImageData[c * 4] / 255,
                colorScaleImageData[1 + c * 4] / 255,
                colorScaleImageData[2 + c * 4] / 255,
                1
            );
        } else if (flagDist < 0) {
            this.color(1, 1, 1, 1);
        }
    }

}

var numValues = 3
var width = 500
var height = 500
var ProcessorType = "gpu"


values = new function () {
    for (var values = [], i = 0; i < numValues; ++i) values[i] = Math.random();
    for (var xpos = [], i = 0; i < numValues; ++i) xpos[i] = width * Math.random();
    for (var ypos = [], i = 0; i < numValues; ++i) ypos[i] = height * Math.random();
    for (var dx = [], i = 0; i < numValues; ++i) dx[i] = 3 * (Math.random() - 0.5);
    for (var dy = [], i = 0; i < numValues; ++i) dy[i] = 3 * (Math.random() - 0.5);
    return {
        values,
        xpos,
        ypos,
        dx,
        dy
    };
}

var colors = ["#ffffcc", "#ffffca", "#fffec8", "#fffdc6", "#fffdc4", "#fffcc3", "#fffbc1", "#fffbbf", "#fefabd", "#fef9bb", "#fef9b9", "#fef8b7", "#fef7b5", "#fef7b3", "#fdf6b1", "#fdf5af", "#fdf5ad", "#fdf4ab", "#fdf3a9", "#fdf3a7", "#fdf2a5", "#fcf1a3", "#fcf1a1", "#fcf0a0", "#fcef9e", "#fcee9c", "#fbee9a", "#fbed98", "#fbec96", "#fbec94", "#fbeb92", "#fbea90", "#faea8e", "#fae98c", "#fae88a", "#fae788", "#fae786", "#fae684", "#f9e582", "#f9e480", "#f9e37e", "#f9e37c", "#f8e27a", "#f8e178", "#f8e076", "#f8df74", "#f8de72", "#f7dd70", "#f7dc6e", "#f7db6d", "#f7d96b", "#f6d869", "#f6d767", "#f6d666", "#f5d464", "#f5d363", "#f5d261", "#f4d060", "#f4cf5f", "#f4ce5d", "#f4cc5c", "#f3cb5b", "#f3c95a", "#f3c85a", "#f2c759", "#f2c558", "#f2c458", "#f1c257", "#f1c157", "#f1c056", "#f1be56", "#f0bd56", "#f0bc55", "#f0ba55", "#efb955", "#efb855", "#efb755", "#efb554", "#eeb454", "#eeb354", "#eeb254", "#eeb054", "#edaf54", "#edae54", "#edac54", "#edab53", "#ecaa53", "#eca953", "#eca753", "#eca653", "#eba553", "#eba453", "#eba253", "#eba153", "#eaa053", "#ea9f52", "#ea9d52", "#ea9c52", "#e99b52", "#e99a52", "#e99852", "#e89752", "#e89652", "#e89552", "#e89352", "#e79252", "#e79151", "#e79051", "#e78e51", "#e68d51", "#e68c51", "#e68b51", "#e68951", "#e58851", "#e58751", "#e58551", "#e58450", "#e48350", "#e48250", "#e48050", "#e47f50", "#e37e50", "#e37c50", "#e37b50", "#e27a50", "#e27850", "#e27750", "#e2764f", "#e1744f", "#e1734f", "#e1724f", "#e0704f", "#e06f4f", "#df6e4f", "#df6c4f", "#df6b4f", "#de694e", "#de684e", "#dd674e", "#dd654e", "#dc644e", "#db624e", "#db614e", "#da604d", "#d95e4d", "#d85d4d", "#d75b4d", "#d65a4d", "#d5594c", "#d4574c", "#d2564c", "#d1554c", "#d0544c", "#ce534b", "#cd524b", "#cb514b", "#c9504b", "#c84f4a", "#c64e4a", "#c44d4a", "#c34c4a", "#c14c49", "#bf4b49", "#bd4b49", "#bb4a49", "#ba4a48", "#b84948", "#b64948", "#b44847", "#b24847", "#b14847", "#af4746", "#ad4746", "#ab4746", "#a94645", "#a74645", "#a64644", "#a44544", "#a24543", "#a04443", "#9e4442", "#9c4442", "#9a4341", "#984340", "#974240", "#95423f", "#93413e", "#91413e", "#8f403d", "#8d403c", "#8b3f3b", "#893f3a", "#873e3a", "#853d39", "#833d38", "#813c37", "#7f3c36", "#7d3b35", "#7b3a34", "#793a33", "#773932", "#763931", "#743830", "#72372f", "#70372e", "#6e362d", "#6c352c", "#6a352b", "#68342a", "#663429", "#643328", "#623227", "#613226", "#5f3125", "#5d3024", "#5b3023", "#592f22", "#572f21", "#552e20", "#542d1f", "#522d1e", "#502c1d", "#4e2b1d", "#4c2b1c", "#4b2a1b", "#492a1a", "#472919", "#452918", "#442817", "#422717", "#402716", "#3e2615", "#3d2614", "#3b2513", "#392513", "#382412", "#362311", "#342310", "#33220f", "#31220f", "#30210e", "#2e210d", "#2c200c", "#2b200b", "#291f0a", "#281f09", "#261e08", "#251d07", "#231d06", "#221c05", "#201c04", "#1f1b03", "#1d1b03", "#1c1a02", "#1b1a01", "#191900"]

//   var colorScaleImageData = [255,255,204,255,255,255,202,255,255,254,200,255,255,253,198,255,255,253,196,255,255,252,195,255,255,251,193,255,255,251,191,255,254,250,189,255,254,249,187,255,254,249,185,255,254,248,183,255,254,247,181,255,254,247,179,255,253,246,177,255,253,245,175,255,253,245,173,255,253,244,171,255,253,243,169,255,253,243,167,255,253,242,165,255,252,241,163,255,252,241,161,255,252,240,160,255,252,239,158,255,252,238,156,255,251,238,154,255,251,237,152,255,251,236,150,255,251,236,148,255,251,235,146,255,251,234,144,255,250,234,142,255,250,233,140,255,250,232,138,255,250,231,136,255,250,231,134,255,250,230,132,255,249,229,130,255,249,228,128,255,249,227,126,255,249,227,124,255,248,226,122,255,248,225,120,255,248,224,118,255,248,223,116,255,248,222,114,255,247,221,112,255,247,220,110,255,247,219,109,255,247,217,107,255,246,216,105,255,246,215,103,255,246,214,102,255,245,212,100,255,245,211,99,255,245,210,97,255,244,208,96,255,244,207,95,255,244,206,93,255,244,204,92,255,243,203,91,255,243,201,90,255,243,200,90,255,242,199,89,255,242,197,88,255,242,196,88,255,241,194,87,255,241,193,87,255,241,192,86,255,241,190,86,255,240,189,86,255,240,188,85,255,240,186,85,255,239,185,85,255,239,184,85,255,239,183,85,255,239,181,84,255,238,180,84,255,238,179,84,255,238,178,84,255,238,176,84,255,237,175,84,255,237,174,84,255,237,172,84,255,237,171,83,255,236,170,83,255,236,169,83,255,236,167,83,255,236,166,83,255,235,165,83,255,235,164,83,255,235,162,83,255,235,161,83,255,234,160,83,255,234,159,82,255,234,157,82,255,234,156,82,255,233,155,82,255,233,154,82,255,233,152,82,255,232,151,82,255,232,150,82,255,232,149,82,255,232,147,82,255,231,146,82,255,231,145,81,255,231,144,81,255,231,142,81,255,230,141,81,255,230,140,81,255,230,139,81,255,230,137,81,255,229,136,81,255,229,135,81,255,229,133,81,255,229,132,80,255,228,131,80,255,228,130,80,255,228,128,80,255,228,127,80,255,227,126,80,255,227,124,80,255,227,123,80,255,226,122,80,255,226,120,80,255,226,119,80,255,226,118,79,255,225,116,79,255,225,115,79,255,225,114,79,255,224,112,79,255,224,111,79,255,223,110,79,255,223,108,79,255,223,107,79,255,222,105,78,255,222,104,78,255,221,103,78,255,221,101,78,255,220,100,78,255,219,98,78,255,219,97,78,255,218,96,77,255,217,94,77,255,216,93,77,255,215,91,77,255,214,90,77,255,213,89,76,255,212,87,76,255,210,86,76,255,209,85,76,255,208,84,76,255,206,83,75,255,205,82,75,255,203,81,75,255,201,80,75,255,200,79,74,255,198,78,74,255,196,77,74,255,195,76,74,255,193,76,73,255,191,75,73,255,189,75,73,255,187,74,73,255,186,74,72,255,184,73,72,255,182,73,72,255,180,72,71,255,178,72,71,255,177,72,71,255,175,71,70,255,173,71,70,255,171,71,70,255,169,70,69,255,167,70,69,255,166,70,68,255,164,69,68,255,162,69,67,255,160,68,67,255,158,68,66,255,156,68,66,255,154,67,65,255,152,67,64,255,151,66,64,255,149,66,63,255,147,65,62,255,145,65,62,255,143,64,61,255,141,64,60,255,139,63,59,255,137,63,58,255,135,62,58,255,133,61,57,255,131,61,56,255,129,60,55,255,127,60,54,255,125,59,53,255,123,58,52,255,121,58,51,255,119,57,50,255,118,57,49,255,116,56,48,255,114,55,47,255,112,55,46,255,110,54,45,255,108,53,44,255,106,53,43,255,104,52,42,255,102,52,41,255,100,51,40,255,98,50,39,255,97,50,38,255,95,49,37,255,93,48,36,255,91,48,35,255,89,47,34,255,87,47,33,255,85,46,32,255,84,45,31,255,82,45,30,255,80,44,29,255,78,43,29,255,76,43,28,255,75,42,27,255,73,42,26,255,71,41,25,255,69,41,24,255,68,40,23,255,66,39,23,255,64,39,22,255,62,38,21,255,61,38,20,255,59,37,19,255,57,37,19,255,56,36,18,255,54,35,17,255,52,35,16,255,51,34,15,255,49,34,15,255,48,33,14,255,46,33,13,255,44,32,12,255,43,32,11,255,41,31,10,255,40,31,9,255,38,30,8,255,37,29,7,255,35,29,6,255,34,28,5,255,32,28,4,255,31,27,3,255,29,27,3,255,28,26,2,255,27,26,1,255]
colorScaleImageData = new function () {
    var canvasColorScale = document.createElement("canvas");
    canvasColorScale.width = 256;
    canvasColorScale.height = 1;
    canvasColorScale.style.display = "none";
    var contextColorScale = canvasColorScale.getContext("2d");
    for (var i = 0; i < colors.length; ++i) {
        contextColorScale.fillStyle = colors[i];
        contextColorScale.fillRect(i, 0, 256, 1);
    }

    return contextColorScale.getImageData(0, 0, 255, 1).data;
}

movement()


// draw = function () {
//     // var fpsTime = performance.now();
//     // mutable fps = 60;
//     var canvas, context;
//     // while (true) {
//     //   render.getCanvas();
//     //   mutable fps =
//     //     (1 + mutable fps) *
//     //     (1 + 0.000984 * (fpsTime - (fpsTime = performance.now())));
//     // }
// }

//   xpos,
//   ypos,
//   values,
//   speedx,
//   speedy,
//   colorScaleImageData,
//   distance_type,
//   radius


var distance_type = 0
var radius = 200

if (0) {
    var canGo = document.getElementById('voronoi')
    
    // let context = canGo.getContext('2d');
    // context.globalAlpha = 0.5;
    
    let gl = canGo.getContext('webgl2', {premultipliedAlpha: false});
    
    make_render = function () {
        var gpu = new GPU({
            processor: ProcessorType,
            canvas: canGo,
            webGl: gl
        });
        return gpu
            .createKernel(kernel)
            .setConstants({
                numPoints: values.values.length
            })
            .setOutput([width, height])
            .setGraphical(true);
    }
    var calculate = make_render()
    
    calculate(
        values.xpos,
        values.ypos,
        values.values,
        values.speedx,
        values.speedy,
        colorScaleImageData,
        values.rad,
        +distance_type,
        +radius
    );
} else {
    var canGo = document.createElement('canvas')
    // canGo.width = width*2;
    // canGo.height = height*2;
    // canGo.style.width = width+"px";
    // canGo.style.height = height+"px";

    var gpu = new GPU({
        processor: ProcessorType,
        canvas: canGo,
    });
    var calculate =  gpu
        .createKernel(kernel)
        .setConstants({
            numPoints: values.values.length
        })
        .setOutput([width, height])
        .setGraphical(true);
    calculate(
        values.xpos,
        values.ypos,
        values.values,
        values.speedx,
        values.speedy,
        colorScaleImageData,
        values.rad,
        +distance_type,
        +radius
    );
    calculate.getCanvas();
}

// canR = calculate.getCanvas();

// krender(xPos, yPos, values, csImageData);
// let result = krender.getCanvas();
// context.drawImage(result, 0, 0);

// document.getElementsByTagName('body')[0].appendChild(canR);

// var ctx = canR.getContext('webgl');



// let context = canvas.getContext('2d');
// context.globalAlpha = 0.5;
 
// let gl = canvas.getContext('webgl2', {premultipliedAlpha: false});
// let gpu = new GPU({
//   canvas,
//   webGl: gl
// });
// let krender = gpu.createKernel(function(xpos, ypos, values, colorScale) {
  


// ctx.clearRect(0, 0, width, height);
// ctx.fillStyle = "black"
// ctx.rect(50,50,100,100)
// ctx.fillStyle = "black"
// ctx.rect(150,150,100,100)
// ctx.fill()


var can4 = document.createElement("canvas");
can4.width = width*2;
can4.height = height*2;
can4.style.width = width+"px";
can4.style.height = height+"px";
var ctx4 = can4.getContext("2d");

// ctx4.fillStyle = "black"
ctx4.fillRect(0, 0, 200, 200);
ctx4.fillRect(200, 200, 200, 200);
// ctx4.fillStyle = "black"
// ctx4.rect(60,20,10,10)
// ctx4.fill()
// ctx4.fillStyle = "white"
// ctx4.rect(10,150,100,100)
// ctx4.fill()

var canvas = document.createElement("canvas");
canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
var ctx = canvas.getContext("2d");

ctx.fillStyle = "pink"
ctx.fillRect(250, 205, 110, 110);
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

// ctx.fillStyle = "grey"
// ctx.rect(50,50,100,100)
// ctx.fill()
// ctx.fillStyle = "white"
// ctx.rect(150,150,100,100)
// ctx.fill()




var can3 = document.getElementById("can3");
can3.width = width*2;
can3.height = height*2;
can3.style.width = width+"px";
can3.style.height = height+"px";
var ctx3 = can3.getContext('2d');

document.body.appendChild(can3);

ctx3.drawImage(can4,0,0)
ctx3.globalAlpha = .8
ctx3.drawImage(canGo, 0, 0);
ctx3.globalAlpha = 1
ctx3.drawImage(canvas, 0, 0);

// const canvas = calculate.canvas;
// document.body.appendChild(canvas);
// canvas.style.width = 300
// canvas.style.height = 300

// values.flagDist = 0

// draw()

// calculate(values.xpos, values.ypos, values, values.speedx, values.speedy, colorScaleImageData, distance_type, radius)
// calculate(values)