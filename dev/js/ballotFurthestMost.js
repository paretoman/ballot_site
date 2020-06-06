
function main_ballot(ui){
	// See sandbox.js for documentation
	// main_ballot is a little different because there is no save button
	// Some variables in config cannot be changed by the user.
	// So, if we were going to save, then it would be good to not keep those in config.

	// The config is basically a text version of the model.
	// The model should store all its variables
	// and the model should always make decisions based on its own variables
	// because maybe those variables could change without updating the config
	// because some things happen internally in the model.

	// The only way the model can hook back into the ui is by providing a callback in main_ballot.
	// Otherwise, it is a one way street.
	// The config updates the model.
	// The model does not update the config.

	// The reason why some things are in start and others are not is that some need assets and others do not.
	// So, the ui.start function could include more or less things before it, depending on how we want to laoad assets.
	// For instance, we could lazy load all the assets when they become required to draw on a button.




	// decide how you're going to simulate the user
	// possibly change what tasks you're going to assign to the user
	//   for example, having a different way of drawing the ui
	//   like having a different number of buttons
	// simulate the user
	//   draw all the buttons
	//   all the onClick events
	//     what if one onClick event triggers another?
	//     we have to decide which events to do and then do them all
	//     ui.configure then ui.update
	//     just like configureModel and then model.update
	//     schedule, arrange, build, prepare, plan, add, equip, design, 
	//     plan tasks and build ui

	// build


	// config is the ui's plan for the model

	// information goes from the plan to the ui
	// just like it goes from the config to the model

	// Also, you want a heirarchy so you don't get race conditions.
	// The ui sets a callback in the model that calls ui.update. 
	//  ui.update calls model.update. model.update does not call ui.udpate

	// Here's an example:
	// Update the ui buttons to match the number of candidates.
	// set a callback in the model to update only the model, not the ui
	// so to update the ui, we have to make its own update

	// well, it looks like I 

	// The steps for the ui:
	// first you planIt, 
	// then you createDOM,
	//  then you initDOM
	// These are additional steps to add on to the model.
	

	// By adding these steps, 
	// we should be able to have one function 
	// take care of both main_ballot() and sandbox().
	// This allows us to extend to additional user interfaces,
	// and maybe switch between them.
	// That means it's a good thing we kept thePlan and config separated.

	// build ui : static

    // handle input
    if (ui == undefined) ui = {}
    var a = new Attach(ui)
    a.handleInputMain()

	var model = new Model(ui.idModel)
	a.attachDOM(model)

    var config = {}
	var initialConfig = {}
	var thePlan = {}
	
	// load the config
	// kind of regretting making the ui the master object now
	configBallot(config, initialConfig, ui.preset.config)
	
	// fix the plan
	// get the plan ready for use, if it isn't already.  
	// config is here because we still just use one variable config to set up two things, ui and model
	setPlan(thePlan,config)


	// set up the plan for use
	bindUI(ui,model,config,initialConfig,thePlan)
	bindBallotModel(ui,model,config)
	bindBallotMenu(ui,model,config)

	// starts ui, according to plan
	ui.planIt()
	model.planIt()

	

    ui.onload = function(assets){  
		// this line of code could go up or down, depending on whether we really need to load assets
		// for example, createDOMB needs assets, and initDOM definitely needs assets
		
		// INIT
		model.assets = assets
		
		ui.createDOM()

		model.initDOM()
		model.start();
		
    }; 

	var l = new Loader()
	l.onload = ui.onload
	l.load(main_ballot.assets);




}

function setPlan(thePlan,config) {
	thePlan.newWay = thePlan.newWay || false
	thePlan.way1 = true
	thePlan.system = config.system  // it would also make it look nicer to separate config and plan
	thePlan.showChoiceOfStrategy = config.showChoiceOfStrategy || false
	thePlan.showChoiceOfFrontrunners = config.showChoiceOfFrontrunners || false
}

function bindUI(ui,model,config,initialConfig,thePlan) {
	
	ui.planIt = function () {
		// binds UI to plan
		ui.newWay = thePlan.newWay
		ui.way1 = thePlan.way1
		ui.BallotType = window[thePlan.system+"Ballot"]
		ui.showChoiceOfStrategy = thePlan.showChoiceOfStrategy
		ui.showChoiceOfFrontrunners = thePlan.showChoiceOfFrontrunners
	}
	
	ui.createDOM = function() {
		// CREATE the divs
		 // executes the plan
		// builds the ui
		createDOMB(ui,model) 
		createMenuB(ui)
		createUIArenaB(ui,model,config,initialConfig)
	
		// run some extra stuff specified by the preset
		if (ui.preset.update) {
			ui.preset.update()
		}

	}
}

function configBallot(config,initialConfig, presetConfig){

	_copyAttributes(config, presetConfig)

	var translate = {
		Plurality:"FPTP",
		Ranked:"IRV",
		Approval:"Approval",
		Score:"Score"
	}
	config.method = config.method || translate[config.system]
	config.firstStrategy = config.firstStrategy || "zero strategy. judge on an absolute scale.";
	config.preFrontrunnerIds = config.preFrontrunnerIds || ["square","triangle"];
	config.doStarStrategy = config.doStarStrategy || false
	config.theme = config.theme || "Default"
	config.dimensions = config.dimensions || "2D"
	config.namelist = ""
	config.customNames = "No"

	// grandfather name for firstStrategy used only for main_ballot
	if (config.strategy != undefined) config.firstStrategy = config.strategy

	// make a copy of the config
	_copyAttributes(initialConfig,config)

}

function createDOMB(ui,model) {
	// This is what the ui is all about.  It makes the DOM.

	// CREATE div stuff
	model.createDOM()

	ui.dom.left = newDivOnBase("b-left")
	ui.dom.right = newDivOnBase("b-right")
	function newDivOnBase(name) {
		var a = document.createElement("div");
		a.setAttribute("id", name);
		ui.dom.basediv.appendChild(a);
		return a
	}

	ui.dom.left.appendChild(model.dom);
	
	// CREATE A BALLOT
	if (ui.newWay) { // build ui
		if (ui.way1) {
			ui.dom.caption = document.createElement("div");
			ui.dom.caption.id = "caption";
			ui.dom.right.appendChild(ui.dom.caption)
		}
	} else {
		ui.dom.ballot = new ui.BallotType(model);
		ui.dom.right.appendChild(ui.dom.ballot.dom)
	}


}

function bindBallotModel(ui,model,config) {

	model.planIt = function() {
		// LOAD
		model.size = 250
		model.border = 2
		model.VoterType = window[config.system+"Voter"];
		model.system = config.method
		model.newWay = ui.newWay
	}

	model.start = function(){

		// CREATE
		model.voters.push(new SingleVoter(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		model.voterCenter = new VoterCenter(model)
		// CONFIGURE
		Object.assign( model.candidates[0],{x: 41, y: 50, icon:"square"} )
		Object.assign( model.candidates[1],{x:153, y: 95, icon:"triangle"} )
		Object.assign( model.candidates[2],{x:216, y:216, icon:"hexagon"} )
		Object.assign( model.voters[0],    {x: 81, y: 92, type: new model.VoterType(model),
			firstStrategy: config.firstStrategy,
			preFrontrunnerIds: config.preFrontrunnerIds} )
		model.preFrontrunnerIds = config.preFrontrunnerIds;
		model.firstStrategy = config.firstStrategy
		model.doStarStrategy = config.doStarStrategy;
		model.theme = config.theme
		model.dimensions = config.dimensions
		model.customNames = config.customNames
		model.namelist = config.namelist.split("\n")
		// INIT
		model.candidates[0].init()
		model.candidates[1].init()
		model.candidates[2].init()
		model.initMODEL()
		model.voters[0].init()
		model.arena.redistrict()
		// UPDATE
		model.update()

		ui.selectMENU();

	};

	model.onUpdate = function(){
		if (model.voters.length == 0) return
		if (model.voters[0].voterGroupType == "GaussianVoters") return
		if (model.newWay) {
			// onDraw
		} else {
			ui.dom.ballot.update(model.voters[0].ballot);
		}
	};

	model.onDraw = function(){	
		if(model.showChoiceOfFrontrunners) {
			ui.menu.chooseFrun.buttonConfigs = ui.menu.frun.frunMakelist()
			ui.menu.chooseFrun.init()
		}

		if (model.voters.length == 0) return
		if (model.voters[0].voterGroupType == "GaussianVoters") return
		if (model.newWay) {
			var text = model.voters[0].type.toTextH(model.voters[0].ballot);
			if (model.placeHolding) {
				if (model.nLoading > 0) {
					// will do on next draw
					return
				} else {
					// ready to replace
					text = text.replace(/\^Placeholder{(.*?)}/g, (match, $1) => {
						return model.icon($1)
					});  // https://stackoverflow.com/a/49262416
				}
			}
			if (ui.way1) {
				ui.dom.caption.innerHTML = text
			} else {
				ui.dom.right.innerHTML = text
			}
		}
	}

}


function bindBallotMenu(ui,model,config) {

	ui.menu = {}

	ui.menu.strategy = {}

	var strategyOn = [
		{name:"O", realname:"zero strategy. judge on an absolute scale.", margin:4},
		{name:"N", realname:"normalize", margin:4},
		{name:"F", realname:"normalize frontrunners only", margin:4},
		{name:"F+", realname:"best frontrunner", margin:4},
		{name:"F-", realname:"not the worst frontrunner"}
	];
	// old ones
	// {name:"FL", realname:"justfirstandlast", margin:4},
	// {name:"T", realname:"threshold"},
	// {name:"SNTF", realname:"starnormfrontrunners"}
	var onChooseVoterStrategyOn = function(data){
		config.firstStrategy = data.realname;
		model.firstStrategy = config.firstStrategy
		model.voters[0].firstStrategy = config.firstStrategy;
		model.update();

	};
	ui.menu.strategy.createDOM = function() {
		ui.menu.strategy.chooseVoterStrategyOn = new ButtonGroup({
			label: "which strategy?",
			width: 42,
			data: strategyOn,
			onChoose: onChooseVoterStrategyOn
		});
	}

	ui.menu.frun = {}

	function _iconButton(id) {
		return "<span class='buttonshape'>"+model.icon(id)+"</span>"
	}
	frun = [];
	frunMakelist = function() {
		var a = []
		for (var i=0; i < model.candidates.length; i++) {
			var c = model.candidates[i]
			a.push({
				name:_iconButton(c.id),
				realname:c.id,
				margin:5
			})
		}
		a[a.length-1].margin = 0
		return a
	}
	
	var onChooseFrun = function(data){

		// update config...
		// no reset...
		if (data.isOn) {
			if (!config.preFrontrunnerIds.includes(data.realname) ) {config.preFrontrunnerIds.push(data.realname)}
		} else {
			var index = config.preFrontrunnerIds.indexOf(data.realname);
			if (index > -1) {
				config.preFrontrunnerIds.splice(index, 1);
			}
		}
		model.preFrontrunnerIds = config.preFrontrunnerIds
		model.update();

	};
	ui.menu.frun.createDOM = function() {
		// This is an important change.  It allows the user to put this whole bindBallotMenu function earlier in the code's logic
		// That allows the coder to put more information into the menu item's section of code,
		// which makes the code easier to read.
		frunMakelist()
		ui.menu.frun.chooseFrun = new ButtonGroup({
			label: "who are the frontrunners?",
			width: 42,
			data: frun,
			onChoose: onChooseFrun,
			isCheckbox: true
		});
	}

	ui.selectMENU = function(){
		if(ui.menu.strategy.chooseVoterStrategyOn) ui.menu.strategy.chooseVoterStrategyOn.highlight("realname", model.voters[0].firstStrategy);
		if(ui.menu.chooseFrun) ui.menu.chooseFrun.highlight("realname", model.preFrontrunnerIds);
	};

}


function createMenuB(ui) {
	if(ui.showChoiceOfStrategy) {
		ui.menu.strategy.createDOM()
		ui.dom.left.appendChild(ui.menu.strategy.chooseVoterStrategyOn.dom);
	}
	if(ui.showChoiceOfFrontrunners) {
		ui.menu.frun.createDOM()
		ui.dom.left.appendChild(ui.menu.frun.chooseFrun.dom);
	}
}
	


function createUIArenaB(ui,model,config,initialConfig) {
	//////////////////////////
	//////// RESET... ////////
	//////////////////////////

	// CREATE A RESET BUTTON
	var resetDOM = document.createElement("div");
	resetDOM.id = "reset";
	resetDOM.innerHTML = "reset";
	resetDOM.onclick = function(){
		// LOAD
		_copyAttributes(config, initialConfig)
		// CREATE, CONFIGURE, INIT, UPDATE
		model.reset()
		// UPDATE
		ui.selectMENU()
	};
	ui.dom.left.appendChild(resetDOM);
}

main_ballot.assets = [
	
	// the peeps
	"play/img/voter_face.png",

	"play/img/square.png",
	"play/img/triangle.png",
	"play/img/hexagon.png",
	"play/img/pentagon.png",
	"play/img/bob.png",

	"play/img/square.svg",
	"play/img/triangle.svg",
	"play/img/hexagon.svg",
	"play/img/pentagon.svg",
	"play/img/bob.svg",

	"play/img/blue_bee.png",
	"play/img/yellow_bee.png",
	"play/img/red_bee.png",
	"play/img/green_bee.png",
	"play/img/orange_bee.png",

	// plus
	"play/img/plusCandidate.png",
	"play/img/plusOneVoter.png",
	"play/img/plusVoterGroup.png",

	// Ballot instructions
	"play/img/ballot5_fptp.png",
	"play/img/ballot5_ranked.png",
	"play/img/ballot5_approval.png",
	"play/img/ballot5_range.png",

	// The boxes
	"play/img/ballot5_box.png",
	"play/img/ballot_rate.png",
	"play/img/ballot_three.png"

];