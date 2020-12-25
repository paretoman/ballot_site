// YES, TAU.
Math.TAU = Math.PI*2;


function _drawText(text, x, y, textsize, ctx, textAlign) {
	var lw = 2
	var color = 'black'

	ctx.save()
	ctx.textAlign = textAlign || "center"
	ctx.font = textsize + "px Sans-serif"
	ctx.lineWidth = lw;
	// ctx.strokeStyle = 'black';
	// ctx.strokeText(text, x, y);
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.restore()
}
	

function _drawStroked(text, x, y, textsize, ctx, textAlign) {
	_drawStrokedColor(text, x, y, textsize, 4, 'white', ctx, false,textAlign)
}
function _drawStrokedColor(text, x, y, textsize,lw, color, ctx, blend,textAlign) {
	ctx.save()
	ctx.textAlign = textAlign || "center"
	ctx.font = textsize + "px Sans-serif"
	ctx.lineWidth = lw;
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = textsize * .1;
	if (blend) { // blend color into border
		ctx.strokeStyle = color;
		ctx.strokeText(text, x, y);
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
	} else { // black border
		ctx.strokeStyle = 'black';
	}
	ctx.strokeText(text, x, y);
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.restore()
}

function _drawArrow(ctx, fromx, fromy, tox, toy){
	// https://stackoverflow.com/a/26080467
	
	//variables to be used when creating the arrow
	
	var color = "#444";
	var headlen = 5;

	var angle = Math.atan2(toy-fromy,tox-fromx);

	//starting path of the arrow from the start square to the end square and drawing the stroke
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.stroke();

	//starting a new path from the head of the arrow to one of the sides of the point
	ctx.beginPath();
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

	//path from the side point of the arrow, to the other side point
	ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

	//path from the side point back to the tip of the arrow, and then again to the opposite side point
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

	//draws the paths created above
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fill();
}

function _unitVector(to,from) {
	var x1 = from.x
	var y1 = from.y
	var x2 = to.x
	var y2 = to.y
	var dx = x2 - x1
	var dy = y2 - y1
	var length = Math.sqrt(dx**2 + dy**2)
	var ux = dx / length
	var uy = dy / length
	return {x:ux, y:uy}
}

function _copyAttributes(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {} // maybe don't need this line?
	for (var name in to) {
		delete to[name]
	}
	for (var name in from) {
		to[name] = from[name];
	}
}

function _addAttributes(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {}
	for (var name in from) {
		to[name] = from[name];
	}
}

function _fillInDefaults(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {} // maybe don't need this line?
	var copy = _jcopy(from);
	for (var name in copy) {
		if(to[name] == undefined) to[name] = copy[name];
	}
}

function _fillInDefaultsByAddress(to,from) {
	from = from || {}
	to = to || {} // maybe don't need this line?
	for (var name in from) {
		if(to[name] == undefined) to[name] = from[name];
	}
}


function _fillInSomeDefaults(to,from,names) {
	from = from || {}
	for (var i in names) {
		if(from[names[i]] == undefined) continue
		if(to[names[i]] == undefined) to[names[i]] = _jcopy(from[names[i]]);
	}
}

function _copySomeAttributes_old(to,from,names) {
	// create copy of 'from'
	var copy = _jcopy(from); // this ran into problems with self.model being a circular reference
	to = to || {}
	for (var i in names) {
		to[names[i]] = copy[names[i]];
	}
}
function _copySomeAttributes(to,from,names) {
	// create copy of 'from'
	to = to || {}
	for (var i in names) {
		if(from[names[i]] == undefined) continue
		to[names[i]] = _jcopy(from[names[i]]);
	}
}

function _jcopy(a) {
	return JSON.parse(JSON.stringify(a))
}

function _objF(obj,f) { // run function if it exists for each item of an object
	for(var item in obj ) {
		if (obj[item][f]) obj[item][f]()
	} 
	// for example: run ui.menu.systems.configure(), ui.menu.nCandidates.configure(), et al.
}

function _rand5() {
	return Math.round(100000 * Math.random())
}

function _randomString(length, chars) { // https://stackoverflow.com/a/10727155
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function _randAlphaNum(n) {
	return _randomString(n, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

function _hashCode(s) { // https://stackoverflow.com/a/7616484
	var hash = 0, i, chr;
	for (i = 0; i < s.length; i++) {
		chr   = s.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}

	// I will only use non-negative integers because it might be easier. 
	// So basically, I'm setting the first bit to 0.
	var half = 2147483648 
	return (hash + half) % half;
}


function _convertImageToDataURLviaCanvas(img, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	canvas.height = img.height;
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL();
	canvas = null; 
	return dataURL
}

function _convertNameToDataURLviaCanvas(letter,color, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var textsize = 120; // retina

	ctx.font = textsize + "px Sans-serif"
	var text = ctx.measureText(letter)

	canvas.height = textsize * 1.25 // extra space because we want uppercase to be centered
	canvas.width = text.width * 1.25
	canvas.style.height = canvas.height
	canvas.style.width = canvas.width

	var x = canvas.width / 2
	var y = textsize
	ctx.textAlign = "center"
	linewidth = textsize / 10
	if (letter.length > 2) {
		reduce = 1.5
		//  _drawStrokedColor(text, x, y, textsize,lw, color, ctx, blend) {
		_drawStrokedColor(letter,x, y / reduce,textsize / reduce,linewidth/reduce,color,ctx, true);
	} else {
		_drawStrokedColor(letter,x,y,textsize,linewidth,color,ctx, true);
	}
	var dataURL = canvas.toDataURL(outputFormat);
	canvas = null; 
	return dataURL
}



function _convertSVGToDataURLviaCanvas(img, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	canvas.height = img.height;
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL(outputFormat);
	canvas = null; 
	return dataURL
}

// helper

function _insertFunctionAfter(object,oldName,next) {
	var old = object[oldName]
    var newf = function () {
        old()
        next()
    }
    object[oldName] = newf
}

function _removeSubnodes(n) {
	while (n.firstChild) {
		n.removeChild(n.lastChild);
	}
}

function _removeClass(element,name) {
	element.className = element.className.replace(new RegExp(name,"g"), "")
}
function _addClass(element,name) {
	element.className = element.className + " " + name
}

function _displayNoneIf(dom,condition) {
    if (condition) {
        _addClass(dom,"displayNoneClass")
    } else {
        _removeClass(dom,"displayNoneClass")
    }
}

function _isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}


var _ajax = {};  // https://stackoverflow.com/a/18078705

_ajax.x = function () {
	if (typeof XMLHttpRequest !== 'undefined') {
		return new XMLHttpRequest();
	}
	var versions = [
		"MSXML2.XmlHttp.6.0",
		"MSXML2.XmlHttp.5.0",
		"MSXML2.XmlHttp.4.0",
		"MSXML2.XmlHttp.3.0",
		"MSXML2.XmlHttp.2.0",
		"Microsoft.XmlHttp"
	];

	var xhr;
	for (var i = 0; i < versions.length; i++) {
		try {
			xhr = new ActiveXObject(versions[i]);
			break;
		} catch (e) {
		}
	}
	return xhr;
};

_ajax.send = function (url, callback, method, data, async) {
	if (async === undefined) {
		async = true;
	}
	var x = _ajax.x();
	x.open(method, url, async);
	x.onreadystatechange = function () {
		if (x.readyState == 4) {
			callback(x.responseText)
		}
	};
	if (method == 'POST') {
		x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}
	x.send(data)
};

_ajax.get = function (url, data, callback, async) {
	var query = [];
	for (var key in data) {
		query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	}
	_ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

function _getRequest(url, callback) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url);
	Http.send();
	
	Http.onreadystatechange = function(e) {
		if (Http.readyState == 4) {
			callback(Http.responseText)
		}
	}
}

// https://stackoverflow.com/a/44134328
function sepHslToHex(h, s, l) {
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

// https://stackoverflow.com/a/36721970
hslToHex = function(hsl) {
	var a, b, g, h, l, p, q, r, ref, s;
	if (hsl.match(/hsla?\((.+?)\)/)) {
	  ref = hsl.match(/hsla?\((.+?)\)/)[1].split(',').map(function(value) {
		value.trim();
		return parseFloat(value);
	  }), h = ref[0], s = ref[1], l = ref[2], a = ref[3];
	} else {
		return hsl
	}

	return sepHslToHex(h, s, l)
}