Color = new function() {
    this.generate = function(colorIndex) {
        var haltonList = halton(colorIndex+1)
        var point = haltonList[colorIndex]
        var a = 6
        switch (a) {
            case 1:
                var x = point[0]
                var y = point[1]
                var b = point[2] * 254 // color[2] // 1 to 254
                var rgb = cie_to_rgb(x,y,b).rgb
                return _colorCodeFromRGB(rgb)
            case 2:
                var h = point[0] * 360
                var l = 50
                var s = point[1] * 80 + 20
                return hslToHex(h,s,l)
            case 3:
                var h = point[0] * 360
                var l = point[2] * 20 + 40
                var s = point[1] * 20 + 70
                return hslToHex(h,s,l)
            case 4:
                var h = normBetween(point[0], 0, 360)
                var l = normBetween(point[2], 60, 80)
                var s = normBetween(point[1], 70, 90)
                return hsluv.hsluvToHex([h,s,l])
            case 5:
                var h = normBetween(point[0], 0, 360)
                var l = normBetween(point[1], 60, 95)
                var s = normBetween(point[2], 80, 100)
                return hsluv.hsluvToHex([h,s,l])
            case 6:
                var h = normBetween(point[0], 0, 360)
                var l = normBetween(point[1], 45, 85)
                var s = normBetween(point[2], 80, 100)
                return hsluv.hsluvToHex([h,s,l])
            case 7:
                var k = 0
                for (var i = 0; i < 1000; i++) {
                    var haltonList = halton(i+1)
                    var point = haltonList[i]
                    var x = point[0]
                    var y = point[1]
                    var b = point[2] * 254 // color[2] // 1 to 254
                    var result = cie_to_rgb(x,y,b)
                    var rgb = result.rgb
                    if (!result.error) {
                        k++
                    }
                    if (k >= colorIndex) {
                        break
                    }
                }
                return _colorCodeFromRGB(rgb)
        }
        function normBetween(x,low,high) {
            return x * (high - low) + low
        }
    }
    
    function vdc(n, base) { // gives teh nth entry of the Van der Corput sequence
        var v = 0
        var denom = 1
    
        while (n) {
            denom *= base
            // remainder = Math.floor(n % base);
            remainder = n % base;
            n = Math.floor(n/base);
            v += remainder / denom
        }
        return v
    }
    
    // https://en.wikipedia.org/wiki/Halton_sequence#Example_of_Halton_sequence_used_to_generate_points_in_(0,_1)_%C3%97_(0,_1)_in_R2
    function halton(n) {
        // evenly spaced points in 2D
        var a = [[0,0,0]]
        for (var i = 1; i <= n; i++) {
            a.push([vdc(i,2),vdc(i,3),vdc(i,7)])
        }
        return a // an array of arrays [] ... [ [0.5, 0.33] , [0.25, 0.66] , [0.75, 0.11], ... ] 
    }
    
    function listVDC() {
        for (var i = 1; i <= 10; i++) {
            console.log(vdc(i,3))
        }
        console.log(halton(10))
    } // for fun
    
    function hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }
        const toHex = x => {
          const hex = Math.round(x * 255).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
    
    function _colorCodeFromRGB(a) {
        return rgbToHex(a[0],a[1],a[2])
    }
    
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      
      function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }
    
    function cie_to_rgb(x, y, brightness)
    {
        //Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
        if (brightness === undefined) {
            brightness = 254;
        }
    
        var error = false
    
        var z = 1.0 - x - y;
        var Y = (brightness / 254).toFixed(2);
        var X = (Y / y) * x;
        var Z = (Y / y) * z;
    
        //Convert to RGB using Wide RGB D65 conversion
        var red 	=  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
        var green 	= -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
        var blue 	=  X * 0.051713 - Y * 0.121364 + Z * 1.011530;
    
        //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
        if (red > 1.0 || green > 1.0 || blue > 1.0) error = true
        if (red < 0 || green < 0 || blue < 0) error = true
        if (red > blue && red > green && red > 1.0) {
    
            green = green / red;
            blue = blue / red;
            red = 1.0;
        }
        else if (green > blue && green > red && green > 1.0) {
    
            red = red / green;
            blue = blue / green;
            green = 1.0;
        }
        else if (blue > red && blue > green && blue > 1.0) {
    
            red = red / blue;
            green = green / blue;
            blue = 1.0;
        }
    
        //Reverse gamma correction
        red 	= red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
        green 	= green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
        blue 	= blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;
    
    
        //Convert normalized decimal to decimal
        red 	= Math.round(red * 255);
        green 	= Math.round(green * 255);
        blue 	= Math.round(blue * 255);
    
        if (isNaN(red))
            red = 0;
    
        if (isNaN(green))
            green = 0;
    
        if (isNaN(blue))
            blue = 0;
    
    
        return {rgb:[red, green, blue], error:error};
    }
}