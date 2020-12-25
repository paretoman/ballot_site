var l = new Loader()
l.onload = function(assets){

	// CREATE
	var presetName = "model2"
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
		// CONFIGURE
		Object.assign( model.voterGroups[0],    {x:150, y:150} )
		Object.assign( model.candidates[0],{x: 50, y:125, icon:"square"} )
		Object.assign( model.candidates[1],{x:250, y:125, icon:"triangle"} )
		model.ballotConcept = "off"
		// INIT
		model.candidates[0].init()
		model.candidates[1].init()
		model.initMODEL()
		model.voterGroups[0].init()
		model.election = Election.plurality
		model.optionsForElection = {sidebar:true,verbose:true,originalCaption:true}
		model.dm.redistrict()
		// UPDATE
		model.update()

	};
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
