// this handles moving a 2D set of points and ballots into a 1D list.  And it keeps similar voters together.

var breakRingTSP = true

/* Sample of a city */
function Sample() {
  this.x = 0.0;
  this.y = 0.0;
};

Sample.prototype.draw = function(canvas) {
	var centerX = this.x * canvas.width;
	var centerY = canvas.height - this.y * canvas.height;
	var ctx = canvas.ctx;
  ctx.fillStyle = "#C06060";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
};

/* a node in the neural network */
function Node(x, y, b) {
  this.x = x;
  this.y = y;
  this.b = [];
  for (var i=0; i< b.length; i++) {
    this.b[i] = b[i]
  }
  this.right = this;
  this.left = this;
  this.life = 3;
  this.inhibitation = 0;
  this.isWinner = 0;
}

/* the distance of the euclidian points */
Node.prototype.potential = function(sample) {
  var dx = sample.x - this.x
  var dy = sample.y - this.y
  var db2 = 0
  for (var i = 0; i < sample.b.length; i++) {
    db = sample.b[i] - this.b[i]
    db2 += db * db * 739 * 739
  }
  return dx * dx + dy * dy + db2
};

/* moves a single node in direction to the sample */
Node.prototype.move = function(city, value) {
  this.x += value * (city.x - this.x);
  this.y += value * (city.y - this.y);
  for (var i = 0; i < city.b.length; i++) {
    this.b[i] += value * (city.b[i] - this.b[i]);
  }
};

/* computes the number of nodes between the to nodes on the ring */
Node.prototype.distance = function(other, length) {
  var right = 0;
  var left = 0;
  var current = other;

  if (breakRingTSP) {
    var notleft = false
    while (current != this) {
      if (current.isStart) notleft = true
      current = current.left;
      left++;
    }
    if (notleft) {
      current = other
      while (current != this) {
        current = current.right;
        right++;
      }  
      return right
    } else {
      return left
    }
  } else {
    while (current != this) {
      current = current.left;
      left++;
    }
    right = length - left;
    return (left < right) ? left : right;
  
  }
};

Node.prototype.draw = function(canvas) {
	var centerX = this.x * canvas.width + 0.5;
	var centerY = canvas.height - this.y * canvas.height + 0.5;
	var ctx = canvas.ctx;
  ctx.fillStyle = "#208020";
	ctx.fillRect(centerX, centerY, 1, 1);
	if (this.right != null) {
		ctx.lineTo(this.right.x * canvas.width + 0.5, canvas.height - this.right.y * canvas.height + 0.5);
	}	
};

/* the neural network as a ring of neurons */
function Ring(start) {
	this.start = start;
  this.length = 1;
  if (breakRingTSP) start.isStart = true;
}

/* moves all nodes to in direction of the sample */
Ring.prototype.moveAllNodes = function(city, gain) {
  var current = this.start;
  var best = this.findMinimum(city);

  for (var i=0; i<this.length; i++) {
    current.move(city, this.f(gain, best.distance(current, this.length)));
    current = current.right;
  }
};

/* finds the node with the least distance to the sample */
Ring.prototype.findMinimum = function(city) {
  var actual;
  var node = this.start;
  var best = node;
  var min = node.potential(city);
  for (var i=1; i<this.length; i++) {
    node = node.right;
    actual = node.potential(city);
    if (actual < min) {
      min = actual;
      best = node;
    }
  }
  best.isWinner++;
  return best;
};

/* deletes a node */
Ring.prototype.deleteNode = function(node) {
  var previous = node.left;
  var next = node.right;

  if (previous != null) {
    previous.right = next;
  }
  if (next != null) {
    next.left = previous;
  }
  if (next == node) {
    next = null;
  }
  if (this.start == node) {
    this.start = next;
    if (breakRingTSP) this.start.isStart = true
  }
  this.length--;
};

/* a node is duplicated & inserted into the ring */
Ring.prototype.duplicateNode = function(node) {
  var newNode = new Node(node.x, node.y, node.b);
  var next = node.right;
  next.left = newNode;
  node.right = newNode;
  node.inhibitation = 1;  
  newNode.right = next;
  newNode.left = node;
  newNode.inhibitation = 1;
  this.length++;
};

/* length of tour */
Ring.prototype.tourLength = function() {
  var dist = 0.0;
  var current = this.start;
  var previous = current.left;

  for (var i=0; i<this.length; i++) {
      
    var db2 = 0
    for (var k = 0; k < current.b.length; k++) {
      var db = current.b[k] - previous.b[k]
      db2 += db * db * 739 * 739
    }
    var dx = current.x - previous.x
    var dy = current.y - previous.y
    dist += Math.sqrt( dx * dx + dy * dy + db2 );
    current = previous;
    previous = previous.left;
  }
  return dist;
};

Ring.prototype.f = function(gain, n) {
	return (0.70710678 * Math.exp(-(n * n) / (gain * gain)));
};

/* the simulator containing all the data */
function TravelingSalesman() {
  this.N = 100; /* Number of cities. */
  this.cycle = 0; /* Number of complete survey done */
  this.maxCycles = 100; /* Number of complete suerveys */
  this.cities = null; /* the samples */
  this.neurons = null; /* the neurons */
  this.alpha = 0.04; /* learning rate */
  this.gain = 50.0; /* gain */
  this.lastLength = null; /* length of tour */
  this.isRunning = false;
  this.update = 5; /* screen update */
  this.justplugin = false;
}

/* creates the first node (ring) */
TravelingSalesman.prototype.createFirstNeuron = function() {
  if (this.justplugin) {
    // find average
    bnew = []
    for (var k = 0; k < this.cities[0].b.length; k++) {
      bnew.push(0.5);
    }
    var start = new Node(0.5, 0.5, bnew);
  } else {
    var start = new Node(0.5, 0.5);
  }
  this.neurons = new Ring(start);
};

/* deletes all nodes */
TravelingSalesman.prototype.deleteAllNeurons = function() {
  if (this.neurons != null) {
    while (this.neurons.start != null) {
    	this.neurons.deleteNode(this.neurons.start);
    }
    this.neurons = null;
  }
};

/* prints positions of cities & nodes */
TravelingSalesman.prototype.print = function() {
	console.log("TSP: N= " + this.N + ", cycle=" + this.cycle + ", lastLength=" + this.lastLength);
  for (var i=0; i<this.cities.length; i++) {
  	var c = this.cities[i];
    console.log("City: " + i + " (" + c.x + "," + c.y + ")");
  }
  var n = this.neurons.start;
  for (i=0; i<this.neurons.length; i++) {
    console.log("Node: " + i + "(" + n.x + "," + n.y + ")");
    n = n.right;
  }
};

/* creates & displaces randomly a given number of cities, returns the first */
TravelingSalesman.prototype.createRandomCities = function() {
  this.cities = new Array(this.N);
  for (var i=0; i<this.N; i++) {
  	var c = new Sample();
    c.x = Math.random();
    c.y = Math.random();
    this.cities[i] = c;
  }
};

TravelingSalesman.prototype.stop = function() {
  this.isRunning = false;
  if (this.justplugin != true) {   
    this.repaint();
    this.cities = null;
  }
	this.deleteAllNeurons();
};

TravelingSalesman.prototype.start = function() {
	this.stop();
	this.init();
	this.isRunning = true;
	this.run();
};

TravelingSalesman.prototype.init = function() {
  this.cycle = 0;
  this.lastLength = null;
  this.createFirstNeuron();
  if (this.justplugin != true) {
    this.createRandomCities();
    this.canvas = new Canvas(document.getElementById('canvas'));
    this.repaint();
  }
};

TravelingSalesman.prototype.run = function() {
  if (this.neurons != null) {
    if (this.cycle < this.maxCycles && this.isRunning) {
      var done = this.surveyRun();
    	if (!done) {
        var self = this;
        if (this.justplugin != true) {
          window.setInterval(function() { self.run(); }, 100);
        }
    		self.run();
    		return;
    	}
    }
    if (this.isRunning) {
    	//this.print();
      this.isRunning = false;
      if (this.justplugin != true) {
        this.repaint();
      }
    }
  }
};

/* one cycle in the simulation */
TravelingSalesman.prototype.surveyRun = function() {
  var done = false;
  if (this.neurons != null) {
    for (var i=0; i<this.cities.length; i++) {
      this.neurons.moveAllNodes(this.cities[i], this.gain);
    }
  }
  this.surveyFinish();
  this.gain = this.gain * (1 - this.alpha);
  if (this.cycle++ % this.update == 0) {
    var length = this.neurons.tourLength();
  	//this.print();
    this.repaint();
    if (length == this.lastLength) {
      done = true;
    } else {
      this.lastLength = length;
    }
  }
  return done;	
};

/* after moving creating & deleting is done */
TravelingSalesman.prototype.surveyFinish = function() {
  if (this.neurons == null) {
    return;
  }
  var node = this.neurons.start;
  for (var i=0; i<this.neurons.length; i++) {
    node.inhibitation = 0;
    switch (node.isWinner) {
    case 0:
      node.life--;
      if (node.life == 0) {
        this.neurons.deleteNode(node);
      }
      break;
    case 1:
      node.life = 3;
      break;
    default:
      node.life = 3;
      this.neurons.duplicateNode(node);
      break;
    }
    node.isWinner = 0;
    node = node.right;
  }
};

TravelingSalesman.prototype.repaint = function() {
	if (!this.canvas) {
		return;
	}
	this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
	if (this.cities) {
	  for (var i=0; i<this.cities.length; i++) {
	  	var c = this.cities[i];
	  	c.draw(this.canvas);
	  }
	}

  if (this.neurons) {
	  this.canvas.ctx.strokeStyle = "#80D080";
	  this.canvas.ctx.beginPath();
	  var n = this.neurons.start;
	  this.canvas.ctx.moveTo(n.x * this.canvas.width + 0.5, this.canvas.height - n.y * this.canvas.height + 0.5);
	  for (i=0; i<this.neurons.length; i++) {
	  	n.draw(this.canvas);
	    n = n.right;
	  }
	  this.canvas.ctx.lineWidth = 1;
	  this.canvas.ctx.stroke();	
	  this.canvas.ctx.closePath();
  }  
	$('#cycle').val(this.cycle);
	$('#length').val(this.lastLength);
	$('#done').prop('checked' , !this.isRunning);
	if (this.isRunning) {
		$('#run').attr('disabled', 'disabled');
		$('#stop').removeAttr('disabled');
	} else {
		$('#stop').attr('disabled', 'disabled');
		$('#run').removeAttr('disabled');
	}
};

TravelingSalesman.prototype.setupForm = function() {
	var self = this;
	$('#cities').val(this.N);
	$('#maxCycles').val(this.maxCycles);
	$('#alpha').val(this.alpha);
	$('#gain').val(this.gain);
	$('#run').bind("click", function(event) {
		self.N = $('#cities').val();
		self.maxCycles = $('#maxCycles').val();
		self.alpha = $('#alpha').val();
		self.gain = $('#gain').val();
		self.start();
	});
	$('#stop').bind("click", function(event) {
		self.stop();
	});
};

function Canvas(elem) {
	this.elem = elem;
	this.ctx = elem.getContext('2d');	
	this.height = elem.height;
	this.width= elem.width;
}


TravelingSalesman.prototype.runOnSet = function (cities) {
  this.justplugin = true;
  this.cities = cities;
  this.start();
}

TravelingSalesman.prototype.getOrder = function() {
  // get a list of id's of points in order of how they should appear.

  // the neurons are in order, so lets put the cities in order by finding which neuron each city is closest to

  var next = this.neurons.start
  for (var k=0; k < this.neurons.length; k++) {
    next.c = []
    next = next.right
  }

  // find nearest node to each city
  // add the city's index to the node
  for (var n=0; n < this.cities.length; n++) { // city n
    var next = this.neurons.start
    var closest = next
    var min = Infinity
    for (var k=0; k < this.neurons.length; k++) { // neuron k
      var dx = this.cities[n].x - next.x
      var dy = this.cities[n].y - next.y
      var dist2 = dx*dx + dy*dy
      if (dist2 < min) {
        closest = next
        min = dist2
      }
      next = next.right
    }
    closest.c.push(n)
  }

  // find order of each city by going through each node and listing the cities 
  var next = this.neurons.start
  var order = []
  for (var k=0; k < this.neurons.length; k++) { // neuron k
    for (var n=0; n < next.c.length; n++) {
      order.push(next.c[n])
    }
    next = next.right
  }
  return order
}


function dostuff() {
  points = new Array(100);
  for (var i=0; i<points.length; i++) {
  	var c = new Sample();
    c.x = Math.random();
    c.y = Math.random();
    c.i = i;
    points[i] = c;
  }
  
  var tsp = new TravelingSalesman(); 
  tsp.runOnSet(points)
  var order = tsp.getOrder()
  console.log(order)
}

// dostuff()

/*

https://github.com/kifj/tsp-js
https://observablehq.com/@fil/som-tsp

order = {
  const D = d3.Delaunay.from(som.neurons);
  const order = points.map(d => D.find(d[0], d[1]));
  // return the new order — if something goes wrong (we receive -1), use the previous value
  return order[0] === -1 ? this : order;

  /*

  // Quadtree version
  const D = d3
    .quadtree()
    .addAll(som.neurons.map((d, i) => Object.assign(d, { index: i })));
  const order = points.map(d => D.find(d[0], d[1]).index);
  return order[0] === -1 ? this : order;

   */
