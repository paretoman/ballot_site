/*****************

What does the base Ballot class need to do?
- handle the *DOM* graphics
- listen to a single type o' voter, and show their pick(s).

******************/

function ScoreBallot(model){

	var self = this;
	model = model || {};
	if (model.startAt1) {
		model.bg = "play/img/ballot_range_original.png";
	} else {
		model.bg = "play/img/ballot_range.png";
	}
	if (model.inSandbox) {
		model.bg = "play/img/ballot5_range.png";
	}
	Ballot.call(self, model);

	// BOXES!
	self.boxes = {
		square: self.createRate(133, 100, 0),
		triangle: self.createRate(133, 143, 3),
		hexagon: self.createRate(133, 184, 1)
	}
	if (model.inSandbox) {
		self.boxes["pentagon"] = self.createRate(133, 226, 1)
		self.boxes["bob"] = self.createRate(133, 268, 1)
	};
	
	// On update...
	self.update = function(ballot){
		// Clear all
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0);
		}
		for(var cID in ballot.scores){
			var score = ballot.scores[cID];
			
			var okScore = (score < 6)
			if (! (self._okCandidate(cID) && okScore)) continue
			if (model.startAt1) {
				self.boxes[cID].gotoFrame(score-1);
			} else {
				self.boxes[cID].gotoFrame(score+1);
			}
		}
	};

}

function ThreeBallot(model){

	var self = this;
	model = model || {};
	model.bg = "play/img/ballot_range3.png";
	if (model.inSandbox) {
		model.bg = "play/img/ballot5_range3.png";
	}
	Ballot.call(self, model);

	// BOXES!
	self.boxes = {
		square: self.createThree(133, 100, 0),
		triangle: self.createThree(133, 143, 3),
		hexagon: self.createThree(133, 184, 1)
	};
	if (model.inSandbox) {
		self.boxes["pentagon"] = self.createThree(133, 226, 1)
		self.boxes["bob"] = self.createThree(133, 268, 1)
	};

	// On update...
	self.update = function(ballot){
		// Clear all
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0);
		}

		for(var cID in ballot.scores){
			var score = ballot.scores[cID];
			var okScore = (score < 6)
			if (! (self._okCandidate(cID) && okScore)) continue
			self.boxes[cID].gotoFrame(score+1);
		}
	};

}

function ApprovalBallot(model){

	var self = this;
	model = model || {};
	model.bg = "play/img/ballot_approval.png";
	if (model.inSandbox) {
		model.bg = "play/img/ballot5_approval.png";
	}
	Ballot.call(self, model);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};
	if (model.inSandbox) {
		self.boxes["pentagon"] = self.createBox(26, 228, 0)
		self.boxes["bob"] = self.createBox(26, 272, 0)
	};

	// On update...
	self.update = function(ballot){

		// Clear all
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0);
		}

		// Check all those who were approved

		for(var cID in ballot.scores){
			var score = ballot.scores[cID];
			if (! (self._okCandidate(cID))) continue
			if (score) {
				self.boxes[cID].gotoFrame(1);
			}
		}

	};

}

function RankedBallot(model){

	var self = this;
	model = model || {};
	model.bg = "play/img/ballot_ranked.png";
	if (model.inSandbox) {
		model.bg = "play/img/ballot5_ranked.png";
	}
	Ballot.call(self, model);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};
	if (model.inSandbox) {
		self.boxes["pentagon"] = self.createBox(26, 228, 0)
		self.boxes["bob"] = self.createBox(26, 272, 0)
	};

	// On update...
	self.update = function(ballot){
		// Clear all
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0);
		}
		for(var i=0; i<ballot.rank.length; i++){
			var candidate = ballot.rank[i];
			var frame = 2 + i;
			var okRank = (i < 5)
			if (! (self._okCandidate(candidate) && okRank)) continue
			self.boxes[candidate].gotoFrame(frame);
		}
	};

}

function PluralityBallot(model){

	var self = this;
	model = model || {};
	model.bg = "play/img/ballot_fptp.png";
	if (model.inSandbox) {
		model.bg = "play/img/ballot5_fptp.png";
	}
	Ballot.call(self, model);

	// BOXES!
	self.boxes = {
		square: self.createBox(26, 98, 0),
		triangle: self.createBox(26, 140, 1),
		hexagon: self.createBox(26, 184, 0)
	};
	if (model.inSandbox) {
		self.boxes["pentagon"] = self.createBox(26, 228, 0)
		self.boxes["bob"] = self.createBox(26, 272, 0)
	};

	// On update...
	self.update = function(ballot){
		var vote = ballot.vote;
		for(var box in self.boxes){
			self.boxes[box].gotoFrame(0); // unchecked...
		}
		if (Object.keys(self.boxes).includes(vote)) {
			self.boxes[vote].gotoFrame(1); // ...except for the one.
		}
	};
}

function Ballot(model){

	var self = this;

	// Create DOM, I s'pose
	self.dom = document.createElement("div");
	self.dom.id = "ballot";
	if (model.bg) self.dom.style.backgroundImage = "url("+model.bg+")"; // Background image...

	// Create Sprite method!
	self.createSprite = function(config){

		var sc = 1
		if(model.inSandbox) {sc = 210/375}

		var sprite = {};

		// DOM
		sprite.dom = document.createElement("div");
		sprite.dom.setAttribute("class", "ballot_sprite");
		sprite.dom.style.backgroundImage = "url("+config.img+")";
		sprite.dom.style.width = (sc*config.w)+"px";
		sprite.dom.style.height = (sc*config.h)+"px";
		sprite.dom.style.left = (sc*config.x)+"px";
		sprite.dom.style.top = (sc*config.y)+"px";

		// Add to my dom.
		self.dom.appendChild(sprite.dom);

		// Method.
		sprite.gotoFrame = function(frame){
			sprite.dom.style.backgroundPosition = "0px -"+(frame*sc*config.h)+"px";
		};
		sprite.gotoFrame(config.frame);

		return sprite;

	};
	self.createBox = function(x,y,frame){
		if (model.inSandbox) {
			return self.createSprite({
				img: "play/img/ballot5_box.png",
				x:x, y:y,
				w:50, h:50,
				frame:frame
			});	
		}
		return self.createSprite({
			img: "play/img/ballot_box.png",
			x:x, y:y,
			w:50, h:50,
			frame:frame
		});
	};
	
	self.createRate = function(x,y,frame){
		if (model.startAt1) {
			return self.createSprite({
				img: "play/img/ballot_rate_original.png",
				x:x, y:y,
				w:225, h:50,
				frame:frame
			});
		} else {
			return self.createSprite({
				img: "play/img/ballot_rate.png",
				x:x, y:y,
				w:216, h:40,
				frame:frame
			});
		}
	};
	self.createThree = function(x,y,frame){
		return self.createSprite({
			img: "play/img/ballot_three.png",
			x:x, y:y,
			w:225, h:50,
			frame:frame
		});
	};

	
	self._okCandidate = function(candidate) {
		if (model.inSandbox) {
			return ["square","triangle","hexagon","pentagon","bob"].includes(candidate)
		} else {
			return ["square","triangle","hexagon"].includes(candidate)
		}
	}
}

