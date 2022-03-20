function Draggable(){ // Voter and Candidate classes are extended to make them draggable objects in an arena.
	// sanity rules: Draggable class creation code cannot read attributes from model.

	var self = this;
	// CONFIGURE DEFAULTS
	self.x = 0
	self.y = 0
	self.size = 20
	self.grabsize = 20

	self.touchAdd = 30 // add this to get bigger distances for touch events
	self.radiusScale = 25/40

	
	self.init = function () {
		self.offX = 0;
		self.offY = 0;
	}

	self.hitTest = function(x,y,arena){
		var a = arena.modelToArena(self)
		var r = self.grabsize * self.radiusScale
		if (arena.mouse.isTouch) r += self.touchAdd
		return self.generalHitTest(r, x, y, a.x, a.y)
	}
	self.generalHitTest = function(radius,x1,y1,x2,y2){
		var dx = x1-x2;
		var dy = y1-y2;
		return((dx*dx+dy*dy) < radius*radius);
	};

	self.objectMouseHitTest = function(radius, o, arena) {
		var a = arena.modelToArena(o)
		return self.generalHitTest(radius, a.x, a.y, arena.mouse.x, arena.mouse.y)
	}
	
	self.hitDistance = function(x,y,arena){
		var a = arena.modelToArena(self)
		var dx = x-a.x;
		var dy = y-a.y;
		return dx*dx+dy*dy;
	};

	self.newArenaPosition = function(x,y) {
		// propose a new x and y, based only on the mouse
		var a = {}
		a.x = x+self.offX
		a.y = y+self.offY
		return a
	}

	self.offX = 0;
	self.offY = 0;
	self.startDrag = function(arena){
		var a = arena.modelToArena(self)
		self.offX = a.x-arena.mouse.x;
		self.offY = a.y-arena.mouse.y;
	};

	self.update = function(){
		// TO IMPLEMENT
	};

	self.draw = function(ctx){
		// TO IMPLEMENT
	};

}

function DraggableManager(arena,model){

	var self = this;

	// Helper: is Over anything?
	self.isOver = function(){
		// make a list
		var lowTie = []
		var middleTie = []
		var highTie = []
		var checklow = true
		var checkmiddle = true
		for(var i=arena.draggables.length-1; i>=0; i--){ // top DOWN.
			var d = arena.draggables[i];
			if (d.isModify && arena.mouse.dragging && arena.mouse.dragging.isModify) continue // skip the mod gear, you're dragging it to a target and you want to find it
			if(d.hitTest(arena.mouse.x, arena.mouse.y,arena)){
				if (d.isVoterCenter && arena.mouse.dragging && arena.mouse.dragging.isModify) continue // skip the voterCenter if we are the mod gear.
				// low priority
				if ( (d.isModify && d.active) || d.isright || d.isUp || d.isDown || ( model.yeeon && d == model.yeeobject ) ) {
					highTie.push(d)
					checkmiddle = false
					checklow = false
				} else if ( checkmiddle && (d.isCandidate || d.isVoter || d.isVoterCenter) ) {
					middleTie.push(d)
					checklow = false
				} else if (checklow) { // (d.istrash || d.isplus || (d.isModify && ! d.active) )
					// middle priority
					lowTie.push(d)
				}
			}
		}
		// there should be two priority classes, and we should pick among the high priorities first
		if (highTie.length > 0) return _getClosest(highTie)
		if (middleTie.length > 0) return _getClosest(middleTie)
		if (lowTie.length > 0) return _getClosest(lowTie)
		return null

		function _getClosest(tie) {
			if (tie.length == 1) return tie[0]
			// which of the tied objects is closest?
			var min = Infinity
			var closest = null
			for( var i = 0; i < tie.length; i++) {
				var d = tie[i].hitDistance(arena.mouse.x, arena.mouse.y,arena)
				if (d < min) {
					min = d
					closest = tie[i]
				}
			}
			return closest
		}
	}

	self.nearestVoterToMouse = function() {
		var min = Infinity
		var closest = null

		for (var voterGroup of model.voterGroups) {
			for (var voterPerson of voterGroup.voterPeople) {
				var a = arena.modelToArena(voterPerson)
				let dx = a.x - arena.mouse.x
				let dy = a.y - arena.mouse.y
				var d2 = dx * dx + dy * dy
				if (min > d2) {
					min = d2
					closest = voterPerson
				}
			}
		}

		return closest
	}

	// INTERFACING WITH THE *MOUSE*
	self.mousemove =  function(event){
		var dragging = arena.mouse.dragging
		if (dragging) {
			event.preventDefault()
			event.stopPropagation()
		}
		if(dragging && dragging.isViewMan) {
			dragging.drag(arena)
		} else if(arena.mouse.pressed && ! (dragging && dragging.isModify)){
			// open the trash can
			if (dragging) {
				if (model.arena.mouse.dragging) {
					if (model.showToolbar == "on") {
						// if we are in the main arena, then do the trash test
						model.arena.trashes.test();
					}
				}
				model.update();
			}
		}else if(self.isOver() || (dragging && dragging.isModify)){
			// If over anything, grab cursor!
			arena.canvas.setAttribute("cursor", "grab");
			// also, highlight one object
			// set all objects to not highlight
			for(var i=arena.draggables.length-1; i>=0; i--){ // top DOWN.
				var d = arena.draggables[i];
				d.highlight = false
			}
			var flashydude = self.isOver()
			if (flashydude) flashydude.highlight = true
			if (dragging && dragging.isModify) model.update()
			model.drawArenas()
			self.lastwas = "hovering"
		}else{
			// Otherwise no cursor
			arena.canvas.setAttribute("cursor", "");
			if ( self.lastwas == "hovering"){
				for(var i=arena.draggables.length-1; i>=0; i--){ // top DOWN.
					var d = arena.draggables[i];
					d.highlight = false
				}
				model.drawArenas()	
			}
			self.lastwas = "nothovering"
		}
	}
	self.mousedown =  function(){

		// Didja grab anything? null if nothing.
		var d = self.isOver();

		// If so...
		if(d){
			
			// special case.. adding a candidate
			if (d.istrash) return
			if (d.isplus) {
				n = d.doPlus(false) // plus stuff
				d = n // switcheroo ... so the candidate pops out of the plus sign
			}

			// move it
			arena.mouse.dragging = d
			d.startDrag(arena);
			if (arena.mouse.ctrlclick) { // we toggled this guy as a winner
				d.selected = ! d.selected
			}
			model.update();

			if(d.isViewMan) d.drag(arena) // act as if we are already dragging viewMan

			// GrabBING cursor!
			arena.canvas.setAttribute("cursor", "grabbing");

		}

	}
	self.mouseup =  function(){
		var dragging = arena.mouse.dragging
		if (dragging) { // we are dragging something, not just air
			model.onDrop() // drop in trash if there is one
			
			if (dragging.isViewMan) {
				dragging.drop()
				model.drawArenas()
			} else if (dragging.isGear) {
				var flashydude = self.isOver()
				dragging.doModify(flashydude)
				model.drawArenas()
			} else {
				model.update();
			}
			arena.mouse.dragging = null;
			model.update()
			
		}
	}

}