/*********************

Create a group of buttons,
only one of which can be activated at a time.

*********************/

function ButtonGroup(config){

	var self = this;
	self.config = config;

	// check if there is a function to make the data
	// this function can be used later to update the buttons
	if (config.data == undefined) {
		config.data = []
		if (config.makeData == undefined) {
			config.makeData = () => []
		}
		self.makeData = config.makeData
		self.buttonConfigs = self.makeData();
		self.doMakeData = true
	}
	self.buttonConfigs = config.data;

	self.onChoose = config.onChoose;
	self.isCheckbox = config.isCheckbox || false;
	self.isCheckboxBool = config.isCheckboxBool || false;
	self.justButton = config.justButton || false;
	self.buttonHidden = config.buttonHidden || {}

	// DOM!
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "button-group");

	self.init = function() {

		if (self.doMakeData) self.buttonConfigs = self.makeData();

		// clear
		self.dom.innerHTML = ''
		self.buttons = [];
		self.buttonsByName = {}
		
		// Label!
		self.label = document.createElement("div");
		self.label.setAttribute("class", "button-group-label");
		self.draw()
		self.dom.appendChild(self.label);
		
		// Create & place buttons!
		for(var i=0; i<self.buttonConfigs.length; i++){
			var conf = self.buttonConfigs[i];
			var button = new Button(conf, self.onToggle);
			self.buttonsByName[conf.name] = button
			button.dom.style.width = config.width+"px"; // whatever
			if (conf.width) button.dom.style.width = conf.width+"px"; // whatever
			self.buttons.push(button);
			self.dom.appendChild(button.dom);
		}
	
		// And then select the one that says "selected"! Fake a click.
		for(var i=0;i<self.buttons.length;i++){
			var button = self.buttons[i];
			if(button.config.selected){
				button.turnOn();
				break;
			}
		}
		self.draw()
	}
	self.updateNames = function() {
		var data2 = self.makeData()
		for(var i=0; i<self.buttonConfigs.length; i++){
			self.buttonConfigs[i].name = data2[i].name
			self.buttons[i].name = self.buttonConfigs[i].name
		}
	}
	self.redraw = function() {
		self.updateNames()
		self.draw()
	}
	self.draw = function() {
		self.label.innerHTML = config.label;
		for(var button of self.buttons) {
			button.draw()
		}

	}

	self.configureHidden = function() {
		for (var [buttonName,hidden] of Object.entries(self.buttonHidden) ) {
			self.buttonsByName[buttonName].dom.hidden = hidden
		}
	}

	// Toggle buttons
	self.onToggle = function(button, buttonData){
		if (self.isCheckbox || self.isCheckboxBool) {
			if (button.isOn) {
				button.turnOff();
			} else {
				button.turnOn();
			}
		} else { // justButton means it doesn't get selected
			// Turn all off
			for(var i=0;i<self.buttons.length;i++) self.buttons[i].turnOff();
			button.turnOn(); // except one
			if (self.justButton) {
				// turn on for a little while, then off
				setTimeout( () => button.turnOff() , 800);
			}
		}
		// And send the data up
		self.onChoose(buttonData);

	};

	// Highlight based on data...
	self.highlight = function(propName, propValue){
		
		// if we haven't set up the buttons yet, then don't do anything yet
		if (self.buttons.length == 0) return

		// Turn all off
		for(var i=0;i<self.buttons.length;i++) self.buttons[i].turnOff();
		
		if (self.isCheckbox) {
			for (ibu in self.buttons) {
				var bu = self.buttons[ibu]
				if (propValue.includes(bu.config[propName])) { // the propValue is an array of values
					bu.turnOn();
				}
			}
		} else if (self.isCheckboxBool) {
			for (ibu in self.buttons) {
				var bu = self.buttons[ibu]
				buttonName = bu.config[propName]
				// if (Object.keys(propValue).includes(buttonName)) { // the propValue is an array of values
				if (buttonName in propValue) {
					if (propValue[buttonName]) {
						bu.turnOn();
					}
				}
			}
		} else {
			// Find the one...
			var theButton =self.buttons.filter(function(button){
				var config = button.config;
				return (config[propName]==propValue);
			})[0];
			if (theButton != undefined) {
				theButton.turnOn();
			}
		}
	};

	self.init()

}

function Button(buttonConfig, onChoose){

	var self = this;

	self.config = buttonConfig;
	self.name = buttonConfig.name
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "button");
	self.dom.style.marginRight = buttonConfig.margin+"px";

	// Click!
	self.draw = function() {
		self.dom.innerHTML = self.name
	}
	self.draw()
	self.dom.setAttribute("title", buttonConfig.realname || "");
	self.onClick = function(){
		onChoose(self, buttonConfig);
	};
	self.dom.onclick = self.onClick;
	// Turn on or off!
	self.turnOff = function(){
		self.isOn = false;
		self.config.isOn = false;
		self.dom.setAttribute("on", "no");
	};
	self.turnOn = function(){
		self.isOn = true;
		self.config.isOn = true;
		self.dom.setAttribute("on", "yes");
	};
	self.turnOff();

}