var l = new Loader()
l.onload = function(assets){

	// CREATE

	var presetName = "model3"
	var model = new Model(presetName);
	model.assets = assets
	model.theme = "Nicky"
	model.createDOM()

	// INIT
	model.initDOM()
  var basediv = document.querySelector("#" + presetName)
  basediv.appendChild(model.dom);

	model.initPlugin = function(){
		// CREATE
		model.voterGroups.push(new GaussianVoters(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		// CONFIGURE
		Object.assign( model.voterGroups[0],    {x:155, y:125} )
		Object.assign( model.candidates[0],{x: 50, y:125, icon:"square"} )
		Object.assign( model.candidates[1],{x:250, y:125, icon:"triangle"} )
		Object.assign( model.candidates[2],{x:280, y:280, icon:"hexagon"} )
		model.ballotConcept = "off"
		// INIT
		model.candidates[0].init()
		model.candidates[1].init()
		model.candidates[2].init()
		model.initMODEL()
		model.voterManager.initVoters()
		model.election = Election.plurality;
		model.optionsForElection =  {sidebar:true, original:true, originalCaption:true}
		model.dm.redistrict()
		// UPDATE
		model.update()
	};
	model.onUpdate = function(){
		Election.plurality(model.district[0],model);
	};

	var resetDOM = document.createElement("div");
	basediv.appendChild(resetDOM);
	resetDOM.id = "reset";
	resetDOM.innerHTML = "reset";
	resetDOM.style.top = "415px";
	resetDOM.style.left = "110px";
	resetDOM.onclick = function(){
		model.reset();
		model.update()
	};

	// UPDATE
	model.initPlugin();
	model.update()
};
l.load([
	"play/img/voter_face.png",
	"play/img/square.png",
	"play/img/triangle.png",
	"play/img/hexagon.png",
	"play/img/square.svg",
	"play/img/triangle.svg",
	"play/img/hexagon.svg",
	"play/img/pentagon.svg",
	"play/img/bob.svg"
]);
