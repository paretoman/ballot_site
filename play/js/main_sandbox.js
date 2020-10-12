function sandbox(ui) {

    // sandbox runs the whole userland experience.
    // ui is a mother object for everything related to the User Interface.
    // in much the same way that model is the mother for everything simulation related.

    // Search for HOWTO to see notes on making changes. (right now, just for renaming menus)


    /////////////////
    // INPUT GUIDE //
    /////////////////

    // Example usage:
    // sandbox({idScript:"asdf",presetName:"sandbox"}) 
    // sandbox({idScript:"uiop"})
    // ui = sandbox()
    // Just put it inside <div><script id="idScript">
    
    // Like so:
	// <div>
	// 	    <script id="asdf">
	// 		    sandbox({idScript:"asdf",presetName:"sandbox"})
	// 	    </script>
    // <div>

    // The input variables are:
    //      ui.idScript     : id of the current <script> div (required)
    //      ui.idModel      : id of any <div> to be the model container, i.e. if you already know it and don't want to create one. feeds into createDOM()
    //      ui.presetName   : the name of the preset (or, for grandfathered cases, also the same as the ui.idModel)
    //      ui.preset       : all the preset data
    //          .config     : the config.  It lists all the button settings.
    //          .uiType     : determines the <div> attributes for the model container
    //          .update     : clumsy script to run after loading buttons
    //      ui.url          : paste any saved url in here to load that configuration
    
    //
    
    // We can even do a url pasted directly from the address bar 
    // (only the part after the ? question mark is read into the Config)
	// sandbox({id:"uio",url:"http://127.0.0.1:8000/sandbox/?v=2.5&m=H4sIAAAAAAAAA41Ty27CMBD8lz374HdizhXH_gBwiGiokNJEDYkqFcG3d8aBhApVKsbs7MO7411zFi2rzSZZFdNObazRqtAEPihTWiATjDJFBApRmaR3OyWGZ0zQCpu6k5XYF1HiZaWVBFkdquZUK4kItOpp4UgBj1ZPC54SHqT--4uYhBhwUf_YpIs7Dv0IPobM5bqVq94K-BK5GRUz2m6nH37krVvX1TD29frYDHV_N-ctwvwW979mDQqb0dZf-6ql5udemKUtJi4QjTAeEtcOECl30IIxjBZ0DQTyWwg3-fxkDJOIkxFpHEQ5aSkfcJytnD7Hqq_BZeiPVfve1KTsTA50NidxbopfyDpkP8vStzuwd-DuwE_gAhOoSP2NSg5sItOnPGWDmTvlUdaTEUfiOYhci4p9VJB54wh8vpIPnLW6Ldpj5uwLNj2f4sMrf2mJGmlBCagprx0RinJEgfOyBC6nCrdnuwwoLAMKrFONQ05QPs42pMUT9QNmmY4R0c6Ir2J_7PcNKUXeSdrqI88ism_d4UBHsfx1WEsuP5a3SEChAwAA"})

    // 

    // Finally, if id is not provided, then generate an id and leave the node dangling
    // ui.containerDiv will be generated with this id
    // Example:
	// <div>
	// 	    <script id="later">
    //         ui = {presetName:"sandbox"}
    //         sandbox(ui)
    //         ui.idScript = "later"
    //         ui.makeParentDivs()
	// 	    </script>
    // <div>
    





    /////////////
    // SUMMARY //
    /////////////

    // This sets up the sandbox, with some help from the functions called below during the CREATE phase.  
    // The main tasks are 
    //     Attach: loads inputs, loads presets, and hooks into the web page
    //      Model: setting up the model for simulations.
    //  bindModel: binding functions into the Model simulation routine.  And creating the primary divs
    //     Cypher: decyphering the URL,
    //     Config: getting the configuration from it.
    //       menu: Creating all the divs and assigning click events inside the left menu
    //    uiArena: " " outside the left menu
    //     Loader: Save some bandwidth 

    // There is a pattern to the code: LOAD, CREATE, CONFIGURE, INIT, & UPDATE. 
    // LOAD loads the input or defaults.  
    // CREATE makes an empty data structure to be used.  
    // CONFIGURE adds all the input to the data structure.  
    // INIT completes the data structure by doing steps that needed to use the data structure as input, and is otherwise similar to CONFIGURE.  
    // UPDATE runs the actions, now that the data structure is complete.

    // Basic description of main_sandbox.js
    // First we load the config,
    // Then we update the model and menu.
    // Then wait for mouse events.

    // there are two parts, the model and the config.
    // load initial config
    // bind model and config using menu items (config step for )
    // start/ initialize
    // The sandbox is the binder
    // we pass around the context, ui

    // See main_ballot.js for a more conceptual view of the data structures ui, model, and config

    // So the basic concept of this user intervace is:
    // Load some data into the model,
    // Let the user modify it through a controls,
    // Describe the controls with a configuration,
    // Display the state of the model,
    // Save the control data.
    
    

    // CREATE the data structure

    // handle input
    if (ui == undefined) ui = {}
    ui.attach = new Attach(ui)
    ui.attach.handleInputMain()



    var model = new Model(ui.idModel)
    ui.model = model
    ui.attach.attachDOM(model)

    var config = {}
    var initialConfig = {}
    ui.config = config
    bindModel(ui,model,config)

    var cConfig = new Config(ui,config,initialConfig)

    ui.cypher = new Cypher(ui)
    

    var l = new Loader()
    l.onload = function(assets){

        model.assets = assets

        // CREATE the divs!
        createDOM(ui,model)
        menu(ui,model,config,initialConfig, cConfig)
        createMenu(ui)
        uiArena(ui,model,config,initialConfig, cConfig)
        
        // CONNECT : Step 2 of CREATE : make connections between code parts (just one connection here)
        ui.cypher.setUpEncode()
    
        
        // INIT
        // Read in the config file.
        cConfig.loadUrl(afterLoadUrl)

        function afterLoadUrl(urlData) {

            cConfig.setConfig(urlData)

            // UPDATE SANDBOX
            ui.menu.theme.init_sandbox();
            _objF(ui.arena,"update")
            model.initPlugin();  // this wants to set ui.menu.item.dom.hidden
    
            ui.initButtons() // for those buttons that depend on the model, like the yeefilter buttons
            _objF(ui.menu,"select");
            
            // run some extra stuff specified by the preset
            if (ui.preset.update) {
                ui.preset.update()
            }
    
    
            model.update()

        }
    }; 
    l.load(sandbox.assets)
    // use loader to save on bandwidth
    // alternatively if we call the loader from all the places where we need the images, then we could just do
    // s.update()
    // for possibly greater speed, since we don't have to wait on the downloads.






}

function Attach(ui) {
    var self = this

    self.handleInputMain = function() {
        // handles the input to sandbox()
        // e.g.  sandbox({idScript:"asdf",presetName:"sandbox"}) 
        // see main for more

        // Defaults
        // a little help filling in the ui (should have been done in html as above)
        if (ui == undefined || ui.preset == undefined || ui.preset.config == undefined || ui.presetName == undefined) {
            loadpreset(ui)
        }
        ui.missingModelId = false
        ui.danglingScript = false
        if (ui.idModel == undefined) {
            ui.idModel = "model-" + _rand5()
            ui.missingModelId = true
        
            if (ui.idScript == undefined) {
                ui.idScript = "script-" + _rand5()
                ui.danglingScript = true
            }
        
        }
        if (ui.link) {
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(ui.link);
            //matches[1] contains the value between the parentheses
            ui.url = matches[1]
            // https://stackoverflow.com/a/17779833
        }
        ui.url = ui.url || window.location.href

    }

    function loadpreset (ui)  {
    
        // if we don't already have a ui.presetName, generate one
        // then look it up
        
        // ui.presetName: for the presets
        // ui.idModel : for the divs.  This is
    
        if(ui.quick != undefined) {
            ui.presetName = ui.quick
            ui.idModel = ui.quick
        }
        
        // default presetName
        if (ui.presetName == undefined ) {
            ui.presetName = "sandbox"
            // then we will end up skipping down to the bottom
        }
    
        _lookupPreset(ui)
    }
    

    self.attachDOM = function(model) {
            
        // Here are two boolean variables to consider
        // ui.missingModelId : needs a new parent div
        // ui.danglingScript : can't be appended to a parent div, so will leave dangling

        // Here are the actual strings that these bools refer to
        // ui.idModel : for the divs
        // ui.idScript: for the divs

        ui.dom = {}
        if (ui.missingModelId) {
            _makeParentDivs()
        } else {
            ui.dom.basediv = document.querySelector("#" + model.id)
            ui.dom.container = ui.dom.basediv.parentNode

        }
        if (ui.uiType == "ballot") {
            ui.dom.basediv.classList = "div-ballot div-model"
        } else if (ui.uiType == "election-ballot") {
            ui.dom.basediv.classList = "div-election div-ballot div-model"
        } else if (ui.uiType == "election") {
            ui.dom.basediv.classList = "div-election div-ballot-in-sandbox div-model"
        } else if (ui.uiType == "sandbox") {
            ui.dom.basediv.classList = "div-sandbox div-election div-ballot-in-sandbox div-model"
        }
        
        ui.dom.container.classList = "contain-model"
        
        function _makeParentDivs() {
            
            // the model
            var md = document.createElement('div'); 
            md.id = ui.idModel
            

            // the contain-model 
            var cm = document.createElement('div'); 
            cm.setAttribute("scrolling","no")

            // the script
            if (ui.danglingScript) {
                var pa = document.createElement('div'); 
            } else {
                var sc = document.getElementById(ui.idScript); 
                var pa = sc.parentNode
            }

            // connecting
            pa.appendChild(cm); 
            cm.appendChild(md)

            ui.dom.basediv = md
            ui.dom.container = cm
            ui.dom.parent = pa

            // goes from this
            //  <div>
            // 	    <script id="idScript">
            // 		    sandbox({idScript:"idScript",idModel:"idModel",presetName:"election3",uiType:"election"})
            // 	    </script>
            //  <div>
            
            // to this
            // <div class="contain-model">
            // 	    <div id="idModel" class="div-sandbox div-election div-ballot-in-sandbox div-model" scrolling="no">
            // 	    </div>
            //      <script id="idScript">
            // 		    sandbox({idScript:"idScript",idModel:"idModel",presetName:"election3",uiType:"election"})
            //      </script>
            // </div>
            // https://stackoverflow.com/a/758683
            // via https://stackoverflow.com/a/1219857

            // if id is not provided, then uses the generated id and leave the node dangling
            
        }

    }
    self.detach = function() {
        _removeSubnodes(ui.dom.basediv)
        ui.dom.container.class = ""
    }
}

function bindModel(ui,model,config) {

    model.initPlugin = function(){

        // LOAD
        model.inSandbox = true

        // This "model.initPlugin()" launches the model
        // So it is also useful as a template for everything that you might need to do after a button press.

        // CREATE
        
        if (config.candidatePositions) {
            for(var i=0; i<config.candidatePositions.length; i++) model.candidates.push(new Candidate(model))
        } else {
            for(var i=0; i<config.numOfCandidates; i++) model.candidates.push(new Candidate(model))
        }

        if (config.voterGroupTypes) {
            for(var i=0; i<config.voterGroupTypes.length; i++) {
                var vType = window[config.voterGroupTypes[i]]
                var n = new vType(model)
                model.voterGroups.push(n)
            }
        } else if (config.oneVoter) {
            model.voterGroups.push(new SingleVoter(model))
        } else {
            for(var i=0; i<config.numVoterGroups; i++) model.voterGroups.push(new GaussianVoters(model))
        }
        model.voterCenter = new VoterCenter(model)

        // PRE CONFIGURE
        model.dimensions = config.dimensions
        
        // CONFIGURE
            // expand config to calculate some values to add to the model			
            // load expanded config into the model
            // configure writes to model and reads from config.  Sanity rule: configure does not read from model.
        _objF(ui.menu,"configure")
        ui.strategyOrganizer.configure()
        // CONFIGURE DEFAULTS (model)
        model.border = config.arena_border
        model.HACK_BIG_RANGE = true;
        // INIT
        model.initDOM()
        for (var i=0; i<model.candidates.length; i++) {
            model.candidates[i].init()
        }
        model.initMODEL()
        for (var i=0; i<model.voterGroups.length; i++) {
            model.voterGroups[i].init()
        }
        _pileVoters(model)
        model.dm.redistrict()
		// INIT (menu)
		ui.menu.presetconfig.init_sandbox()
		// ui.menu.gearicon.init_sandbox()
		ui.arena.desc.init_sandbox()
		ui.arena.codeEditor.init_sandbox()
        ui.menu.theme.init_sandbox();
        // UPDATE
        ui.menu_update()
        ui.showHideSystems()
        ui.strategyOrganizer.showOnlyStrategyForTypeOfSystem()
        
    };

    model.onDraw = function(){

        
        ui.redrawButtons() // make sure the icons show up
        
        sankeyDraw()

        ballotDraw()
    }

    function ballotDraw() {

        // CREATE A BALLOT
        if (ui.dom.rightBallot) ui.dom.rightBallot.remove() // remove old one, if there was one

        // decide whether to draw the election explanation
        var hideSidebar = ! model.optionsForElection.sidebar

        // decide whether to draw a ballot
        var dragging = model.arena.mouse.dragging
        if (model.arena.viewMan.active || dragging && dragging.isViewMan) {
            var doDrawBallot = true
            var voterPerson = model.arena.viewMan.focus
            if (voterPerson == null) doDrawBallot = false
        } else if (config.oneVoter && model.voterGroups[0].voterGroupType == "SingleVoter") {
            hideSidebar = true
            var doDrawBallot = true
            var voterPerson = model.voterGroups[0].voterPeople[0]
        } 

        if (hideSidebar) {
            _addClass(model.caption,"displayNoneClass")
        } else {
            _removeClass(model.caption,"displayNoneClass")
        }

        if (hideSidebar && ! doDrawBallot) {
            _addClass(ui.dom.right,"displayNoneClass")
        } else {
            _removeClass(ui.dom.right,"displayNoneClass")
        }


        if (doDrawBallot) {

            var doOldBallot = false
            
            if (doOldBallot) {

                var BallotType = model.BallotType
                var ballot = new BallotType(model);
                ui.dom.rightBallot = ballot.dom
                ballot.update(voterPerson.stages[model.stage].ballot);

            } else {

                var divBallot = document.createElement("div")
                ui.dom.rightBallot = divBallot

                divBallot.innerHTML = ""

                var currentStage = model.stage
                for (var stage of Object.keys(voterPerson.stages)) {
                    if (stage == "backup") continue // just show the real stages, not this one that I made as a temporary holding place
                    model.stage = stage

                    var text = ""                    
                    text += '<div class="div-ballot">'
                    // text += model.voterGroups[0].voterModel.toTextV(voterPerson.stages[model.stage].ballot);
                    text += model.voterGroups[0].voterModel.toTextV(voterPerson);
                    text += '</div>'
                    
                    divBallot.innerHTML += text
                    var target = divBallot
                    if (model.tallyEventsToAssign) {
                        for (let e of model.tallyEventsToAssign) {
                            target.querySelector("#" + e.eventID).addEventListener("mouseover", e.f)
                            target.querySelector("#" + e.eventID).addEventListener("mouseleave", ()=>model.draw())
                        }
                        model.tallyEventsToAssign = undefined
                    }
                }
                model.stage = currentStage
            }
            ui.dom.right.prepend(ui.dom.rightBallot)
        }
    }

    function sankeyDraw() {
        var sankeyOn = ["IRV","STV"].includes(model.system)        
        
        // do sankey if any districts have more than 1 person
        sankeyOn = sankeyOn && model.district.map(x => x.voterPeople.length).some( x => x > 1) 

        sankeyOn = sankeyOn && model.district[0].result.transfers
        
        if (! sankeyOn) {
            if (ui.dom.sankey) ui.dom.sankey.remove() 
            return
        }

        if (ui.sankey == undefined) {
            ui.sankey = d3.sankey()  
        }
        if (ui.dom.sankey) {
            ui.dom.sankey.remove() 
        }
        ui.dom.sankey = document.createElement("div")
        ui.dom.right.prepend(ui.dom.sankey)

        ui.dom.sankey.id = "chart"
        ui.dom.sankey.innerHTML = '<div style="text-align:center;"><span class="small" > Sankey Diagram </span></div>'

        var noSankeys = true

        for (var district of model.district) {

            if (model.district.length > 1) {
                ui.dom.sankey.innerHTML += `<div style="text-align:center;"><span class="small" > District ${district.i+1} </span></div>`
            }

            if (district.voterPeople.length <= 1) continue

            // option
            var doSpecialWinColor = true
            
            var sankey = ui.sankey


            var numcans = district.candidates.length
            var nodewidth = Math.max(10, Math.min(25, 100 / numcans)) // really this is node height, but the original code was horizontal, not vertical

            var outHeight = numcans * 50

            var margin = {top: 10, right: 10, bottom: 10, left: 10}
            var width = 220 - margin.left - margin.right // was 960
            var height = outHeight - margin.top - margin.bottom // was 500

            sankey
            .nodeWidth(nodewidth) // was 15
            .nodePadding(0) // was 10
            .size([width, height]);

            var svg = d3.select(ui.dom.sankey).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            var formatNumber = d3.format(",.0f")
            var format = function(d) { return formatNumber(d); }
            var color = (cid) => model.candidatesById[cid].fill
            var getName = (cid) => model.candidatesById[cid].name
            var fPercent = (frac) => Math.round(100 * frac) + "%"


            var path = sankey.link();

            var dataSankey = getDataSankey(district)
            // var dataSankey = getEnergyData()

            var noLinks = dataSankey.links.length == 0
            if (noLinks) continue
            noSankeys = false

            sankey
                .nodes(dataSankey.nodes)
                .links(dataSankey.links)
                .layout(32); // what is this? iterations

            var link = svg.append("g").selectAll(".link")
                .data(dataSankey.links)
                .enter().append("path")
                .attr("class", "link")
                .attr("d", path)
                .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                .style("stroke", function(d) { return d.source.color = (d.winner && doSpecialWinColor) ? "#fff" : color(d.source.cid); })
                .sort(function(a, b) { return b.dy - a.dy; });

            link.append("title")
                .text(function(d) { return getName(d.source.cid) + " → " + getName(d.target.cid) + "\n" + fPercent(d.value/d.numBallots); });
                // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
                
            var node = svg.append("g").selectAll(".node")
                .data(dataSankey.nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")"; 
                })
                .call(d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", function() { this.parentNode.appendChild(this); })
                .on("drag", dragmove));

            var rectNode = node.append("rect")
                .attr("height", sankey.nodeWidth())
                .attr("width", function(d) { return d.dy; })
                .style("fill", function(d) { return d.color = color(d.cid); })
                .style("stroke", function(d) { return d3.rgb(d.color).darker(2); });
            
            rectNode.append("title")
                .text(function(d) { return getName(d.cid) + "\n" + fPercent(d.value/d.numBallots); });
                
            node.append("text")
                .attr("transform", function(d) {
                    return "translate(" + d.dy/2 + "," + nodewidth/2 + ")"; 
                })
                .attr("dominant-baseline","middle")
                .attr("text-anchor","middle")
                .text(function(d) { return (d.winner) ? "win" : ""; })
                // .style("fill", "#555")
                .style("opacity", "50%")
                .style("font-size", nodewidth*.9);
            /*
            node.append("text")
                .attr("text-anchor", "middle")
                //.attr("transform", "rotate(-20)")
                .attr("x", function (d) { return d.dy / 2 })
                .attr("y", sankey.nodeWidth() / 2)
                .attr("dy", ".35em")
                .text(function(d) { return d.name; })
                //.text(function(d) { if(d.name.length > 8) { return d.name.substring(0, 5) + "..."; } else return d.name; })
                .filter(function(d) { return d.x < width / 2; });
            */
                            
            function dragmove(d) {
                //d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
                d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(width - d.dy, d3.event.x))) + "," + d.y + ")");
                sankey.relayout();
                link.attr("d", path);
            }

            function getDataSankey(district) {
                var nodes = []
                var links = []

                // each transfer is referred to by transfers [ round ] [ transfer index ] 
                // we use ids
                // transfer.from 
                // transfer.flows [ to ] 
                // transfer.flows [ to ] [ first ]    -- also shows who was the first choice

                var coalitions = district.result.coalitions
                var tallies = district.result.tallies
                var continuing = district.result.continuing
                var transfers = district.result.transfers
                var numRounds = transfers.length
                var numBallots = district.voterPeople.length
                
                var winnersContinue = model.system == "STV" && 1
                if (winnersContinue)var won = district.result.won
                if (winnersContinue) var quotaAmount = numBallots / (model.seats + 1)
                

                // function to find the sorted position of the candidate
                var xpos =  cid => model.tarena.modelToArena(model.candidatesById[cid]).x
                // var listOfCandidates = Object.keys(transfers[0][0].flows)
                // listOfCandidates.push(transfers[0][0].from)
                var listOfCandidates = district.candidates.map(c => c.id)
                // listOfCandidates.sort((a,b) => a.length - b.length)
                var xc = {}
                for (var cid of listOfCandidates) {
                    xc[cid] = xpos(cid)
                }
                

                // make ids and lookup tool
                var idx = 0
                var lookup = {}
                for (var rid = 0; rid <= numRounds; rid ++) {
                    lookup[rid] = {}
                    if (rid == 0) {
                        var useList = _jcopy(listOfCandidates)
                    } else {
                        var useList = _jcopy(continuing[rid-1]) // continuing from last round
                        if (winnersContinue) useList = useList.concat(won[rid-1])
                    }
                    useList.sort( (a,b) => xc[a] - xc[b] )
                    for( var k = 0; k < useList.length; k++) {
                        var cid = useList[k]
                        lookup[rid][cid] = idx
                        var node = {name:rid + "_" + cid,round:rid,cid:cid,numBallots:numBallots}
                        if (winnersContinue) {
                            if (won[rid] && won[rid].includes(cid)) node.winner = true
                        } else {
                            if (rid == numRounds) { //last round
                                if (result.winners.includes(cid)) node.winner = true
                            }
                        }
                        nodes.push(node)
                        idx ++
                    }
                }


                for (var rid = 0; rid < numRounds; rid ++) {
                    var round = transfers[rid]
                    // var unTransferred = _jcopy(listOfCandidates)
                    for (var transfer of round) {
                        var from = transfer.from
                        // delete unTransferred[from]
                        for (var to in transfer.flows) {
                            var lfrom = lookup[rid][from]
                            var lto = lookup[rid+1][to]
                            var v = 0
                            var allfirst = transfer.flows[to]
                            for (var first of Object.keys(allfirst) ) {
                                v += allfirst[first]
                            }
                            if (v > 0) {
                                var link = {"source":lfrom,"target":lto,"value":v,numBallots:numBallots}
                                links.push(link)
                            }
                            
                        }
                    }
                    for (var cid of continuing[rid]) {
                        var lfrom = lookup[rid][cid]
                        var lto = lookup[rid+1][cid]
                        var v = tallies[rid][cid]
                        if (v > 0) {
                            var link = {"source":lfrom,"target":lto,"value":v,numBallots:numBallots}
                            links.push(link)
                        }

                    }
                    if (winnersContinue) {
                        for (var cid of won[rid]) {
                            var lfrom = lookup[rid][cid]
                            var lto = lookup[rid+1][cid]
                            var v = quotaAmount
                            var link = {"source":lfrom,"target":lto,"value":v,"winner":true,numBallots:numBallots}
                            links.push(link)
                        }
                    }
                    // if (v == 0 && stv && rid > 0 && won[rid-1].includes(from) ) { // you won, and you're not on the tally
                    //     v = quotaAmount
                    // }
                }


                var data = {nodes:nodes,links:links}
                return data
            }

        }
        
        if (noSankeys) ui.dom.sankey.remove()

    };

    model.updateFromModel = function() {
        _objF(ui.menu,"updateFromModel")
    }

    // helpers

    model.onInitModel = function() { // works for onUpdate, too
        ui.initButtons()
    }
    
    model.onAddCandidate = function() {
        var n = model.candidates.length
        model.numOfCandidates = n
        config.numOfCandidates = n
        ui.menu.nCandidates.select()
    }
}

function Config(ui, config, initialConfig) {
    //  Getting the configuration from a URL or previous version, requiring clean up.

    var self = this

    // see the HOWTO below

    // When you add a new menu item or variable,
    // add it to the defaults
    // And when you change which variables are used,
    // add some code to the cleanConfig.
    

    /////////////////////////////
    // LOAD DEFAULTS and INPUT //
    /////////////////////////////

    // some switches
    ui.embed = false
    ui.maxVoters = 10 
    ui.tryNewURL = true

    var all_candidate_names = Object.keys(Candidate.graphicsByIcon["Default"]) // helper
    var yes_all_candidates = {}
    for (var i = 0; i < all_candidate_names.length; i++) {
        yes_all_candidates[i] = true
    }
    self.defaults = {
        configversion:2.5,
        sandboxsave: false,
        hidegearconfig: false,
        description: "",
        keyyee: "newcan",
        snowman: false, // section
        x_voters: false,
        oneVoter: false,
        system: "FPTP", // section
        rbsystem: "Tideman",
        seats: 3,
        numOfCandidates: 3,
        customNames: "No",
        namelist: "",
        numVoterGroups: 1,
        xNumVoterGroups: 4,
        nVoterGroupsRealName: "One Group",
        spread_factor_voters: 1,
        arena_size: 300,
        median_mean: 1,
        theme: "Default",
        utility_shape: "linear",
        votersAsCandidates: false,
        visSingleBallotsOnly: false,
        ballotVis: true,
        stepMenu: "geom",
        menuVersion: "1",
        menuLevel: "normal",
        dimensions: "2D",
        nDistricts: 1,
        colorChooser: "pick and generate",
        colorSpace: "hsluv with dark",
        arena_border: 2,
        preFrontrunnerIds: ["square","triangle"],
        autoPoll: "Manual",
        // primaries: "No",
        firstStrategy: "zero strategy. judge on an absolute scale.",
        secondStrategy: "zero strategy. judge on an absolute scale.",
        doTwoStrategies: true,
        centerPollThreshold: .5,
        yeefilter: yes_all_candidates,
        computeMethod: "ez",
        pixelsize: 60,
        featurelist: ['gearconfig',"doFeatureFilter"],
        doFeatureFilter: true, 
        yeeon: false,
        beatMap: "auto",
        kindayee: "newcan",
        ballotConcept: "auto",
        roundChart: "auto",
        sidebarOn: "on",
        lastTransfer: "off",
        voterIcons: "circle",
        voterCenterIcons: "on",
        candidateIconsSet: ["image","note"],
        pairwiseMinimaps: "off",
        doTextBallots: false,
        textBallotInput: "",
        behavior: "stand",
        showToolbar: "on",
        rankedVizBoundary: "atWinner",
        useBeatMapForRankedBallotViz: false,
		doMedianDistViz: false,
        doElectabilityPolls: true,
        partyRule: "crowd",
        doFilterSystems: false,
        filterSystems: [],
        doFilterStrategy: true,
        includeSystems: ["choice","pair","score","multi","dev"],
        showPowerChart: true,
        putMenuAbove: false,
        scoreFirstStrategy: "zero strategy. judge on an absolute scale.",
        choiceFirstStrategy: "zero strategy. judge on an absolute scale.",
        pairFirstStrategy: "zero strategy. judge on an absolute scale.",
        scoreSecondStrategy: "zero strategy. judge on an absolute scale.",
        choiceSecondStrategy: "zero strategy. judge on an absolute scale.",
        pairSecondStrategy: "zero strategy. judge on an absolute scale.",
        codeEditorText: Election.defaultCodeScore,
        createStrategyType: "score",
        createBallotType: "Score",
    }
    // HOWTO: add to the end here (or anywhere inside)


    self.loadUrl = function(afterLoadUrl) {

        if (ui.url != undefined) {
            var modelData = _getParameterByName("m",ui.url);
            if (ui.tryNewURL) var version = _getParameterByName("v",ui.url);
            if (modelData === null) {
                var shortCode = _getParameterByName("u",ui.url)
                if (shortCode !== null) {
                    // get request
                    // var listShortLinkUrl = "https://spreadsheets.google.com/tq?&tq=&key=12TYpTVx6WgyNzUTBvXUPLBdplk9Hi1MJVMkGskyh5cs"
                    // var listShortLinkUrl = "https://spreadsheets.google.com/feeds/list/12TYpTVx6WgyNzUTBvXUPLBdplk9Hi1MJVMkGskyh5cs/1/public/values?alt=json"
                    var listShortLinkUrl = "https://spreadsheets.google.com/feeds/list/12TYpTVx6WgyNzUTBvXUPLBdplk9Hi1MJVMkGskyh5cs/1/public/values?alt=json&sq=shortcode=" + shortCode
                    // _ajax.get(listShortLinkUrl, {}, function(res) {
                    _getRequest(listShortLinkUrl, function(res) {
                        // do the load config again, basically
                        var resObj = JSON.parse(res)

                        // example, the third shortcode: resObj.feed.entry[2].gsx$shortcode.$t

                        var rows = resObj.feed.entry
                        // search rows for shortcode
                        var row = rows.filter( r => r.gsx$shortcode.$t === shortCode)
                        // get the url
                        var codedUrl = row[0].gsx$link.$t


                        // first try
                        // var rows = resObj.table.rows
                        // // search rows for shortcode
                        // var row = rows.filter( r => r.c[0].v === shortCode)
                        // // get the url
                        // var codedUrl = row[0].c[1].v

                        ui.url = codedUrl

                        var modelData = _getParameterByName("m",ui.url);
                        if (ui.tryNewURL) var version = _getParameterByName("v",ui.url);

                        var urlData = {modelData:modelData, version:version}
                        afterLoadUrl(urlData)

                    })
                    return

                }
            }
        }
        function _getParameterByName(name,url){
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " ")).replace("}/","}"); //not sure how that / got there.
        };
        
        var urlData = {modelData:modelData, version:version}
        afterLoadUrl(urlData)
        return
    }
    
    self.setConfig = function(urlData) {

        var modelData = urlData.modelData
        var version = urlData.version

        var c = ui.preset.config
        // INIT - initialize all data structures
        // the data structure for a sandbox is the configuration of the model.  Init completes this data structures.
        // backwards compatibility
        // the data structure for a model is model.<property>

        if(modelData){
            if (ui.tryNewURL) {
                if (version) { 
                    // if we have a version number, then we know the data is in this format
                    c = {
                        zipped:modelData,
                        configversion:version
                    }
                } else {
                    var data = JSON.parse(modelData);
                    c = data;
                }
            } else {
                var data = JSON.parse(modelData);
                c = data;
            }
        }
        self.cleanConfig(c)
        // overwrite 
        if (ui.overwriteConfig != undefined) {
            _addAttributes( c, ui.overwriteConfig )
        }
        _copyAttributes(config,c)
        _copyAttributes(initialConfig,c)
    
    }

    self.cleanConfig = function(config) {
        // Load the defaults.  This runs at the start and after loading a preset.

        // HOWTO:
        // cleanConfig:
        // The only real problem that it's worth keeping track of version numbers for is:
        // interpreting old parameters if I replaced them with something else in my config,
        // and that is handled in here in cleanConfig.

        // Incrementing:
        // Increment the version number when you do something so weird that you can no longer run
        // the previous version's update commands.
        // For example, for version 2.3, I changed the way a variable is stored, so
        // I couldn't run the same script to change it twice.
        // An example where we don't need version updating
        // is when we stop using one variable name and start using a different one.


        // FILENAME
        // config.presethtmlname = ui.url.substring(ui.url.lastIndexOf('/')+1);


        if(config.configversion == undefined || config.configversion == 1) {
            // GRANDFATHER URL variable names
            // change old variable names to new names to preserve backward compatibility with urls and presets
            // and clear grandfathered variables
            function newname(config,oldname,newname) {
                if(config[oldname] != undefined) config[newname] = config[oldname]
                delete config[oldname]
            }
            newname(config,"candidates","numOfCandidates")
            newname(config,"voters","numVoterGroups")
            newname(config,"s","system")
            if(config.c != undefined) { // grandfather in the variables
                config.numOfCandidates = config.c.length
                config.numVoterGroups = config.v.length
                config.features = 4
            }
            newname(config,"c","candidatePositions")
            newname(config,"v","voterPositions")
            newname(config,"d","description")

            // GRANDFATHER OLD NAMES OF VARIABLES
            if(config.unstrategic) config.firstStrategy = config.unstrategic
            if(config.strategic) config.secondStrategy = config.strategic
            if(config.strategy) config.secondStrategy = config.strategy
            if(config.voterStrategies) config.secondStrategies = _jcopy(config.voterStrategies)
            if(config.voterPercentStrategy) config.percentSecondStrategy = _jcopy(config.voterPercentStrategy)
            if(config.second_strategy) config.doTwoStrategies = config.second_strategy
            delete config.unstrategic
            delete config.strategic
            delete config.strategy
            delete config.voterStrategies
            delete config.voterPercentStrategy
            delete config.second_strategy

            // GRANDFATHER Feature List...
            // config.features: 1-basic, 2-voters, 3-candidates, 4-save
            if ( config.featurelist == undefined) {
                config.featurelist = fl()
                function fl() {
                    switch(config.features){
                        case 1: return ["systems"]
                        case 2: return ["systems","voters"]
                        case 3: return ["systems","voters","candidates"]
                        case 4: 
                            config.sandboxsave = true
                            return ["systems","voters","candidates"]
                    }
                }
            }
            if (config.doPercentFirst) config.featurelist = config.featurelist.concat(["percentStrategy"]);
            if (config.doFullStrategyConfig) {
                config.doFeatureFilter = false
                // The feature filter is off, so all items are displayed.
                // basically everything that should be displayed at the start
                // This config.doFullStrategyConfig is a shorthand that gets replaced by the featurelist
                // The featurelist has it's own control as an item
            }
            // clear the grandfathered config settings
            delete config.doPercentFirst
            delete config.features
            delete config.doFullStrategyConfig

            // GRANDFATHER featurelist step 2
            // HOWTO: When replacing the name of a menu item, the old configurations with that name still need to work
            // So, add the new menu item to the list below.
            // replace old names with new names
            if (config.featurelist) {
                var menuNameTranslator = {
                    "voters":"nVoterGroups",
                    "candidates":"nCandidates",
                    "unstrategic":"firstStrategy",
                    "second strategy":"doTwoStrategies",
                    "yee":"yee",
                    "rbvote":"rbSystems",
                    "custom_number_voters":"xVoterGroups",
                    "xHowManyVoterGroups":"xVoterGroups",
                    "strategy":"secondStrategy",
                    "percentstrategy":"percentSecondStrategy",
                }
                // all the current names get translated as themselves
                for (var id of Object.keys(ui.menu)) {
                    menuNameTranslator[id] = id
                }
                var temp_featurelist = []
                for (var i=0; i<config.featurelist.length; i++) {
                    var oldName = config.featurelist[i]
                    var newName = menuNameTranslator[oldName]
                    temp_featurelist.push(newName)
                }
                config.featurelist = temp_featurelist
            }
            config.configversion = 2 // updating to next version
        }

        if (config.configversion == 2) {
            if (config.yeefilter) {
                var oldyeefilter = config.yeefilter
                var newyeefilter = {}
                var oldcandidates = ["square","triangle","hexagon","pentagon","bob"]
                for (var i = 0; i < oldcandidates.length; i++) {
                    var id = oldcandidates[i]
                    if (oldyeefilter.includes(id)) {
                        newyeefilter[id] = true
                    } else {
                        newyeefilter[id] = false
                    }
                }
                config.yeefilter = newyeefilter
            }

            config.configversion = 2.1 // bump to next version
        }
        // we are now generating a new version of config.  We are done with grandfathering

        ui.cypher.decode_config(config) // decodes the config, depending on version number
        // so in this case, we're decoding stuff from 2.2, but not 2.1 because 2.1 isn't encoded
        if (config.configversion == 2.1) {
            config.configversion = 2.2 // 2.1 is now treated the same as 2.2 because both are decoded
        }
        
        if (config.configversion == 2.2) { 
            if (config.yeefilter) {
                var oldy = config.yeefilter
                var newy = {}
                var oldcandidates = ["square","triangle","hexagon","pentagon","bob"]
                var serial = 0
                for (var i = 0; i < oldcandidates.length; i++) {
                    for (var k=1; k<=20; k++) {
                        var id = oldcandidates[i]
                        if (k > 1) id += k
                        if (id in oldy) {
                            newy[serial] = oldy[id]
                        }
                        serial++
                    }
                }
                config.yeefilter = newy
            }

            config.configversion = 2.3
        }
        if (config.configversion == 2.3) { 
            config.configversion = 2.4
        }
        // add in features that were not included with the old version
        if (config.configversion == 2.4) { 
                

            
            // ctrl-reset solves this problem

            // // There is a problem in going from an old featureset to a new one.
            // // The new features are not included in the set.
            // // So we add an opton to choose whether to filter features.
            // // By default the filter is on.
            // // The default in the sandbox preset is off.
            // // In this way, it is easy to switch the filter off and update the features.
            // // The filter switch is inside the config menu.

            // // if this is a save from before version 2.5
            // // then the featurelist is on and it didn't include the menu items that are hidden in menuVersion 1
            // // so, allow the user to remove the filter

            // // so, if the featurelist is set then we want to turn on the filter
            // // if the featurelist is not set, then we don't do the filter
            // if ( config.featurelist == undefined) {
            //     config.doFeatureFilter = false
            // } else {
            //     modifyConfigFeaturelist(config,true, ["doFeatureFilter"]) 
            // }

            // // Hmm. on the one hand, I want to load an example where I have purposely set the filter
            // // and that example is indistinguishable from an example where I want to see the new features
            // // because I can't tell the difference (in the old version) between manual and automatic hiding
            // // So maybe I should have an upgrade button, to allow the user to decide what to do.
            // // or maybe the user could manually change the 2.4 to 2.5 in the URL.
            // // 2.4 would not have the upgrade button
            // // 2.5 
            // // Oh
            // // The difference between the locked down version and the updating version is the "config" menu
            // // So I put the "Disable filters" button in the config menu,
            
            if ( config.featurelist == undefined) {
                config.doFeatureFilter = false
            } 



            // one more thing
            // switch the name for this setting:
            if (config.kindayee == "beatCircles") {
                config.beatMap = "on" // new setting
    
                config.yeeon = false // old settings
                config.keyyee = "newcan"
                config.kindayee = "newcan"
            }
            var isSomething = x => (x != undefined && x != "off"      )
            if (isSomething(config.kindayee) || isSomething(config.keyyee)) {
                config.yeeon = true
            }

            config.configversion = 2.5
        }

        // now these corrections might have to be done to version 2.5, and they won't hurt the next version
        if (config.configversion == 2.5) {
    
            // if the yee menu was in the featurelist, then make sure the new yee on/off switch is added to the featurelist // and beatMap
            if (config.featurelist != undefined && config.featurelist.includes("yee")) modifyConfigFeaturelist(config,true,["yeeon","beatMap"])
    
            // so basically, we are getting rid of the "none" button in the yee chooser and making it into a separate control.
    
            if (config.behavior == undefined && config.theme == "Bees") {
                config.behavior = "bounce"
            }


            // strategies section //

            // translate old strategies
            var tr = ui.strategyOrganizer.translate
            var sys = config.system
            var s1 = config.firstStrategy
            var s2 = config.secondStrategy
            if (s1 !== undefined) {
                config.firstStrategy = tr(s1,sys)
            }
            if (s2 !== undefined) {
                config.secondStrategy = tr(s2,sys)
            }
            
            if (config.scoreFirstStrategy == undefined) {
                config.scoreFirstStrategy = tr(s1,"Score")
            }

            if (config.choiceFirstStrategy == undefined) {
                config.choiceFirstStrategy = tr(s1,"FPTP")
            }

            if (config.pairFirstStrategy == undefined) {
                config.pairFirstStrategy = tr(s1,"Condorcet")
            }

            if (config.scoreSecondStrategy == undefined) {
                config.scoreSecondStrategy = tr(s2,"Score")
            }

            if (config.choiceSecondStrategy == undefined) {
                config.choiceSecondStrategy = tr(s2,"FPTP")
            }

            if (config.pairSecondStrategy == undefined) {
                config.pairSecondStrategy = tr(s2,"Condorcet")
            }

            // double check to correct some weird errors
            config.scoreFirstStrategy = tr(config.scoreFirstStrategy, "Score")
            config.choiceFirstStrategy = tr(config.choiceFirstStrategy, "FPTP")
            config.pairFirstStrategy = tr(config.pairFirstStrategy, "Condorcet")
            config.scoreSecondStrategy = tr(config.scoreSecondStrategy, "Score")
            config.choiceSecondStrategy = tr(config.choiceSecondStrategy, "FPTP")
            config.pairSecondStrategy = tr(config.pairSecondStrategy, "Condorcet")

            config.secondStrategies = []  // no longer using this

            // end strategies section //

            if (config.crowdShape == undefined) {
                config.crowdShape = config.voterGroupX.map( x => (x) ? "gaussian sunflower" : "Nicky circles" ) 
            }

            if (config.group_count_vert == undefined) {
                config.group_count_vert = config.voterGroupX.map( x =>  5) 
            }
            if (config.group_count_h == undefined) {
                config.group_count_h = config.voterGroupX.map( x =>  5) 
            }

            // there's no incompatibility problems yet, so no need to increment
            // code below this if {} statement are still needed in future versions
        }

        // Finally done with old versions!


        // VOTER DEFAULTS
        // we want individual percent strategies to be loaded in, if they are there
        config.percentSecondStrategy = config.percentSecondStrategy || []
        config.voter_group_count = config.voter_group_count || []
        config.voter_group_spread = config.voter_group_spread || []
        for (var i = 0; i < ui.maxVoters; i++) {
            if(config.percentSecondStrategy[i] == undefined) config.percentSecondStrategy[i] = 0
            config.voter_group_count[i] = config.voter_group_count[i] || 50
            config.voter_group_spread[i] = config.voter_group_spread[i] || 190
        }

        _fillInDefaults(config, self.defaults)

        
    }
    self.reset = function() {
        _copyAttributes(config,initialConfig)
    }

    self.save = function() {
        _copyAttributes(initialConfig,config)
        // UPDATE SAVE URL //
        var newURLs = _makeURL();
        // CONSOLE OUTPUT //
        console_out(1)  // gives a log of settings to copy and paste
        return newURLs

        // the old way, here for historical reasons.
        // SAVE & PARSE
        // ?m={s:[system], v:[voterPositions], c:[candidatePositions], d:[description]}
    }

    var _makeURL = function(){

        // URI ENCODE!
        var doEncode = true
        if (doEncode) {
            var eConfig = ui.cypher.encode_config(config)
        } else {
            var eConfig = config
        }
        if (ui.tryNewURL) {
            var uri = encodeURIComponent(eConfig)
        } else {
            var uri = encodeURIComponent(JSON.stringify(eConfig));
        }
        
        // Put it in the save link box!
        
        // make link string
        var getUrl = window.location;
        var baseUrl = getUrl.protocol + "//" + getUrl.host; // http://ncase.me/
        var restofurl = getUrl.pathname.split('/')
        for (var i=1; i < restofurl.length - 1; i++) { //  /ballot/
            if (restofurl[i] != "sandbox") {
                baseUrl += "/" + restofurl[i];
            }
        }
        if (ui.embed) {            
		    var relativePath = "/sandbox/embedbox.html?v="
        } else {
            var relativePath = "/sandbox/?v="
        }
        if (ui.tryNewURL) {
            var link = baseUrl + relativePath + config.configversion + "&m="+uri;    
        } else {
            var link = baseUrl + relativePath + uri;
        }
        if (ui.embed) {            
		    var linkText = '<iframe src="' + link + '" scrolling="yes" width="100%" height="650"></iframe>'
        } else {
            var linkText = link
        }

        // var shortCode = _randAlphaNum(7)
        var shortCode = _hashCode(link)
        var shortLink = baseUrl + "/sandbox/?v=" + config.configversion + "&u=" + shortCode
        
        console.log("(Link length is ",linkText.length,")")
        console.log("")
        return {link:link, linkText:linkText, shortCode:shortCode, shortLink:shortLink}
    };

    var console_out = function (log){
        // helper function to output the config to the console.
        var logtext = ''
        for (i in config) {
            logtext += i + ": " +JSON.stringify(config[i]) + ',\n'
            // logtext += '"' + i + '",\n' // for codebook
        }
        var aloc = window.location.pathname.split('/')
        //logtext += "\n\npaste this JSON into" + aloc[aloc.length-2] + "/" + aloc[aloc.length-1]
        logtext += "\n\npaste this JSON into /play/js/Presets.js under option " + aloc[aloc.length-1]
        console.log(logtext)
        if (log==2) console.log(JSON.stringify(config))
    }



}

function Cypher(ui) {
    // Decyphers the URL

    // See the HOWTO
    // I explain that we don't really need to keep track of configversion in the codebooks.

    var self = this
    var doFriendlyURI = true

    var encodeFields = {}
    
    var decodeFields = {
        0:"candidatePositions",
        1:"voterPositions",
        2:"candidates",
        3:"dimensions",
        4:"system",
        5:"hidegearconfig",
        // "configversion",
        6:"secondStrategies",
        7:"percentSecondStrategy",
        8:"voter_group_count",
        9:"voter_group_spread",
        10:"sandboxsave", // not needed anymore, but keep it
        11:"featurelist",
        12:"description",
        13:"keyyee",
        14:"snowman",
        15:"x_voters",
        16:"oneVoter",
        17:"rbsystem",
        18:"numOfCandidates",
        19:"numVoterGroups",
        20:"xNumVoterGroups",
        21:"nVoterGroupsRealName",
        22:"spread_factor_voters",
        23:"arena_size",
        24:"median_mean",
        25:"theme",
        26:"utility_shape",
        27:"colorChooser",
        28:"colorSpace",
        29:"arena_border",
        30:"preFrontrunnerIds",
        31:"autoPoll",
        32:"firstStrategy",
        33:"secondStrategy",
        34:"doTwoStrategies",
        35:"yeefilter",
        36:"computeMethod",
        37:"pixelsize",
        38:"optionsForElection", // no longer used, but okay to have
        39:"candidateSerials",
        40:"voterGroupTypes",
        41:"voterGroupX",
        42:"voterGroupSnowman",
        43:"voterGroupDisk",
        44:"seats",
        45:"candidateB",
        46:"nDistricts",
        47:"votersAsCandidates",
        48:"visSingleBallotsOnly",
        49:"ballotVis",
        50:"customNames",
        51:"namelist",
        52:"menuVersion",
        53:"stepMenu",
        54:"menuLevel",
        55:"doFeatureFilter",
        56:"yeeon",
        57:"beatMap",
        58:"kindayee",
        59:"ballotConcept",
        60:"roundChart",
        61:"sidebarOn",
        62:"lastTransfer",
        63:"voterIcons",
        64:"candidateIcons",
        65:"candidateIconsSet",
        66:"pairwiseMinimaps",
        67:"submitTextBallots",
        68:"textBallotInput",
        69:"doTextBallots",
        70:"behavior",
        71:"showToolbar",
        72:"rankedVizBoundary",
        73:"doElectabilityPolls",
        74:"partyRule",
        75:"doFilterSystems",
        76:"filterSystems",
        77:"doFilterStrategy",
        78:"includeSystems",
        79:"showPowerChart",
        80:"putMenuAbove",
        81:"scoreFirstStrategy",
        82:"choiceFirstStrategy",
        83:"pairFirstStrategy",
        84:"scoreSecondStrategy",
        85:"choiceSecondStrategy",
        86:"pairSecondStrategy",
        87:"voterCenterIcons",
        88:"useBeatMapForRankedBallotViz",
        89:"centerPollThreshold",
        90:"doMedianDistViz",
        91:"crowdShape",
        92:"group_count_vert",
        93:"group_count_h",
        94:"createStrategyType",
        95:"createBallotType",
    } 
    // HOWTO
    // add more on to the end ONLY


    self.setUpEncode = function() {

        _makeEncodeFields()

        function _makeEncodeFields() {
            for (var [i,v] of Object.entries(decodeFields)) {
                i = Number(i)
                encodeFields[v] = i
            }
        }
        // set up encoders
        for (var e in ui.menu) {
            var item = ui.menu[e]
            if (item.codebook) {
                for (var page of item.codebook) {
                    _makeEncode(page)
                }
            }
        }

        for (var page of ui.extraCodeBook) {
            _makeEncode(page)
        }
    
    }

    self.encode_config = function(config) {

        // make a copy because we aren't going to modify config
        var conf = _jcopy(config)
        
        step1encode(conf)
        //
        // encode field names
        // console.log(conf)
        // console.log(conf)
        for (var i in encodeFields) {
            var n = encodeFields[i]
            conf[n] = conf[i]
            delete conf[i]
        }
        // zip 
        delete conf["configversion"]
        var dataZ = pako.gzip( JSON.stringify(conf) ,{ to: 'string' })
        var dataString = btoa(dataZ)
        if (doFriendlyURI) dataString = Base64EncodeUrl(dataString)
        if (ui.tryNewURL) {
            return dataString
        } else {
            var co = {}
            co["zipped"] = dataString
            co["configversion"] = config["configversion"]
            return co
        }
        // be careful to include all the zipped config items and add any new ones or they will appear as extras
    }

    
    // HOWTO: Add to the end of the list.  Don't add to the middle of this list.
    // safer: use a dictionary
    // These are the fields that show up in the URL, so we shorten them.
    
        
    
    
    self.decode_config = function(config) {
        if (config.configversion == undefined) return config
        if (config.configversion <= 2.1) return config
        if (! ("zipped" in config) ) return config
        
        // unzip
        var dataString = config["zipped"]
        if (doFriendlyURI) dataString = Base64DecodeUrl(dataString)
        var data = pako.inflate( atob( dataString))
        var strData = String.fromCharCode.apply(null, new Uint16Array(data));
        var conUnzipped = JSON.parse( strData )

        Object.assign(config,conUnzipped)
        delete config["zipped"]

        // note that we have to decode it in place
        var conf = _jcopy(config)
        // decode field names
        for (var [e,v] of Object.entries(conf)) {
            if (decodeFields.hasOwnProperty(e)) {                
                // if we can decode it, then decode it
                delete config[e]
                var d = decodeFields[e]
                config[d] = v
            }
        }

        step1decode(config)
        return
    }


    


    function _makeEncode(page) {
        var decode = page.decode

        var encode = {}
        for (var [i,v] of Object.entries(decode)) {
            var value = JSON.stringify(v)
            i = Number(i)
            encode[value] = i
        }
        page.encode = encode
    }

    
    function step1encode(conf) {
        for (var e in ui.menu) {
            var item = ui.menu[e]
            if (item.codebook) {  
                for (var page of item.codebook) {
                    _encode(page,conf)
                }
            }
        }
        for (var page of ui.extraCodeBook) {
            _encode(page,conf)
        }
    }

    function _encode(page,conf) {
        var encode = page.encode
        var field = page.field

        var value = conf[field]
        if (Array.isArray(value)) {
            var temp = []
            for (var i =0; i < value.length; i++) {
                temp.push(_lookupE(value[i],encode))
            }
            conf[field] = temp
        } else {
            conf[field] = _lookupE(value,encode) //  TODO: it is possible there could be a collision in encoded/decoded values
        }
    }
    function _lookupE(v,encode) {
        var vs = JSON.stringify(v)
        if (vs in encode) {
            return encode[vs]
        } else {
            return "~" + vs // store as JSON String, and set a flag character
        }
    }

    function step1decode(config) {

        // console.log("config before decoding",config)
        for (var e in ui.menu) {
            var item = ui.menu[e]
            if (item.codebook) {  
                for (var page of item.codebook) {
                    _decode(page,config)
                }
            }
        }
        // console.log("config after decoding",config)

        for (var page of ui.extraCodeBook) {
            _decode(page,config)
        }
    }
    function _decode(page,config) { 
        var decode = page.decode
        var field = page.field

        var value = config[field]
        // console.log(value)
        if (Array.isArray(value)) {
            var temp = []
            for (var i =0; i < value.length; i++) {
                temp.push(_lookup(value[i],decode))
            }
            config[field] = temp
        } else {
            var temp = _lookup(value,decode)
            config[field] = temp
        }
    }
    
    
    function _lookup2(v,decode) {
        var f = removeTildas(v) 
        if (f in decode) {
            return decode[f]
        } else { 
            return f
        }
    }
    function _lookup(v,decode) {
        var debug = 0
        var c = checkTilda(v)
        if (c) {
            var f = removeTildas(v)
            if (debug >= 2) console.log(v,f)
            return f
        } 
        if (v in decode) {
            var d = decode[v]
            if (debug >= 2) console.log(v,d)
            return d
        } else { 
            // encode didn't work right on old versions, 
            // so this is for grandfathering in the old URLs
            if (debug >= 3) console.log("")
            if (debug >= 2) console.log(v)
            return v
        }
    }
    function removeTildas(v) {
        // check if first char is tilda
        
        if (typeof(v) != "string")  return v
        var a = v.split("") 
        if (a[0] == "~") {
            // if it is then remove it
            var b = v.slice(1)
            var c = JSON.parse(b)
            // and send it back into removeTildas
            var d = removeTildas(c)
            // and return the result
            return d
        } else {
            // otherwise, return it
            return v
        }
    }
    function checkTilda(v) {
        // check if first character is a tilda
        if (typeof(v) != "string")  return false
        var a = v.split("") 
        if (a[0] == "~") {
            return true
        }
        return false
    }


    // HOWTO:

    // Decoding:

    // Why do we track the version of the encoding?  
    // So that we run current links in old versions of this web app
    // Why do we want to do that?
    // Maybe we messed something up and need to use an old version 
    // but don't want to re-create the link in the old version

    // I guess I don't really need to do version numbers
    // It's just too much work for a hypothetical benefit

    // So just set the default version to the current one and don't worry. Its okay.

    // cleanConfig:
    // The only real problem that it's worth keeping track of version numbers for is:
    // interpreting old parameters if I replaced them with something else in my config,
    // and that is handled in cleanConfig.


    // Oh wait, there is a problem,
    // When I open up old links,
    // JSON Parse doesn't work on things not in the codebook
    // 

    // we should make sure no two codebooks are for the same fields

    // maybe in the future
    // an example codebook should be
    // 
    // self.codebook = {
    //     system: {
    //         0:"FPTP",
    //         1:"+Primary",
    //         2:"Top Two",
    //         3:"RBVote",
    //         4:"IRV", 
    //         5:"Borda",
    //         6:"Minimax",
    //         7:"Schulze",
    //         8:"RankedPair",
    //         9:"Condorcet",
    //         10:"Approval",
    //         11:"Score",
    //         12:"STAR",
    //         13:"3-2-1",
    //         14:"RRV", 
    //         15:"RAV",
    //         16:"STV",
    //         17:"QuotaApproval",
    //     },
    // }

    // URL Friendly Base 64
    //  * use this to make a Base64 encoded string URL friendly, 
    //  * i.e. '+' and '/' are replaced with '-' and '~' also any trailing '=' 
    //  * characters are removed
    // https://tools.ietf.org/html/rfc4648
    function Base64EncodeUrl(str){
        return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    }

    function Base64DecodeUrl(str){
        str = str + '===' // pad
        var newlen = str.length - str.length % 4 // round
        str = str.slice(0,newlen) // cut
        // str = (str + '===').slice(0, str.length + (str.length % 4));
        return str.replace(/-/g, '+').replace(/_/g, '/');
    }



}

function createDOM(ui,model) {
    ui.dom.left = newDivOnBase("left")
    ui.dom.center = newDivOnBase("center")
    ui.dom.right = newDivOnBase("right")
    function newDivOnBase(name) {
        var a = document.createElement("div");
        a.setAttribute("id", name);
        ui.dom.basediv.appendChild(a);
        return a
    }
    // Details
    model.createDOM()

    var centerDiv = ui.dom.center
    if (centerDiv.hasChildNodes()){
        var firstNode = centerDiv.childNodes[0]
        centerDiv.insertBefore(model.dom,firstNode);
    } else {
        centerDiv.appendChild(model.dom)
    }
    model.dom.removeChild(model.caption);
    ui.dom.right.appendChild(model.caption);
    model.caption.style.width = "";
}

function menu(ui,model,config,initialConfig, cConfig) {

    // Each menu item is kind of similar to a mini instance of model.initPlugin.  That's because most of the stuff in model.initPlugin has already been done.  These small onChoose functions just launch when a button is pressed, which is after the whole sandbox has loaded.

    // HOWTO: Copy and paste a button function below and then search and replace all the mentions of the name
    // the other places to look are in Cypher, Config, and Model
    // as well as the menu trees at the end of this class.

    ui.menu = {}

    ui.menu_update = function() {
        // UPDATE MENU //

        // Make the MENU look correct.  The MENU is not part of the "model".
        // for (i in ui.menu.percentSecondStrategy.choose.sliders) ui.menu.percentSecondStrategy.choose.sliders[i].setAttribute("style",(i<config.numVoterGroups) ?  "display:inline": "display:none")
        // for (i in ui.menu.group_count.choose.sliders) ui.menu.group_count.choose.sliders[i].setAttribute("style",(i<config.numVoterGroups) ?  "display:inline": "display:none")
        // for (i in ui.menu.group_spread.choose.sliders) ui.menu.group_spread.choose.sliders[i].setAttribute("style",(i<config.numVoterGroups) ?  "display:inline": "display:none")

        for (i in ui.menu.percentSecondStrategy.choose.sliders) {
            if (i < model.voterGroups.length && model.voterGroups[i].voterGroupType == "GaussianVoters") {
                var style = "display:inline"
            } else {
                var style = "display:none"
            }
            ui.menu.percentSecondStrategy.choose.sliders[i].setAttribute("style",style)
            ui.menu.group_count.choose.sliders[i].setAttribute("style",style)
            ui.menu.group_spread.choose.sliders[i].setAttribute("style",style)
        }
        
    }

    
    ui.initButtons = function() {

        // draw sandbox buttons that depend on candidate images
        var m = [ui.menu.yee, ui.menu.yeefilter, ui.menu.frontrunners]
        m.forEach(function(m) {
            m.choose.init()
            m.select()
        })    

    }
    ui.redrawButtons = function() {

        // draw sandbox buttons that depend on candidate images
        var m = [ui.menu.yee, ui.menu.yeefilter, ui.menu.frontrunners]
        m.forEach(function(m) {
            m.choose.redraw()
        })    

    }

    ///////////////////
    // SLIDERS CLASS //
    ///////////////////

    var makeslider = function(cf) {
        var self = this
        self.slider = document.createElement("input");
        self.slider.type = "range";
        self.slider.max = cf.max;
        self.slider.min = cf.min;
        self.slider.value = cf.value;
        //self.slider.setAttribute("width","20px");
        self.slider.id = cf.chid;
        self.slider.n = cf.n
        self.slider.chfn = cf.chfn
        self.slider.class = "slider";
        self.slider.addEventListener('input', function() {self.slider.chfn(self.slider,self.slider.n)}, true);
        var label = document.createElement('label')
        label.htmlFor = cf.chid;
        label.appendChild(document.createTextNode(cf.chtext));
        cf.containchecks.appendChild(self.slider);
        //cf.containchecks.appendChild(label);
        self.slider.innerHTML = cf.chtext;
    } // https://stackoverflow.com/a/866249/8210071

    var sliderSet = function(cf){
        var self = this
        self.dom = document.createElement('div')
        self.dom.className = "button-group"
        if (cf.labelText) {
            var button_group_label = document.createElement('div')
            button_group_label.className = "button-group-label"
            button_group_label.innerHTML = cf.labelText;
            self.dom.appendChild(button_group_label)
        }

        cf.containchecks = self.dom.appendChild(document.createElement('div'));
        cf.containchecks.id="containsliders"
        self.sliders = []
        if(cf.num) {
            for (var i = 0; i < cf.num; i++) {	
                cf.n = i
                var slider = new makeslider(cf)
                self.sliders.push(slider.slider)
            }
        } else {
            cf.n = 0
            var slider = new makeslider(cf)
            self.sliders.push(slider.slider)
        }
    }

    ///////////////////
    // Button Widths //
    ///////////////////
    let bw = (x) => (220 - 4*(x-1)) / x - 2


    //////////////////////////////////
    // BUTTONS - WHAT VOTING SYSTEM //
    //////////////////////////////////

    function _smaller(x) { return `<span class="smaller">${x}</span>`}

    ui.menu.systems = new function() { // Which voting system?
        // "new function () {code}" means make an object "this", and run "code" in a new scope
        // I made a singleton class so we can use "self" instead of saying "systems" (or another button group name).  
        // This is useful when we want to make another button group and we copy and paste this code.
        // It might be better to make a class and then an instance, but I think this singleton class is easier.
        // single = function() {stuff}; var systems = new single()
        var self = this
        
        var autoSwitchDim = false
        
        self.list = [
            {name:"FPTP", value:"FPTP", ballotType:"Plurality", election:Election.plurality, margin:4},
            {name:"+Primary", value:"+Primary", ballotType:"Plurality", election:Election.pluralityWithPrimary},
            {name:"Top Two", value:"Top Two", ballotType:"Plurality", election:Election.toptwo, margin:4},
            {name:"RBVote", value:"RBVote", realname:"Rob Legrand's RBVote (Ranked Ballot Vote)", ballotType:"Ranked", election:Election.rbvote},
            {name:"IRV", value:"IRV", realname:"Instant Runoff Voting.  Sometimes called RCV Ranked Choice Voting but I call it IRV because there are many ways to have ranked ballots.", ballotType:"Ranked", election:Election.irv, margin:4},
            {name:"Borda", value:"Borda", ballotType:"Ranked", election:Election.borda},
            {name:"Minimax", value:"Minimax", realname:"Minimax Condorcet method.", ballotType:"Ranked", election:Election.minimax, margin:4},
            {name:"Schulze", value:"Schulze", realname:"Schulze Condorcet method.", ballotType:"Ranked", election:Election.schulze},
            {name:"RankedPair", value:"RankedPair", realname:"Ranked Pairs Condorcet method.", ballotType:"Ranked", election:Election.rankedPairs, margin:4},
            {name:"Condorcet", value:"Condorcet", realname:"Choose the Condorcet Winner, and if there isn't one, Tie", ballotType:"Ranked", election:Election.condorcet},
            {name:"Approval", value:"Approval", ballotType:"Approval", election:Election.approval, margin:4},
            {name:"Score", value:"Score", ballotType:"Score", election:Election.score},
            {name:"STAR", value:"STAR", ballotType:"Score", election:Election.star, margin:4},
            {name:"3-2-1", value:"3-2-1", ballotType:"Three", election:Election.three21},
            {name:"RRV", value:"RRV", ballotType:"Score", election:Election.rrv, margin:4},
            {name:"RAV", value:"RAV", ballotType:"Approval", election:Election.rav},
            {name:"QuotaScore", value:"QuotaScore", realname:"Using a quota with score voting to make proportional representation.",ballotType:"Score", election:Election.quotaScore, margin:4},
            {name:"QuotaApproval", value:"QuotaApproval", realname:"Using a quota with approval voting to make proportional representation.",ballotType:"Approval", election:Election.quotaApproval},
            {name:"STV", value:"STV", ballotType:"Ranked", election:Election.stv, margin:4},
            {name:"QuotaMinimax", value:"QuotaMinimax", realname:"Using a quota with Minimax Condorcet voting to make proportional representation.",ballotType:"Ranked", election:Election.quotaMinimax},
            {name:"Test LP", value:"PhragmenMax", realname:"Phragmen's method of minimizing the maximum representation with assignments.",ballotType:"Score", election:Election.phragmenMax},
            {name:_smaller("Equal Facility"), value:"equalFacilityLocation", realname:"Facility location problem with equal assignments.",ballotType:"Score", election:Election.equalFacilityLocation},
            {name:"Create One", value:"Create",realname:"Write your own javascript code for a voting method.",ballotType:undefined, election:Election.create},
            
        ];
        self.systemsCodebook = [
            {
                field: "system",
                decode: {
                    0:"FPTP",
                    1:"+Primary",
                    2:"Top Two",
                    3:"RBVote",
                    4:"IRV", 
                    5:"Borda",
                    6:"Minimax",
                    7:"Schulze",
                    8:"RankedPair",
                    9:"Condorcet",
                    10:"Approval",
                    11:"Score",
                    12:"STAR",
                    13:"3-2-1",
                    14:"RRV", 
                    15:"RAV",
                    16:"STV",
                    17:"QuotaApproval",
                    18:"QuotaMinimax",
                    19:"QuotaScore",
                    20:"PhragmenMax",
                    21:"equalFacilityLocation",
                    22:"Create",
                }
            }
        ]
        self.codebook = self.systemsCodebook
        self.listByName = function() {
            var votingSystem = self.list.filter(function(system){
                return(system.value==config.system);
            })[0];
            return votingSystem;
        }
        self.onChoose = function(data){
            // LOAD INPUT
            config.system = data.value;
            config.ballotType = data.ballotType
            if (data.value == "Create") config.ballotType = config.createBallotType
            // CONFIGURE
            self.configure()
            ui.strategyOrganizer.configure()
            // UPDATE
            
            // TODO: work this out so that the voters get re initialized in the correct place
            if (autoSwitchDim) {
                ui.menu.dimensions.onChoose({name:model.dimensions}) 
                ui.menu.dimensions.select()
            }
            for (var voter of model.voterGroups) {
                voter.initVoterModel()
            }
            model.dm.redistrict()
            model.update();
            ui.menu_update()
            ui.strategyOrganizer.showOnlyStrategyForTypeOfSystem()
        };
        self.choose = new ButtonGroup({
            label: "what voting system?",
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure= function() {
            
            showMenuItemsIf("divRBVote", config.system === "RBVote")
            showMenuItemsIf("divLastTransfer", config.system === "IRV" || config.system === "STV")
            showMenuItemsIf("divDoElectabilityPolls", config.system == "+Primary")
            showMenuItemsIf("divSeats", model.checkMultiWinner(config.system))
            
            
            var hideCodeEditor = ! (config.system == "Create")
            
            showMenuItemsIf("divCreate", ! hideCodeEditor)
            setTimeout( () => ui.dom.codeMirror.refresh() , 30);

            _displayNoneIf(ui.arena.codeSave.dom, hideCodeEditor)
            ui.arena.codeEditor.dom.hidden = hideCodeEditor
            // ui.arena.codeSave.dom.hidden = hideCodeEditor
            
            model.system = config.system;

            var s = self.listByName()
            model.election = s.election

            
            model.ballotType = config.ballotType || s.ballotType

            model.BallotType = window[model.ballotType+"Ballot"];

            var doTarena = model.checkGotoTarena()
            if (autoSwitchDim) {
                if (doTarena) {
                    model.dimensions = "1D+B"
                } else {
                    model.dimensions = "2D"
                }
            }
            
            if (doTarena) {
                model.tarena.canvas.hidden = false
            } else {
                model.tarena.canvas.hidden = true
            }
            for (var voter of model.voterGroups) {
                voter.typeVoterModel = model.ballotType // needs init
            }
            for (let district of model.district) {
                district.pollResults = undefined
            }

            
            if (model.ballotType == "Ranked") {
                var goPairwise = _pickRankedDescription(model).doPairs
            } else {
                var goPairwise = false
            }
            showMenuItemsIf("divPairwiseMinimaps",  goPairwise)


        }
        self.select = function() {
            self.choose.highlight("value", config.system)
        }
    }

    ui.menu.rbSystems = new function() { // Which RB voting system?
        var self = this
        self.list = [
            {name:"Baldwin", value:"Baldwin",rbelection:rbvote.calcbald, margin:4},
            {name:"Black", value:"Black",rbelection:rbvote.calcblac},
            {name:"Borda", value:"Borda",rbelection:rbvote.calcbord, margin:4},
            {name:"Bucklin", value:"Bucklin",rbelection:rbvote.calcbuck},
            {name:"Carey", value:"Carey",rbelection:rbvote.calccare, margin:4},
            {name:"Coombs", value:"Coombs",rbelection:rbvote.calccoom},
            {name:"Copeland", value:"Copeland",rbelection:rbvote.calccope, margin:4},
            {name:"Dodgson", value:"Dodgson",rbelection:rbvote.calcdodg},
            {name:"Hare", value:"Hare",rbelection:rbvote.calchare, margin:4},
            {name:"Nanson", value:"Nanson",rbelection:rbvote.calcnans},
            {name:"Raynaud", value:"Raynaud",rbelection:rbvote.calcrayn, margin:4},
            {name:"Schulze", value:"Schulze",rbelection:rbvote.calcschu},
            {name:"Simpson", value:"Simpson",rbelection:rbvote.calcsimp, margin:4},
            {name:"Small", value:"Small",rbelection:rbvote.calcsmal},
            {name:"Tideman", value:"Tideman",rbelection:rbvote.calctide}
            ]	
            
        self.codebook = [
            {
                field: "rbsystem",
                decode: {
                    0:"Baldwin",
                    1:"Black",
                    2:"Borda",
                    3:"Bucklin",
                    4:"Carey",
                    5:"Coombs",
                    6:"Copeland",
                    7:"Dodgson",
                    8:"Hare",
                    9:"Nanson",
                    10:"Raynaud",
                    11:"Schulze",
                    12:"Simpson",
                    13:"Small",
                    14:"Tideman"
                }
            }
        ]
        self.listByName = function() {
            var votingSystem = self.list.filter(function(system){
                return(system.value==config.rbsystem);
            })[0];
            return votingSystem;
        }
        self.onChoose = function(data){
            // LOAD INPUT
            config.rbsystem = data.value;
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update();
        };
        self.choose = new ButtonGroup({
            label: "which RB voting system?",
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure= function() {
            model.rbsystem = config.rbsystem
            model.rbelection = self.listByName().rbelection
            for (let district of model.district) {
                district.pollResults = undefined
            }
        }
        self.select = function() {
            self.choose.highlight("value", config.rbsystem)
        }
    }

    ui.menu.dimensions = new function () {
        var self = this
        self.list = [
            {name:"2D", value:"2D",realname:"Two Position Dimensions",margin:4},
            {name:"1D+B", value:"1D+B",realname:"One Position Dimension Horizontally, Plus Broadness in the Vertical Dimension", margin:4},
            {name:"1D", value:"1D", realname:"One Dimension Horizontally, Vertical Doesn't Matter"}
        ]
        self.codebook = [ {
            field: "dimensions",
            decode: {
                0:"2D",
                1:"1D+B",
                2:"1D",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.dimensions = data.value
            // CONFIGURE
            self.configure()
            // INIT (LOADER)	
            model.initDOM()
            // INIT
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].init()
            }
            _pileVoters(model)
            model.dm.redistrict()
            for (var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.update()
            // _objF(ui.arena,"update")
            // ui.menu.spread_factor_voters.select()
        };
        self.configure = function() {
            model.dimensions = config.dimensions
        }
        self.select = function() {
            self.choose.highlight("value", config.dimensions);
        }
        self.choose = new ButtonGroup({
            label: "Arena Dimensions:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.nDistricts = new function () {
        var self = this
        self.list = [
            {name:"1", value:1,margin:4},
            {name:"2", value:2,margin:4},
            {name:"3", value:3,margin:4},
            {name:"4", value:4,margin:4},
            {name:"5", value:5,margin:4},
            {name:"6", value:6,margin:4},
            {name:"7", value:7,margin:4},
            {name:"8", value:8,margin:4},
            {name:"9", value:9,margin:4},
            {name:"10", value:10, value:"10"}
        ]
        self.codebook = [ {
            field: "nDistricts",
            decode: {
                0:0,
                1:1,
                2:2,
                3:3,
                4:4,
                5:5,
                6:6,
                7:7,
                8:8,
                9:9,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.nDistricts = Number(data.value)
            // CONFIGURE
            self.configure()
            // INIT
            model.dm.redistrict()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.nDistricts = config.nDistricts
            if (model.checkGotoTarena()) { // TODO: make a visualization for more than 1 district
                model.tarena.canvas.hidden = false
            } else {
                model.tarena.canvas.hidden = true
            }
        }
        self.select = function() {
            self.choose.highlight("value", config.nDistricts);
        }
        self.choose = new ButtonGroup({
            label: "Number of Districts:",
            width: bw(10),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.seats = new function () {
        var self = this
        self.list = [
            {name:"1", value:1,margin:4},
            {name:"2", value:2,margin:4},
            {name:"3", value:3,margin:4},
            {name:"4", value:4,margin:4},
            {name:"5", value:5,margin:4},
            {name:"6", value:6,margin:4},
            {name:"7", value:7,margin:4},
            {name:"8", value:8,margin:4},
            {name:"9", value:9,margin:4},
            {name:"10", value:10}
        ]
        self.codebook = [ {
            field: "seats",
            decode: {
                0:0,
                1:1,
                2:2,
                3:3,
                4:4,
                5:5,
                6:6,
                7:7,
                8:8,
                9:9,
                10:10,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.seats = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.seats = config.seats
        }
        self.select = function() {
            self.choose.highlight("value", config.seats);
        }
        self.choose = new ButtonGroup({
            label: "How many Seats:",
            width: bw(10),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.nVoterGroups = new function() { // How many voters?
        var self = this
        self.list = [
            {realname: "Single Voter", value:"Single Voter", name:"&#50883;", num:1, margin:4, oneVoter:true},
            {realname: "One Group", value:"One Group", name:"1", num:1, margin:4},
            {realname: "Two Groups", value:"Two Groups", name:"2", num:2, margin:4},
            {realname: "Three Groups", value:"Three Groups", name:"3", num:3, margin:4},
            {realname: "Different Sized Groups (like a snowman)", value:"Different Sized Groups (like a snowman)", name:"&#x2603;", num:3, snowman:true, margin:4},
            {realname: "Custom Number of Voters and Sizes and Spreads", value:"Custom Number of Voters and Sizes and Spreads", name:"X", num:4, x_voters:true},
        ];
        self.codebook = [
            {
                decode: {
                    0:"Single Voter",
                    1:"One Group", 
                    2:"Two Groups", 
                    3:"Three Groups",
                    4:"Different Sized Groups (like a snowman)",
                    5:"Custom Number of Voters and Sizes and Spreads"
                },
                field: "nVoterGroupsRealName"
            },
            {
                decode: {
                    0:1,
                    1:2,
                    2:3,
                    3:4,
                },
                field: "numVoterGroups"
            },
            {
                decode: {
                    0:"GaussianVoters",
                    1:"SingleVoter"
                },
                field: "voterGroupTypes"
            },
            {
                field: "snowman",
                decode: {
                    0:false,
                    1:true,
                }
            },
            {
                field: "x_voters",
                decode: {
                    0:false,
                    1:true,
                }
            },
            {
                field: "voterGroupSnowman",
                decode: {
                    0:false,
                    1:true,
                }
            },
            {
                field: "voterGroupX",
                decode: {
                    0:false,
                    1:true,
                }
            },
            {
                field: "oneVoter",
                decode: {
                    0:false,
                    1:true,
                }
            },
            {
                field: "crowdShape",
                decode: {
                    0:"Nicky circles",
                    1:"gaussian sunflower",
                    2:"circles",
                }
            },
        ]
        self.listByName = function() { // when we load from a config
            if (config.x_voters) {
                return self.list.filter( function(x){return x.x_voters || false})[0]
            } else if (config.snowman) {
                return self.list.filter( function(x){return x.snowman || false})[0]
            } else if (config.oneVoter) {
                return self.list.filter( function(x){return x.oneVoter || false})[0]
            } else {
                return self.list.filter( function(x){return x.num==config.numVoterGroups && (x.oneVoter || false) == false && (x.snowman || false) == false})[0]
            }
        }
        self.onChoose = function(data){
            // LOAD INPUT
            // add the configuration for the voter groups when "X" is chosen
            
            
            if(data.x_voters) {
                config.numVoterGroups = config.xNumVoterGroups
            } else {
                config.numVoterGroups = data.num;
            }
            config.nVoterGroupsRealName = data.value // this set of attributes is calculated based on config
            config.snowman = data.snowman || false;
            config.x_voters = data.x_voters || false;
            config.oneVoter = data.oneVoter || false;
            config.voterPositions = null
            config.voterGroupTypes = null
            // CREATE
            model.voterGroups = []
            if (config.oneVoter) {
                model.voterGroups.push(new SingleVoter(model))
            } else {
                for(var i=0; i<config.numVoterGroups; i++) {
                    model.voterGroups.push(new GaussianVoters(model))
                }
            }
            // CONFIGURE
            self.configure()
            //_objF(ui.menu,"configure")  // TODO: do I need this?
            ui.strategyOrganizer.configure()
            ui.menu.spread_factor_voters.configure()
            // INIT
            model.initMODEL()
            for(var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].init()
            }
            _pileVoters(model)
            model.dm.redistrict()
            // UPDATE
            model.update()
            ui.menu_update()
        };
        self.configure = function() {	
            // MODEL //

            showMenuItemsIf("divXVoterGroups", config.x_voters)

            // MODEL //
            model.nVoterGroupsRealName = config.nVoterGroupsRealName
            
            var s = ui.menu.systems.listByName()
            model.VoterType = window[s.ballotType+"Voter"]
            
            if (config.voterGroupTypes && config.voterPositions) {
                // we are reading a config string of version 2.2 or greater
                for(var i=0; i<config.voterPositions.length; i++){
                    var pos = config.voterPositions[i];
                    Object.assign(model.voterGroups[i], {
                        vid: i,
                        disk:(4-num),
                        x:pos[0],
                        y:pos[1],
                        snowman: config.voterGroupSnowman[i],
                        x_voters: config.voterGroupX[i],
                        disk: config.voterGroupDisk[i],
                        crowdShape: config.crowdShape[i],
                        group_count_vert: config.group_count_vert[i],
                        group_count_h: config.group_count_h[i],
                    })
                    model.voterGroups[i].typeVoterModel = model.ballotType // needs init	
                }
            } else if (config.voterPositions) {
                var num = model.voterGroups.length
                for(var i=0; i<config.voterPositions.length; i++){
                    var pos = config.voterPositions[i];
                    Object.assign(model.voterGroups[i], {
                        vid: i,
                        disk:(4-num),
                        x:pos[0],
                        y:pos[1],
                        snowman: config.snowman,
                        x_voters: config.x_voters
                    })
                    model.voterGroups[i].typeVoterModel = model.ballotType // needs init
                }
            } else {
                var num = model.voterGroups.length
                var voterPositions;
                if (config.snowman) {
                    voterPositions =  [[150,83],[150,150],[150,195]]
                }else if(config.x_voters) {
                    voterPositions =  [[65,150],[150,150],[235,150],[150,65]]
                    if (1) {//(num > 4) {


                        var points = [];
                        var angle = 0;
                        var _radius = 0;
                        var _radius_norm = 0;
                        var _spread_factor = 600 * .2
                        var theta = Math.TAU * .5 * (3 - Math.sqrt(5))
                        for (var count = 0; count < num; count++) {
                            angle = theta * count
                            _radius_norm = Math.sqrt((count+.5)/num)
                            _radius = _radius_norm * _spread_factor

                            var x = Math.cos(angle)*_radius  + 150 ;
                            var y = Math.sin(angle)*_radius  + 150 ;
                            points.push([x,y]);
                        }
                        voterPositions = points

                    }
                }else if(num==1){
                    voterPositions = [[150,150]];
                }else if(num==2){
                    voterPositions = [[95,150],[205,150]];
                }else if(num==3){
                    voterPositions = [[65,150],[150,150],[235,150]];

                }
                
                for(var i=0; i<num; i++){
                    var pos = voterPositions[i];
                    Object.assign(model.voterGroups[i], {
                        vid: i,
                        disk:(4-num),
                        x:pos[0] * config.arena_size / 300, //+ (config.arena_size - 300) * .5
                        y:pos[1] * config.arena_size / 300, //+ (config.arena_size - 300) * .5
                        snowman: config.snowman,
                        x_voters: config.x_voters
                    })
                    model.voterGroups[i].typeVoterModel = model.ballotType // needs init

                }
            }
        }
        self.select = function() {
            self.choose.highlight("value", config.nVoterGroupsRealName);
        }
        self.choose = new ButtonGroup({
            label: "how many groups of voters?",
            width: bw(6),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.xVoterGroups = new function() { // if the last option X is selected, we need a selection for number of voters
        var self = this
        self.onChoose = function(slider,n) {
            // LOAD INPUT
            var num = slider.value
            config.xNumVoterGroups = num;
            config.numVoterGroups = num;

            // CREATE
            model.voterGroups = []
            for(var i=0; i<num; i++) {
                model.voterGroups.push(new GaussianVoters(model))
            }
            config.voterPositions = null
            // CONFIGURE
            ui.menu.nVoterGroups.configure() // same settings in this other button
            ui.strategyOrganizer.configure()
            ui.menu.spread_factor_voters.configure()
            // INIT
            model.initMODEL()
            for(var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].init()
            }
            _pileVoters(model)
            model.dm.redistrict()
            // UPDATE
            model.update()
            ui.menu_update()

        }		
        self.choose = new sliderSet({
            max: ui.maxVoters-1,
            min:"1",
            value:"4",
            chtext:"",
            chid:"choose number of voter groups",
            chfn:self.onChoose
        })
        self.select = function() {
            self.choose.sliders[0].value = config.xNumVoterGroups // TODO: load x_voters config somehow
        }
    }

    ui.menu.group_count = new function() {  // group count
        var self = this
        self.codebook = [ {
            field: "voter_group_count",
            decode: {
                0:50,
            }
        },{
            field: "voter_group_spread",
            decode: {
                0:190,
            }
        } ]
        self.onChoose = function(slider,n) {
            // LOAD INPUT
            config.voter_group_count[n] = slider.value;
            // CONFIGURE
            self.configure()
            // INIT
            model.voterGroups[n].init()
            _pileVoters(model)
            model.dm.redistrict()
            // UPDATE
            model.update()
            ui.menu_update()
        }
        self.configure = function() {
            for (var i=0; i<model.voterGroups.length; i++) {
                self.configureN(i)
            }
        }
        self.configureN = function(n) {
            if (model.voterGroups[n].voterGroupType=="GaussianVoters") {
            model.voterGroups[n].group_count =config.voter_group_count[n]
        }
        }
        self.select = function() {
            for (i in self.choose.sliders) {
                self.choose.sliders[i].value = config.voter_group_count[i]
            }
        }	
        self.updateFromModel = function(n) {
            for (i in model.voterGroups) {
                if (model.voterGroups[i].voterGroupType=="GaussianVoters") {
                    var s = model.voterGroups[i].group_count
                    config.voter_group_count[i] =  s
                    self.choose.sliders[i].value =  s
                }
            }
        }
        self.choose = new sliderSet({
            max: "200",
            min:"0",
            value:"50",
            chtext:"",
            chid:"choose number",
            chfn:self.onChoose,
            num:ui.maxVoters,
            labelText: "what # voters in each group?"
        })
    }

    ui.menu.group_spread = new function() {  // group count
        var self = this
        self.onChoose = function(slider,n) {
            // LOAD INPUT
            config.voter_group_spread[n] = slider.value;
            // CONFIGURE
            self.configureN(n)
            // INIT
            model.voterGroups[n].init()
            _pileVoters(model)
            model.dm.redistrict()
            // UPDATE
            model.update()
            ui.menu_update()
        }
        self.configure = function() {
            for (var i=0; i<model.voterGroups.length; i++) {
                self.configureN(i)
            }
        }
        self.configureN = function(n) {
            if (model.voterGroups[n].voterGroupType=="GaussianVoters") {
            model.voterGroups[n].group_spread = config.voter_group_spread[n]
        }
        }
        self.choose = new sliderSet({
            max: "500",
            min:"10",
            value:"250",
            chtext:"",
            chid:"choose width in pixels",
            chfn:self.onChoose,
            num:ui.maxVoters,
            labelText: "how spread out is the group?"
        })
        self.select = function() {
            for (i in self.choose.sliders) {
                self.choose.sliders[i].value = config.voter_group_spread[i]
            }
        }			
        self.updateFromModel = function(n) {
            for (i in model.voterGroups) {
                if (model.voterGroups[i].voterGroupType=="GaussianVoters") {
                    var s = model.voterGroups[i].group_spread
                    config.voter_group_spread[i] =  s
                    self.choose.sliders[i].value =  s
                }
            }
        }
    }

    ui.menu.nCandidates = new function() { // how many candidates?
        var self = this
        self.list = [
            {name:"two", num:2, margin:4},
            {name:"three", num:3, margin:4},
            {name:"four", num:4, margin:4},
            {name:"five", num:5}
        ];
        self.onChoose = function(data){
            // LOAD INPUT
            config.numOfCandidates = data.num;
            config.candidatePositions = null
            config.candidateSerials = null
            config.candidateB = null
            // CREATE
            model.candidates = []
            for(var i=0; i<config.numOfCandidates; i++) {
                model.candidates.push(new Candidate(model))
            }
            // CONFIGURE
            self.configure()

            // INIT
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            model.initMODEL()
            // UPDATE
            
            model.dm.redistrictCandidates()

            // update model
            model.update()
        };
        self.choose = new ButtonGroup({
            label: "how many candidates?",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() { 
            // expanding upon what the button means for the model
            // this handles all the candidate creation every time a set of candidates is loaded
            model.numOfCandidates = config.numOfCandidates
            // Candidates, in a circle around the center.
			var _candidateIcons = Object.keys(Candidate.graphicsByIcon["Default"])
            var num = config.numOfCandidates;
            if (config.candidatePositions) {
                model.numOfCandidates = config.candidatePositions.length
                for(var i=0; i<config.candidatePositions.length; i++){
                    var serial = i
                    if (config.candidateSerials) {
                        serial = config.candidateSerials[i]
                    }
                    var b = 1
                    if (config.candidateB) {
                        b = config.candidateB[i]
                    }
                    var icon = _candidateIcons[serial % _candidateIcons.length];
                    var instance = Math.floor(serial / _candidateIcons.length) + 1
                    Object.assign(model.candidates[i],{
                        icon:icon,
                        instance:instance,
                        b:b,
                        x:config.candidatePositions[i][0],
                        y:config.candidatePositions[i][1]
                    })
                }
            } else {
                var angle = 0;
                switch(num){
                    case 3: angle=Math.TAU/12; break;
                    case 4: angle=Math.TAU/8; break;
                    case 5: angle=Math.TAU/6.6; break;
                }
                for(var i=0; i<num; i++){
                    var r = 100;
                    var x = 150 - r*Math.cos(angle) + (config.arena_size - 300) * .5; // probably replace "model" with "config", but maybe this will cause a bug
                    var y = 150 - r*Math.sin(angle) + (config.arena_size - 300) * .5; // TODO check for bug
                    var b = 1
                    var icon = _candidateIcons[i];
                    Object.assign(model.candidates[i],{
                        icon:icon,
                        x:x,
                        y:y,
                        b:b
                    })
                    angle += Math.TAU/num;
                }
            }
        }
        self.select = function() {
            self.choose.highlight("num", config.numOfCandidates);
        }
    }
  
    ui.menu.customNames = new function () {
        var self = this
        self.list = [
            {name:"Yes", value:"Yes",margin:4},
            {name:"No", value:"No"}
        ]
        self.codebook = [ {
            field: "customNames",
            decode: {
                0:"No",
                1:"Yes",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.customNames = data.value
            // CONFIGURE
            self.configure()
            // INIT
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            showMenuItemsIf("divCustomNames", config.customNames === "Yes")
            model.customNames = config.customNames
            ui.menu.namelist.choose.dom.hidden = (model.customNames == "Yes") ? false : true
        }
        self.select = function() {
            self.choose.highlight("value", config.customNames);
        }
        self.choose = new ButtonGroup({
            label: "Customize Candidates' Names?",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    
    ui.menu.namelist = new function () {
        var self = this
        self.codebook = [ {
            field: "namelist",
            decode: {
                0:"",
            }
        } ]
        self.onChoose = function(){
            // LOAD
            config.namelist = self.choose.dom.value
            // CONFIGURE
            self.configure()
            // INIT
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.namelist = config.namelist.split("\n")
        }
        self.select = function() {
            self.choose.dom.value = config.namelist
        }
        self.choose = {
            dom: document.createElement("textarea")
        }
        self.choose.dom.addEventListener("input",self.onChoose)
    }

    

    ui.strategyOrganizer = new function() { // an organizer for each strategy type's menu items
        var self = this
            
        var choiceType = "choice"
        var scoreType = "score"
        var pairType = "pair"
        self.types = [choiceType,pairType,scoreType]
        var lookupStratBySys = {
            "FPTP": choiceType,
            "+Primary": choiceType,
            "Top Two": choiceType,
            "RBVote": pairType,
            "IRV": choiceType, 
            "Borda": pairType,
            "Minimax": pairType,
            "Schulze": pairType,
            "RankedPair": pairType,
            "Condorcet": pairType,
            "Approval": scoreType,
            "Score": scoreType,
            "STAR": scoreType,
            "3-2-1": scoreType,
            "RRV": scoreType, 
            "RAV": scoreType,
            "STV": choiceType,
            "QuotaApproval": scoreType,
            "QuotaMinimax": pairType,
            "QuotaScore": scoreType,
            "PhragmenMax": scoreType,
            "equalFacilityLocation": scoreType,
        }
        self.stratBySys = function(sys) { 
            if (sys == "Create") {
                return model.createStrategyType
            } else {
                return lookupStratBySys[sys]
            }
        }
        self.menuNameFirst = {
            "choice":"choiceFirstStrategy",
            "pair":"pairFirstStrategy",
            "score":"scoreFirstStrategy",
        }
        self.menuNameSecond = {
            "choice":"choiceSecondStrategy",
            "pair":"pairSecondStrategy",
            "score":"scoreSecondStrategy",
        }
        self.divMenuNameFirst = {
            "choice":"divChoiceFirstStrategy",
            "pair":"divPairFirstStrategy",
            "score":"divScoreFirstStrategy",
        }
        self.divMenuNameSecond = {
            "choice":"divChoiceSecondStrategy",
            "pair":"divPairSecondStrategy",
            "score":"divScoreSecondStrategy",
        }
        self.decodeList = {
            0:"zero strategy. judge on an absolute scale.",
            1:"normalize",
            2:"normalize frontrunners only",
            3:"best frontrunner",
            4:"not the worst frontrunner",
        }
        self.translate = function(strat,sys) {
            // type	    O	N	F	F+	F-
            // score	O	N	F	F+	F-
            // choice	O	O	F	F	F
            // pair	    O	O	O	O	O
            var zero = "zero strategy. judge on an absolute scale."
            var theType = self.stratBySys(sys)
            if (theType == "choice") {
                var not_f = [zero,"normalize"]
                if (not_f.includes(strat)) {
                    return zero
                } else {
                    return "normalize frontrunners only"
                }
            } else if (theType == "pair") {
                return zero
            } else if (theType == "score") {
                return strat
            } else {
                return strat
            }
        }
        self.onChoose = function(data){
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update();
            ui.menu_update()
        };
        self.configure = function() {
            // take on the strategy of the relevant system type
            var theType = self.stratBySys(config.system)
            var theConfigFirst = self.menuNameFirst[theType]
            config.firstStrategy = config[theConfigFirst]
            var theConfigSecond = self.menuNameSecond[theType]
            config.secondStrategy = config[theConfigSecond]

            _showOrHideMenuForStrategy(config)
            model.firstStrategy = config.firstStrategy
            model.secondStrategy = config.secondStrategy

            var listMenuFirst = ui.menu[theConfigFirst].list
            var itemFirst = listMenuFirst.filter(x => x.value == config.firstStrategy)
            model.realNameFirstStrategy = itemFirst[0].realname
            var listMenuSecond = ui.menu[theConfigSecond].list
            var itemSecond = listMenuSecond.filter(x => x.value == config.secondStrategy)
            model.realNameSecondStrategy = itemSecond[0].realname
        }

        self.showOnlyStrategyForTypeOfSystem = function() {

            var theType = self.stratBySys(model.system)
            var types = self.types
    
            // show only the one that applies
            for (var t of types) {
                df = self.divMenuNameFirst[t]
                ds = self.divMenuNameSecond[t]
                showMenuItemsIf(df, t == theType )
                showMenuItemsIf(ds, t == theType )
            }
    
        }
    }

    
    ui.menu.loadCode = new function() { // set the type of strategy for the new method we're writing
        var self = this
        self.list = [
            {name:"Load Code", value:"Load Code", realname:"Load Code from an Existing Voting Method into the Code Editor"},
        ]; 
        self.onChoose = function(data){

            // popup : 
            var msg = "Are you sure? Loading will overwrite any work you've done in the code editor."
            var goahead = window.confirm(msg)
            if (goahead) {
                var whichmsg = "Which Voting Method Would You Like to Load? Type the name."
                var nameMethod = prompt(whichmsg, "Score")
                var methodList = ui.menu.systems.list.filter(x => x.name==nameMethod)[0]
                if (methodList !== undefined) {
                    var methodFunction = methodList.election
                    // copy text into box
                    var stringFunction = methodFunction.toString()
                    ui.dom.codeMirror.setValue(stringFunction)
                    setTimeout( () => ui.dom.codeMirror.refresh() , 30);

                    config.codeEditorText = stringFunction
                    model.codeEditorText = stringFunction

                    // make sure the strategy and ballot types are updated
                    var bType = methodList.ballotType
                    var system = methodList.value
                    var sType = ui.strategyOrganizer.stratBySys(system)

                    
                    config.createStrategyType = sType
                    ui.menu.createStrategyType.configure()
                    for (var voter of model.voterGroups) {
                        voter.initVoterModel()
                    }

                    ui.menu.createStrategyType.select(sType)

                    config.createBallotType = bType
                    ui.menu.createBallotType.configure()
                    ui.menu.createBallotType.select(bType)
                    
                    for (var voter of model.voterGroups) {
                        voter.initVoterModel()
                    }

                    showMenuItemsIf("divLastTransfer", system === "IRV" || system === "STV")
                    showMenuItemsIf("divDoElectabilityPolls", system == "+Primary")
                    showMenuItemsIf("divSeats", model.checkMultiWinner(system))
                    
                    // ui.menu.systems.onChoose(methodList.value) // run the election // but this might not work
                            
                    ui.strategyOrganizer.configure()
                    model.update();
                    ui.menu_update()
                    ui.strategyOrganizer.showOnlyStrategyForTypeOfSystem()
                } else {
                    window.alert("Typo")
                }
            }
        };
        self.configure = function() {
        }
        self.choose = new ButtonGroup({
            label: "Load Code from Existing Method?",
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose,
            justButton: true,
        });
    }

    ui.menu.createStrategyType = new function() { // set the type of strategy for the new method we're writing
        var self = this
        self.list = [
            {name:_smaller("Choice"), value:"choice", realname:"Do choice-type strategy", margin:4},
            {name:"Pair", value:"pair", realname:"Do pair-type strategy", margin:4},
            {name:"Score", value:"score", realname:"Do score-type strategy"},
        ]; 
        self.codebook = [ {
            field: "createStrategyType",
            decode: {
                0:"choice",
                1:"pair",
                2:"score",
            }
        } ]
        self.onChoose = function(data){
            config.createStrategyType = data.value;
            self.configure()

            for (var voter of model.voterGroups) {
                voter.initVoterModel()
            }
            ui.strategyOrganizer.configure()
            model.update();
            ui.menu_update()
            ui.strategyOrganizer.showOnlyStrategyForTypeOfSystem()
        };
        self.configure = function() {
            model.createStrategyType = config.createStrategyType
        }
        self.choose = new ButtonGroup({
            label: "Strategy Type for New Method",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose,
        });
        self.select = function() {
            self.choose.highlight("value", config.createStrategyType);
        }
    }


    ui.menu.createBallotType = new function() { // set the ballot type for the new method we're making
        var self = this
        self.list = [
            {name:_smaller("Ranked"), value:"Ranked", realname:"Ranked", margin:4},
            {name:_smaller("Score"), value:"Score", realname:"Score", margin:4},
            {name:_smaller("Approval"), value:"Approval", realname:"Approval", margin:4},
            {name:_smaller("Plurality"), value:"Plurality", realname:"Plurality"},
            {name:_smaller("Three"), value:"Three", realname:"Three"},
        ]; 
        self.codebook = [ {
            field: "createBallotType",
            decode: {
                0:"Ranked",
                1:"Score",
                2:"Approval",
                3:"Plurality",
                4:"Three",
            }
        } ]
        self.onChoose = function(data){
            config.createBallotType = data.value;
            self.configure()
        };
        self.configure = function() {
            model.createBallotType = config.createBallotType
            if (model.system == "Create") {
                config.ballotType = config.createBallotType
                model.ballotType = config.createBallotType
                model.BallotType = window[config.ballotType+"Ballot"];
    
                for (var voter of model.voterGroups) {
                    voter.typeVoterModel = config.ballotType // needs init
                }
                for (let district of model.district) {
                    district.pollResults = undefined
                }
    
                
                if (model.ballotType == "Ranked") {
                    var goPairwise = _pickRankedDescription(model).doPairs
                } else {
                    var goPairwise = false
                }
                showMenuItemsIf("divPairwiseMinimaps",  goPairwise)
            }
        }
        self.choose = new ButtonGroup({
            label: "Ballot Type for New Method",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose,
        });
        self.select = function() {
            self.choose.highlight("value", config.createBallotType);
        }
    }


    ui.menu.scoreFirstStrategy = new function() { // just filling in firstStrategy with a limited set
        var self = this
        self.list = [
            {name:"J", value:"zero strategy. judge on an absolute scale.", realname:"Judge: Every voter judges the candidates on the same absolute scale of distance.", margin:4},
            {name:"N", value:"normalize", realname:"Normalize all: Highest score for closest, lowest for farthest.  Somewhere in the middle for everyone else.", margin:4},
            {name:"F", value:"normalize frontrunners only", realname:"Frontrunners: Normalize only for the set of frontrunners.  Highest score for all better.  Lowest score for all worse.", margin:4},
            {name:"F+", value:"best frontrunner", realname:"Best frontrunner: Highest score for best frontrunner and all better.  Lowest score for all others.", margin:4},
            {name:"F-", value:"not the worst frontrunner", realname:"Not the worst frontrunner: Lowest score for worst frontrunner and all worse.  Highest score for all others."}
        ];
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "scoreFirstStrategy"
            },
        ]        
        self.onChoose = function(data){
            config.scoreFirstStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "strategy for score-type voter:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.scoreFirstStrategy);
        }
    }

    ui.menu.choiceFirstStrategy = new function() { // just filling in firstStrategy with a limited set
        var self = this
        self.list = [
            {name:"H", value:"zero strategy. judge on an absolute scale.", realname:"Honesty", margin:4},
            {name:"F", value:"normalize frontrunners only", realname:"Pick the Best Frontrunner", margin:4},
        ];
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "choiceFirstStrategy"
            },
        ]
        self.onChoose = function(data){
            config.choiceFirstStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "Voter Strategy <span class='smaller'>(choice-type)</span>:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.choiceFirstStrategy);
        }
    }

    ui.menu.pairFirstStrategy = new function() { // just filling in firstStrategy with a limited set
        var self = this
        self.list = [
            {name:"H", value:"zero strategy. judge on an absolute scale.", realname:"Honesty", margin:4},
        ];
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "pairFirstStrategy"
            },
        ]
        self.onChoose = function(data){
            config.pairFirstStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "strategy for pair-type voter:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.pairFirstStrategy);
        }
    }

    function _showOrHideMenuForStrategy(config) {			
        var not_f = ["zero strategy. judge on an absolute scale.","normalize"]
        var turnOffFrontrunnerControls =  not_f.includes(config.firstStrategy)
        if (config.doTwoStrategies) {
            if (! not_f.includes(config.secondStrategy) ) {
                turnOffFrontrunnerControls = false
            }
        }
        var onFront = ! turnOffFrontrunnerControls
        showMenuItemsIf("divPoll", onFront)
        var doManual = config.autoPoll == "Manual"
        showMenuItemsIf("divManualPoll", doManual)
    }

    ui.menu.doTwoStrategies = new function() { // Is there a 2nd strategy?
        var self = this
        self.list = [
            {realname: "opton for 2nd strategy", name:"2", value:"2"}
        ];
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "secondStrategies" // old. not used anymore, but kept
            },
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "secondStrategy"
            },
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "firstStrategy"
            },
            {
                field: "doTwoStrategies",
                decode: {
                    0:false,
                    1:true,
                },
            },
        ]
        self.onChoose = function(data){
            // LOAD INPUT
            config.doTwoStrategies = data.isOn
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update();
            ui.menu_update()
        };
        self.configure = function() {
            showMenuItemsIf("divSecondStrategy", config.doTwoStrategies)
            _showOrHideMenuForStrategy(config)
            model.doTwoStrategies = config.doTwoStrategies
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].doTwoStrategies = config.doTwoStrategies
            }
        }
        self.select = function() {
            if (config.doTwoStrategies) {
                var a = ["2"]
            } else {
                var a = []
            }
            self.choose.highlight("value", a)
        }
        self.choose = new ButtonGroup({
            label: "",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        });			
    }

    ui.menu.scoreSecondStrategy = new function() { // just filling in secondStrategy with a limited set
        var self = this
        self.list = ui.menu.scoreFirstStrategy.list
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "scoreSecondStrategy"
            },
        ]
        self.onChoose = function(data){
            config.scoreSecondStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "2nd strategy for score-type voter:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.scoreSecondStrategy);
        }
    }

    ui.menu.choiceSecondStrategy = new function() { // just filling in secondStrategy with a limited set
        var self = this
        self.list = ui.menu.choiceFirstStrategy.list
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "choiceSecondStrategy"
            },
        ]
        self.onChoose = function(data){
            config.choiceSecondStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "2nd strategy for choice-type voter:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.choiceSecondStrategy);
        }
    }

    ui.menu.pairSecondStrategy = new function() { // just filling in secondStrategy with a limited set
        var self = this
        self.list = ui.menu.pairFirstStrategy.list
        self.codebook = [
            {
                decode: ui.strategyOrganizer.decodeList,
                field: "pairSecondStrategy"
            },
        ]
        self.onChoose = function(data){
            config.pairSecondStrategy = data.value;
            ui.strategyOrganizer.onChoose()
        };
        self.choose = new ButtonGroup({
            label: "2nd strategy for pair-type voter:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.pairSecondStrategy);
        }
    }

    ui.menu.percentSecondStrategy = new function() {  // group count
        var self = this
        self.onChoose = function(slider,n) {
            // LOAD INPUT
            config.percentSecondStrategy[n] = slider.value;
            // CONFIGURE
            self.configureN(n)
            // UPDATE
            model.update();
        }
        self.configure = function() {
            for (var i=0; i<model.voterGroups.length; i++) {
                self.configureN(i)
            }
        }
        self.configureN = function(n) {
            // _showOrHideMenuForStrategy(config) // not necessary
            if (model.voterGroups[n].voterGroupType=="GaussianVoters") {
            model.voterGroups[n].percentSecondStrategy = config.percentSecondStrategy[n]
        }
        }
        self.select = function() {
            for (i in self.choose.sliders) {
                self.choose.sliders[i].value = config.percentSecondStrategy[i]
            }
        }
        self.choose = new sliderSet({
            max: "100",
            min:"0",
            value:"50",
            chtext:"",
            chid:"choosepercent",
            chfn:self.onChoose,
            num:ui.maxVoters,
            labelText: "what % use this 2nd strategy?"
        })
    }	

    if (0) { // are there primaries?
        ui.menu.primaries = new function() {
            var self = this
            self.list = [
                {name:"Yes", value:"Yes",realname:"Yes", margin:4},
                {name:"No", value:"No",realname:"No"}
            ];
            self.onChoose = function(data){
                config.primaries = data.value
                self.configure()
                model.update()
            };
            self.configure = function() {
                model.primaries = data.value
            }
            self.select = function() {
                self.choose.highlight("value", config.primaries)
            }
            self.choose = new ButtonGroup({
                label: "Primaries?",
                width: bw(3),
                data: self.list,
                onChoose: self.onChoose
            });
        }
    }

    ui.menu.autoPoll = new function() { // do a poll to find frontrunner
        var self = this
        self.list = [
            {name:"Auto", value:"Auto",realname:"Choose frontrunners automatically.", margin:4},
            {name:"Manual", value:"Manual",realname:"Press the poll button to find the frontrunners once."}
        ];
        self.codebook = [
            {
                field: "autoPoll",
                decode: {
                    0:"Auto",
                    1:"Manual"
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD INPUT
            config.autoPoll = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update();
            ui.menu_update()
        };
        self.configure = function() {
            showMenuItemsIf("divManualPoll", config.autoPoll == "Manual")
            model.autoPoll = config.autoPoll
        }
        self.select = function() {
            self.choose.highlight("value", config.autoPoll)
        }
        self.choose = new ButtonGroup({
            label: "AutoPoll to find new frontrunner:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }


    function _iconButton(id) {
        return "<span class='buttonshape'>"+model.icon(id)+"</span>"
    }

    ui.menu.frontrunners = new function() { // frontrunners
        var self = this
        self.list = undefined
        // the makelist menu items are of a different class
        // they can't have things be dependent on them
        // they have to wait for the update step
        // they can depend on a configured model
        // maybe the initDOM step woudl be a good place ot put them
        self.makelist = function() {
            var a = []
            for (var i=0; i < model.candidates.length; i++) {
                var c = model.candidates[i]
                a.push({
                    name:_iconButton(c.id),
                    realname:c.id,
                    margin:4
                })
            }
            if (a.length > 0) a[a.length-1].margin = 0
            return a
        }
        self.codebook = [ {
            field: "preFrontrunnerIds",
            decode: {
                0:"square",
                1:"triangle",
                2:"hexagon",
                3:"pentagon",
                4:"bob",
            }
        } ]
        self.onChoose = function(data){
            // LOAD INPUT
            var preFrontrunnerSet = new Set(config.preFrontrunnerIds)
            if (data.isOn) {
                preFrontrunnerSet.add(data.realname)
            } else {
                preFrontrunnerSet.delete(data.realname)
            }
            config.preFrontrunnerIds = Array.from(preFrontrunnerSet)
            // CONFIGURE
            self.configure()
            // UPDATE
            model.dm.districtsListCandidates()
            model.update();
        };
        self.configure = function() {
            model.preFrontrunnerIds = config.preFrontrunnerIds
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].preFrontrunnerIds = config.preFrontrunnerIds
            }
        }
        self.select = function() {
            self.choose.highlight("realname", config.preFrontrunnerIds);
        }
        self.choose = new ButtonGroup({
            label: "who are the frontrunners?",
            width: bw(5),
            makeData: self.makelist,
            onChoose: self.onChoose,
            isCheckbox: true
        });	
    }

    ui.menu.poll = new function() { // do a poll to find frontrunner
        var self = this
        self.list = [
            {name:"Poll",value:"Poll",margin:4},
            {name:"Poll 2",value:"Poll 2",realname:"Find the top 2 frontrunners."}
        ];
        self.onChoose = function(data){
            // DO CALCULATIONS //
            // get poll results
            if (data.value == "Poll") { // get last poll
                var won = model.result.winners
            } else { // do new poll
                model.doTop2 = true
                model.update()
                model.doTop2 = false
                var won = model.result.theTop2
            }
            // UPDATE CONFIG //
            config.preFrontrunnerIds = won
            // UPDATE MENU //
            ui.menu.frontrunners.select()
            // CONFIGURE AND UPDATE MODEL //
            ui.menu.frontrunners.configure()
            model.dm.districtsListCandidates()
            model.update();
        };
        self.choose = new ButtonGroup({
            label: "Poll to find new frontrunner:",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose,
            justButton: true
        });
    }


    ui.menu.centerPollThreshold = new function() { // do a poll to find frontrunner
        var self = this
        self.list = [
            {name:".5", value:.5, margin:4},
            {name:".7", value:.7, margin:4},
            {name:".9", value:.9,}
        ];
        // self.codebook = [
        //     {
        //         field: "centerPollThreshold",
        //         decode: {
        //             0:.5,
        //             1:.7,
        //             2:.9,
        //         }
        //     }
        // ]
        self.onChoose = function(data){
            // LOAD INPUT
            config.centerPollThreshold = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.centerPollThreshold = config.centerPollThreshold
        }
        self.select = function() {
            self.choose.highlight("value", config.centerPollThreshold)
        }
        self.choose = new ButtonGroup({
            label: "What fraction of leading frontrunner's votes is viable?",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
    }


    ui.menu.yee = new function() { // yee
        var self = this
        self.list = undefined
        self.makelist = function() {
            var a = []
            for (var i=0; i < model.voterGroups.length; i++) {
                var v = model.voterGroups[i]
                a.push({
                    name:i+1,
                    realname:"voter group #"+(i+1),
                    keyyee:i,
                    kindayee:"voter",
                    margin:4
                })
            }
            var calcWidth = 6 * bw(10) + 5 * 4
            a.push({
                name:"Voter Center",
                realname:"all voters",
                keyyee:"mean",
                kindayee:"center",
                width: calcWidth, 
                margin:220-calcWidth,
            })
            for (var i=0; i < model.candidates.length; i++) {
                var c = model.candidates[i]
                a.push({
                    name:_iconButton(c.id),
                    realname:c.id,
                    keyyee:c.id,
                    kindayee:"can",
                    margin:4
                })
            }
            a.push({
                name:"+",
                realname:"Additional Candidate",
                keyyee: "newcan",
                kindayee:"newcan",
                margin:4
            })


            return a
        }
        self.codebook = [ {
            field: "kindayee",
            decode: {
                0:"voter",
                1:"center",
                2:"can",
                3:"newcan",
            }
        },{
            field: "keyyee",
            decode: {
                0:"newcan",
                1:"mean",
                2:"square",
                3:"triangle",
                4:"hexagon",
                5:"pentagon",
                6:"bob",
            }
        } ]
        self.onChoose = function(data){
            // LOAD INPUT
            config.kindayee = data.kindayee
            config.keyyee = data.keyyee
            // CONFIGURE
            self.configure()
            // INIT
            model.initMODEL()
            // UPDATE
            model.update();
            ui.menu_update()
        };
        self.configure = function() {
            showMenuItemsIf("divYee",  true) // kind of a holdover from a previous version
            model.kindayee = config.kindayee
            model.keyyee = config.keyyee
        }
        self.select = function() {
            self.choose.highlight("keyyee", config.keyyee);
        }
        self.choose = new ButtonGroup({
            label: "which object for yee map?",
            width: bw(9),
            makeData: self.makelist,
            onChoose: self.onChoose,
        });
        self.choose.dom.setAttribute("id","yee") // interesting
    }

    ui.menu.yeefilter = new function() { 	// yee filter
        var self = this
        self.list = undefined
        self.makelist = function() {
            var a = []
            var newListSerial = []
            var newListId = []
            for (var i=0; i < model.candidates.length; i++) {
                var c = model.candidates[i]
                a.push({
                    name:_iconButton(c.id),
                    realname:c.id,
                    keyyee:c.id,
                    serial: c.serial,
                    margin:4
                })
                if (c.serial in config.yeefilter) {
                    // if (Object.keys(config.yeefilter).includes(c.serial)) {
                    newListSerial[c.serial] = config.yeefilter[c.serial]
                    newListId[c.id] = config.yeefilter[c.serial]
                } else {
                    newListSerial[c.serial] = true
                    newListId[c.id] = true
                }
            }

            // update yeefilter
            config.yeefilter = newListSerial
            model.yeefilter = newListId
            return a
        }
        self.codebook = [ {
            field: "yeefilter",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD CONFIG //
            config.yeefilter[data.serial] = data.isOn
            // CONFIGURE
            self.configure()
            // UPDATE
            model.drawArenas();
        };
        self.configure = function() {
            for (var serial in config.yeefilter) {
                var id = Candidate.idFromSerial(serial,config.theme)
                model.yeefilter[id] = config.yeefilter[serial]
            }
            return
            // model.yeefilter = config.yeefilter
        }
        self.select = function() {
            self.choose.highlight("serial", config.yeefilter);
        }
        self.choose = new ButtonGroup({
            label: "filter yee map?",
            width: bw(9),
            makeData: self.makelist,
            onChoose: self.onChoose,
            isCheckboxBool: true
        });
        self.choose.dom.setAttribute("id","yeefilter")
    }

    ui.menu.gearconfig = new function() { 	// gear config - decide which menu items to do
        var self = this
        self.initSpecial = function() {
            // list all the menu items
            self.list = []
            var n=1
            for (var name in ui.menu) {
                var mar = (n % 10 == 0) ? 0 : 4 
                self.list.push({name:n,realname:name,margin:mar})
                n++
            }
            self.choose = new ButtonGroup({
                label: "which menu options are displayed?",
                width: bw(10),
                data: self.list,
                onChoose: self.onChoose,
                isCheckbox: true
            });
        }
        self.codebook = [
            {
                field: "featurelist",
                decode: {
                    0: "systems",
                    1: "rbSystems",
                    2: "dimensions", // still need to keep this even though it isn't here anymore
                    3: "nVoterGroups",
                    4: "xVoterGroups",
                    5: "group_count",
                    6: "group_spread",
                    7: "nCandidates",
                    8: "firstStrategy",
                    9: "doTwoStrategies",
                    10: "secondStrategy",
                    11: "percentSecondStrategy",
                    12: "autoPoll",
                    13: "frontrunners",
                    14: "poll",
                    15: "yee",
                    16: "yeefilter",
                    17: "gearicon",
                    18: "seats",
                    19: "nDistricts",
                    20: "customNames",
                    21: "namelist",
                    22: "gearconfig",
                    23: "presetconfig",
                    24: "choose_pixel_size",
                    25: "computeMethod",
                    26: "colorChooser",
                    27: "colorSpace",
                    28: "spread_factor_voters",
                    29: "arena_size",
                    30: "median_mean",
                    31: "theme",
                    32: "utility_shape",
                    33: "votersAsCandidates",
                    34: "ballotVis",
                    35: "visSingleBallotsOnly",
                    36: "gearoff",
                    37: "menuVersion",
                    38: "menuLevel",
                    39: "stepMenu",
                    40: "doFeatureFilter",
                    41: "spacer",
                    42: "yeeon",
                    43: "beatMap",
                    44: "ballotConcept",
                    45: "roundChart",
                    46: "sidebarOn",
                    47: "lastTransfer",
                    48: "voterIcons",
                    49: "candidateIcons",
                    50: "pairwiseMinimaps",
                    51: "textBallotInput",
                    52: "doTextBallots",
                    53: "behavior",
                    54: "submitTextBallots",
                    55: "showToolbar",
                    56: "rankedVizBoundary",
                    57: "showDescription",
                    58: "doElectabilityPolls",
                    59: "partyRule",
                    60: "doFilterSystems",
                    61: "filterSystems",
                    62: "doFilterStrategy",
                    63: "includeSystems",
                    64: "showPowerChart",
                    65: "putMenuAbove",
                    66: "scoreFirstStrategy",
                    67: "choiceFirstStrategy",
                    68: "pairFirstStrategy",
                    69: "scoreSecondStrategy",
                    70: "choiceSecondStrategy",
                    71: "pairSecondStrategy",
                    72: "voterIcons",
                    74: "useBeatMapForRankedBallotViz",
                    75: "centerPollThreshold",
                    76: "doMedianDistViz",
                    77: "createStrategyType",
                    78: "createBallotType",
                },
            }
        ]
        // HOWTO: This is another place to update when adding a new menu item

        self.onChoose = function(data){
            // LOAD INPUT
            modifyConfigFeaturelist(config,data.isOn, [data.realname])
            // UPDATE
            self.configure()
        };
        self.configure = function() {
            _hideOrShowFeatures()
        }
        self.select = function() {
            self.choose.highlight("realname", config.featurelist);
        }
    }

    function _hideOrShowFeatures() {
        
        var noneShow = _showFeatures()
        _hideFeatures()

        if (noneShow) {
            _addClass(ui.dom.left,"displayNoneClass")
        } else {
            _removeClass(ui.dom.left,"displayNoneClass")
        }

        if ( !noneShow && config.putMenuAbove  && ! model.devOverrideShowAllFeatures) {
            _addClass(ui.dom.left,"displayAboveClass")
        } else {
            _removeClass(ui.dom.left,"displayAboveClass")
        }
        
        return
    }

    function _showFeatures() {
        var noneShow = true
        for (i in ui.menu) {
            // go through all the menu items
            // if the feature is listed or the feature filter is off, show the feature
            // or if the Override is on
            // and , show the feature
            if(model.devOverrideShowAllFeatures || !config.doFeatureFilter || config.featurelist.includes(i)) {
                ui.menu[i].choose.dom.hidden = false
                noneShow = false
            }
        }
        return noneShow
    }

    function _hideFeatures() {
        for (i in ui.menu) {
            // go through all the menu items
            // if the feature is listed or the feature filter is off, show the feature
            // or if the Override is on
            // and , show the feature
            if(model.devOverrideShowAllFeatures || !config.doFeatureFilter || config.featurelist.includes(i)) {
                continue
            } else {
                ui.menu[i].choose.dom.hidden = true
            }
        }
    }


    ui.menu.presetconfig = new function() { // pick a preset
        var self = this
        self.list = _buildPresetConfig({nElection:31,nBallot:17})
        function _buildPresetConfig(c) {
            // var presetnames = ["O","SA"]
            // var presetModelNames = [config.filename,"sandbox.html"]
            // var presetdescription = ["original intended preset","sandbox"]
            var presetnames = ["S"]
            var presetModelNames = ["sandbox"]
            var presetdescription = ["sandbox"]

            // and fill in the rest
            for (var i=1;i<=c.nElection;i++) {
                presetnames.push("e"+i)
                presetModelNames.push("election"+i)
                presetdescription.push("election"+i)
            }
            presetnames.push("O")
            presetModelNames.push(model.id)
            presetdescription.push("original intended preset")
            // TODO
            for (var i=1;i<=c.nBallot;i++) {
                presetnames.push("b"+i)
                presetModelNames.push("ballot"+i)
                presetdescription.push("ballot"+i)
            }
            
            var presetconfig = []
            for (i in presetnames) {
                var mar = ((Number(i)+1) % 5 == 0) ? 0 : 4 
                presetconfig.push({name:presetnames[i],realname:presetdescription[i],presetName:presetModelNames[i],margin:mar})
            }
            return presetconfig
        }
        self.onChoose = function(data){
            if (data.isOn) {
                // LOAD MAIN
                var ui2 = loadpreset(data.presetName)
                var firstletter = data.presetName[0]

                // here's where I should make use of ui2.uiType
                // if (ui2.uiType == "election" || ui2.uiType == "sandbox" || ui2.uiType == "sandbox-original")
                if (firstletter == 'e' || firstletter == 's') {
                    
                    // LOAD Preset
                    _copyAttributes(config, ui2.preset.config)
                    
                // } else if (ui2.uiType == "ballot")
                } else if (firstletter == 'b') { 
                    //document.location.replace(data.htmlname);
                    // LOAD Defaults
                    var ballotconfig = {
                        system: "Plurality",
                        voterPositions: [[81,92]],
                        candidatePositions: [[41,50],[153,95],[216,216]],
                        firstStrategy: "zero strategy. judge on an absolute scale.",
                        scoreFirstStrategy: "zero strategy. judge on an absolute scale.",
                        choiceFirstStrategy: "zero strategy. judge on an absolute scale.",
                        pairFirstStrategy: "zero strategy. judge on an absolute scale.",
                        secondStrategy: "zero strategy. judge on an absolute scale.",
                        scoreSecondStrategy: "zero strategy. judge on an absolute scale.",
                        choiceSecondStrategy: "zero strategy. judge on an absolute scale.",
                        pairSecondStrategy: "zero strategy. judge on an absolute scale.",
                        preFrontrunnerIds: ["square","triangle"],
                        showChoiceOfStrategy: false,
                        showChoiceOfFrontrunners: false,
                        doStarStrategy: false
                    }
                    // LOAD Preset
                    Object.assign(ballotconfig, ui2.preset.config )
                    // get config from ballotconfig
                    var systemTranslator = {Plurality:"FPTP",Ranked:"Condorcet",Approval:"Approval",Score:"Score",Three:"3-2-1"}
                    
                    _copyAttributes(config, {
                        system: systemTranslator[ballotconfig.system],
                        voterPositions: ballotconfig.voterPositions,
                        candidatePositions: ballotconfig.candidatePositions,
                        firstStrategy: ballotconfig.firstStrategy,
                        scoreFirstStrategy: ballotconfig.scoreFirstStrategy,
                        choiceFirstStrategy: ballotconfig.choiceFirstStrategy,
                        pairFirstStrategy: ballotconfig.pairFirstStrategy,
                        secondStrategy: ballotconfig.secondStrategy,
                        scoreSecondStrategy: ballotconfig.scoreSecondStrategy,
                        choiceSecondStrategy: ballotconfig.choiceSecondStrategy,
                        pairSecondStrategy: ballotconfig.pairSecondStrategy,
                        preFrontrunnerIds: ballotconfig.preFrontrunnerIds,
                        // these are not based on the ballot config
                        oneVoter: true,
                        arena_size: 300
                    })
                    config.featurelist = []
                    if (ballotconfig.showChoiceOfFrontrunners) {config.featurelist.push("frontrunners")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("scoreFirstStrategy")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("choiceFirstStrategy")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("pairFirstStrategy")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("scoreSecondStrategy")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("choiceSecondStrategy")}
                    if (ballotconfig.showChoiceOfStrategy) {config.featurelist.push("pairSecondStrategy")}
                }
                // CONFIGURE MAIN
                cConfig.cleanConfig(config)
                config.sandboxsave = true // we're in a sandbox
                config.featurelist = Array.from((new Set(config.featurelist)).add("gearicon").add("presetconfig"))
                _copyAttributes(initialConfig,config)
                // CONFIGURE (LOADER)
                model.size = config.arena_size
                // INIT (LOADER)
                model.initDOM()
                // RESET = CREATE, CONFIGURE, INIT (FOR MODEL)
                model.reset()
                model.update()
                // UPDATE (MENU AND ARENA)
                _objF(ui.arena,"update")
                _objF(ui.menu,"select");
            }
        };
        self.choose = new ButtonGroup({
            label: "pick a preset:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
		self.init_sandbox = function() {
			self.choose.highlight("presetName", model.id); // only do this once.  Otherwise it would be in updateUI
		}
    }

    ui.menu.choose_pixel_size = new function() {
        var self = this
        self.list = [
            {name:"60",val:60,margin:4},
            {name:"30",val:30,margin:4},
            {name:"12",val:12,margin:4},
            {name:"6",val:6}
        ]
        self.codebook = [ {
            field: "pixelsize",
            decode: {
                0:6,
                1:12,
                2:30,
                3:60,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.pixelsize = data.val
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.pixelsize = config.pixelsize
        }
        self.select = function() {
            self.choose.highlight("val", config.pixelsize);
        }
        self.choose = new ButtonGroup({
            label: "size of pixels in yee diagram:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.computeMethod = new function () {
        var self = this
        self.list = [
            {name:"gpu", value:"gpu",margin:4},
            {name:"js", value:"js",margin:4},
            {name:"ez", value:"ez"}
        ]
        self.codebook = [ {
            field: "computeMethod",
            decode: {
                0:"gpu",
                1:"js",
                2:"ez",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.computeMethod = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.computeMethod = config.computeMethod
        }
        self.select = function() {
            self.choose.highlight("value", config.computeMethod);
        }
        self.choose = new ButtonGroup({
            label: "method of computing yee diagram:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.colorChooser = new function () {
        var self = this
        self.list = [
            {name: "pr", realname:"pick and repeat", value:"pick and repeat",margin:4},
            {name: "pro", realname:"pick and repeat w/ offset", value:"pick and repeat w/ offset",margin:4},
            {name: "g", realname:"generate all", value:"generate all",margin:4},
            {name: "pg", realname:"pick and generate", value:"pick and generate"}
        ]
        self.codebook = [
            {
                field: "colorChooser",
                decode: {
                    0:"pick and repeat",
                    1:"pick and repeat w/ offset",
                    2:"generate all",
                    3:"pick and generate"
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.colorChooser = data.value
            // CONFIGURE
            self.configure()
            // INIT
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.colorChooser = config.colorChooser
        }
        self.select = function() {
            self.choose.highlight("value", config.colorChooser);
        }
        self.choose = new ButtonGroup({
            label: "Method of Choosing Colors:",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.colorSpace = new function () {
        var self = this
        self.list = [
            {name:"hsluv with dark", value:"hsluv with dark"}
            // ,margin:4},
            // {name:"hsluv light", value:"hsluv light",margin:4},
            // {name:"cie sampling", value:"cie sampling",margin:4},
            // {name:"hsl with dark", value:"hsl with dark"}
        ]
        self.codebook = [
            {
                field: "colorSpace",
                decode: {
                    0:"hsluv with dark"
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.colorSpace = data.value
            // CONFIGURE
            self.configure()
            // INIT
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.colorSpace = config.colorSpace
        }
        self.select = function() {
            self.choose.highlight("value", config.colorSpace);
        }
        self.choose = new ButtonGroup({
            label: "Color Space:",
            width: bw(1),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.spread_factor_voters = new function () {
        var self = this
        self.list = [
            {name:"1",val:1,margin:4},
            {name:"2",val:2,margin:4},
            {name:"5",val:5}
        ]
        self.codebook = [ {
            field: "spread_factor_voters",
            decode: {
                0:0,
                1:1,
                2:2,
                3:5,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.spread_factor_voters = data.val
            // CONFIGURE
            self.configure()
            // INIT
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].init()
            }
            _pileVoters(model)
            model.dm.redistrict()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.spread_factor_voters = config.spread_factor_voters
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].spread_factor_voters = config.spread_factor_voters
            }
        }
        self.select = function() {
            self.choose.highlight("val", config.spread_factor_voters);
        }
        self.choose = new ButtonGroup({
            label: "Voter Spread:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.arena_size = new function () {
        var self = this
        self.list = [
            {name:"300",val:300,margin:4},
            {name:"600",val:600}
        ]
        self.codebook = [
            {
                field: "arena_size",
                decode: {
                    0:300,
                    1:600
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            var ratio = data.val / config.arena_size
            config.arena_size = data.val
            if ("300" == data.val) config.spread_factor_voters = 1
            if ("600" == data.val) config.spread_factor_voters = 2
            // CONFIGURE
            self.configure()
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].x *= ratio
                model.voterGroups[i].y *= ratio
            }
            for (var i=0; i<model.candidates.length; i++) {
                model.candidates[i].x *= ratio
                model.candidates[i].y *= ratio
            }
            // INIT (LOADER)	
            model.initDOM()
            // INIT
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].init()
            }
            _pileVoters(model)
            model.dm.redistrict()
            for (var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            // UPDATE
            model.update()
            _objF(ui.arena,"update")
            ui.menu.spread_factor_voters.select()
        };
        self.configure = function() {
            // CONFIGURE (LOADER)
            model.size = config.arena_size
            // CONFIGURE
            model.spread_factor_voters = config.spread_factor_voters
            for (var i=0; i<model.voterGroups.length; i++) {
                model.voterGroups[i].spread_factor_voters = config.spread_factor_voters
            }
        }
        self.select = function() {
            self.choose.highlight("val", config.arena_size);
        }
        self.choose = new ButtonGroup({
            label: "Arena size:",
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.median_mean = new function () {
        var self = this
        self.list = [
            {name:"median",val:2,margin:4},
            {name:"mean",val:1}
        ]
        self.codebook = [ {
            field: "median_mean",
            decode: {
                0:0,
                1:1,
                2:2,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.median_mean = data.val
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.median_mean = config.median_mean
        }
        self.select = function() {
            self.choose.highlight("val", config.median_mean);
        }
        self.choose = new ButtonGroup({
            label: "Median or Mean:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.theme = new function () {
        var self = this
        self.list = [
            {name:"Letters", value:"Letters",realname:"Default",margin:4},
            {name:"Shapes", value:"Default",realname:"Default",margin:4},
            {name:"Nicky", value:"Nicky",realname:"The original style theme by Nicky Case",margin:0},
            {name:"Bees", value:"Bees",realname:"The Bee mode style for Unsplit."},
        ]

        self.codebook = [
            {
                field: "theme",
                decode: {
                    0:"Default",
                    1:"Nicky",
                    2:"Bees",
                    3:"Letters",
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.theme = data.value
            // CONFIGURE
            self.configure()
            
            // some configurations might have updated, so update the ui selections
            ui.menu.colorChooser.select()
            ui.menu.behavior.select()

            // INIT MODEL
		    model.arena.initARENA()
            for(var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            model.initMODEL()
            // INIT SANDBOX
            self.init_sandbox() // sets the class of the div
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.theme = config.theme
            if (config.theme == "Bees") {
                model.showVoters = false
            } else {
                model.showVoters = true
            }

		    if (config.theme == "Nicky") {
                model.useBorderColor = true
                model.drawSliceMethod = "circleNicky"
                model.allCan = false
                model.voterCenterIcons = "off"
                model.showToolbar = "off"
            } else {
                model.useBorderColor = false
                model.drawSliceMethod = "barChart"
                model.allCan = true
                model.voterCenterIcons = "on"
                model.showToolbar = "on"
            }
            
            if (config.theme == "Nicky" || config.theme == "Bees") {
                config.colorChooser = "pick and repeat"
            } else {
                config.colorChooser = "pick and generate"
            }

            ui.menu.colorChooser.configure()

            if (config.theme == "Bees") {
                config.behavior = "bounce"
                ui.menu.behavior.configure()
            } else {
                config.behavior = "stand"
                ui.menu.behavior.configure()
            }
        }
        self.init_sandbox = function() {
            for (var i = 0; i < self.list.length; i++) {
               ui.dom.basediv.classList.remove("div-model-theme-" + self.list[i].value)
            }
            ui.dom.basediv.classList.add("div-model-theme-" + model.theme)
        }
        self.select = function() {
            self.choose.highlight("value", config.theme);
        }
        self.choose = new ButtonGroup({
            label: "Theme:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.utility_shape = new function () {
        var self = this
        self.list = [
            {name:"linear", value:"linear",margin:4},
            {name:"quadratic", value:"quadratic",margin:4},
            {name:"log", value:"log"}
        ]
        self.codebook = [
            {
                field: "utility_shape",
                decode: {
                    0:"linear",
                    1:"quadratic",
                    2:"log"
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.utility_shape = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.utility_shape = config.utility_shape
        }
        self.select = function() {
            self.choose.highlight("value", config.utility_shape);
        }
        self.choose = new ButtonGroup({
            label: "Utility Shape:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.votersAsCandidates = new function () {
        var self = this
        self.list = [
            {name:"yes",value:true,margin:4},
            {name:"no",value:false}
        ]
        self.codebook = [
            {
                field: "votersAsCandidates",
                decode: {
                    0:false,
                    1:true,
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.votersAsCandidates = data.value
            // CONFIGURE
            self.configure()
            
            config.votersAsCandidates = false // turn it off // just one press
            setTimeout(self.select,800)
            // UPDATE

            // show warning
            var string = 'Turned off Sidebar and Power Chart to save computer time.'
            var textNode = document.createElement('div')
            textNode.className = "button-group"
            self.choose.dom.after(textNode)
            var subNode = document.createElement('div')
            subNode.className = "button-group-label"
            textNode.appendChild(subNode)
            subNode.innerHTML = string
            setTimeout(() => textNode.remove(),4000)

            if ( model.doTextBallots) return // text ballots are not relevant here
            // virtually press some buttons
            // pretend we did onChoose and select for the following options to make things run more smoothly
            config.roundChart = "off"
            ui.menu.roundChart.configure()
            ui.menu.roundChart.select()
            config.sidebarOn = "off"
            ui.menu.sidebarOn.configure()
            ui.menu.sidebarOn.select()

            model.update()
        };
        self.configure = function() {
            model.votersAsCandidates = config.votersAsCandidates
        }
        self.select = function() {
            self.choose.highlight("value", config.votersAsCandidates);
        }
        self.choose = new ButtonGroup({
            label: "Voters as Candidates:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.ballotVis = new function () {
        var self = this
        self.list = [
            {name:"yes",value:true,margin:4},
            {name:"no",value:false}
        ]
        self.codebook = [
            {
                field: "ballotVis",
                decode: {
                    0:false,
                    1:true,
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.ballotVis = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.ballotVis = config.ballotVis
        }
        self.select = function() {
            self.choose.highlight("value", config.ballotVis);
        }
        self.choose = new ButtonGroup({
            label: "Show Ballot Visuals:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.visSingleBallotsOnly = new function () {
        var self = this
        self.list = [
            {name:"yes",value:true,margin:4},
            {name:"no",value:false}
        ]
        self.codebook = [
            {
                field: "visSingleBallotsOnly",
                decode: {
                    0:false,
                    1:true,
                }
            }
        ]
        self.onChoose = function(data){
            // LOAD
            config.visSingleBallotsOnly = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.update()
        };
        self.configure = function() {
            model.visSingleBallotsOnly = config.visSingleBallotsOnly
        }
        self.select = function() {
            self.choose.highlight("value", config.visSingleBallotsOnly);
        }
        self.choose = new ButtonGroup({
            label: "Only Visualize Single Voters:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.gearicon = new function () {
        // gear button (combines with above)
        var self = this
        self.list = [
            {name:"config"}
        ]
        self.isOn = false // by default
        self.onChoose = function(data){
            // LOAD
            self.isOn = data.isOn
            // no config.gearicon because we don't want to save with the config menu open
            // UPDATE
            self.configure()
            // gear means 
        };
        self.configure = function() {
            if (self.isOn) {
                ui.m1.menuNameDivs["gearList"][0].hidden = false
            } else {
                ui.m1.menuNameDivs["gearList"][0].hidden = true
            }
        }
        // no select because we don't want to save with the config menu open
        self.choose = new ButtonGroup({
            label: "",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        })
    }

    ui.menu.gearoff = new function () {
        var self = this
        self.list = [
            {name:"are you sure?",realname:"You won't be able to get the config back, so I'd recommend saving first and then disabling the config and then saving again.  That way you still have a copy that you can edit later if you made a mistake."}
        ]
        self.onChoose = function(data){
            // LOAD INPUT
            var hit = data.isOn
            if (hit) {
                var response = window.confirm("Press cancel and we can forget this ever happened.  Or press the other button and the config options will be removed.")
                config.hidegearconfig = response
                self.configure()
            }
        }
        self.configure = function() {
            if (config.hidegearconfig) {
                modifyConfigFeaturelist(config,false, ["gearicon"])
                ui.menu.gearicon.choose.dom.hidden = true
                ui.menu.gearicon.onChoose({isOn:false})

            }
        }
        // no select because it's either hidden or off
        self.choose = new ButtonGroup({
            label: "Disable Config Button !no",
            width: bw(1),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        });
    }



    // if there is nothing in the menu, then don't show the option.

    // menuLevel select

    // submenu select

    // button to switch between old and new menus
    
    // menu version
    // set the default config to the old menu

    // set the preset config for the sandbox to the new menu
    

    // menuLevel select

    ui.menu.menuVersion = new function () {
        var self = this
        self.list = [
            {name:"1",value:"1",margin:4},
            {name:"2",value:"2"}
        ]
        self.codebook = [ {
            field: "menuVersion",
            decode: {
                0:"0",
                1:"1",
                2:"2",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.menuVersion = data.value
            if (config.menuVersion !== "1") {
                config.doFeatureFilter = false
            }
            // CONFIGURE
            self.configure()
            
            if (config.menuVersion !== "1") {
                ui.menu.doFeatureFilter.select()
            }
        };
        self.configure = function() {

            // remove nodes from menu
            // clearMenus()
            
            // reattach nodes
            if (config.menuVersion === "1") {
                ui.m1.buildSubMenus()
            } else {
                ui.m2.buildSubMenus() // place menu items into dom structure
            }
            _hideOrShowFeatures()
            ui.menu_update() // actually hide/show things
        }
        self.choose = new ButtonGroup({
            label: "Menu Version:",
            width: bw(3),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.menuVersion);
        }
    }

    ui.menu.menuLevel = new function () {
        var self = this
        self.list = [
            // {name:"basic",value:"basic",margin:4},
            {name:"stock",value:"normal",margin:4},
            {name:"more",value:"advanced"}
        ]
        self.codebook = [ {
            field: "menuLevel",
            decode: {
                0:"normal",  // stock?
                1:"advanced" // epic?
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.menuLevel = data.value
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {

            showMenuItemsIf( "advanced", config.menuLevel === "advanced" )

            var hideButton = ui.menu.stepMenu.choose.buttonHidden // stepMenu options

            if (config.menuLevel === "normal") { // hide advanced features
                hideButton["ui"] = true
                hideButton["dev"] = true // these options only have advanced features
            } else if (config.menuLevel === "advanced") {
                hideButton["ui"] = false
                hideButton["dev"] = false 
            }
            ui.menu.stepMenu.choose.configureHidden()
            // this update step is actually okay to have inside .configure()
        }
        self.choose = new ButtonGroup({
            label: "Options:", // Level of Expertise
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.menuLevel);
        }
    }

    ui.menu.stepMenu = new function () {
        var self = this
        self.list = [
            {name:"geom",value:"geom",margin:4},
            {name:"style",value:"style",margin:4},
            {name:"vote",value:"vote",margin:4},
            {name:"viz",value:"viz",margin:0},
            {name:"ui",value:"ui",margin:4},
            {name:"dev",value:"dev"}
        ]
        self.codebook = [ {
            field: "stepMenu",
            decode: {
                0:"geom",
                1:"style",
                2:"vote",
                3:"viz",
                4:"ui",
                5:"dev"
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.stepMenu = data.value
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {
            for (var e of self.list) {
                var name = e.value
                showMenuItemsIf( name, name == config.stepMenu)
            }
        }
        self.choose = new ButtonGroup({
            label: "Steps:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.stepMenu);
        }
    }

    
    ui.menu.doFeatureFilter = new function () {
        var self = this
        self.list = [
            {name:"yes",value:true,margin:4},
            {name:"no",value:false},
        ]
        self.codebook = [ {
            field: "doFeatureFilter",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doFeatureFilter = data.value
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {
            ui.menu.gearconfig.configure()
        }
        self.choose = new ButtonGroup({
            label: "Enable filtering of menu items?:", // Sub Menu
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.doFeatureFilter);
        }
    }

    ui.menu.spacer = new function () {
        var self = this
        self.choose = {}
        self.choose.dom = document.createElement("div")
        self.choose.dom.className = "topMenuSpacer"
    }


    ui.menu.yeeon = new function () {
        var self = this
        self.list = [
            {name:"on",value:true,margin:4},
            {name:"off",value:false},
        ]
        self.codebook = [ {
            field: "yeeon",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.yeeon = data.value
            // CONFIGURE
            self.configure()
            model.initMODEL()
            // UPDATE
            if (config.yeeon) {
                model.update() // need to calculate
            } else {
                model.draw()
            }
        };
        self.configure = function() {
            showMenuItemsIf("divWinMap", config.yeeon)
            model.yeeon = config.yeeon
        }
        self.choose = new ButtonGroup({
            label: "Draw Win Map (Yee's Diagram)?", // Sub Menu
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.yeeon);
        }
    }


    ui.menu.beatMap = new function () {
        var self = this
        self.list = [
            {name:"auto",value:"auto",margin:4},
            {name:"on",value:"on",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "beatMap",
            decode: {
                0:"off",
                1:"on",
                2:"auto",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.beatMap = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            if (config.beatMap == "off") {
                model.draw()
            } else {
                model.update() // might need to calculate
            }
        };
        self.configure = function() {
            model.beatMap = config.beatMap
        }
        self.choose = new ButtonGroup({
            label: "Beat Map", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.beatMap);
        }
    }


    ui.menu.ballotConcept = new function () {
        var self = this
        self.list = [
            {name:"auto",value:"auto",margin:4},
            {name:"on",value:"on",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "ballotConcept",
            decode: {
                0:"off",
                1:"on",
                2:"auto",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.ballotConcept = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            if (config.ballotConcept == "off") {
                model.draw()
            } else {
                model.update() // might need to calculate
            }
        };
        self.configure = function() {
            model.ballotConcept = config.ballotConcept
        }
        self.choose = new ButtonGroup({
            label: "Ballot conceptualization:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.ballotConcept);
        }
    }


    ui.menu.roundChart = new function () {
        var self = this
        self.list = [
            {name:"auto",value:"auto",margin:4},
            // {name:"on",value:"on",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "roundChart",
            decode: {
                0:"off",
                1:"on",
                2:"auto",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.roundChart = data.value
            // CONFIGURE
            self.configure()
            // INIT
            if (config.sidebarOn == "on") {
                model.update()
            }
        };
        self.configure = function() {
            model.roundChart = config.roundChart
            if (model.checkGotoTarena()) { // TODO: make a visualization for more than 1 district
                model.tarena.canvas.hidden = false
            } else {
                model.tarena.canvas.hidden = true
            }
        }
        self.choose = new ButtonGroup({
            label: "Power Chart:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.roundChart);
        }
    }

    ui.menu.showPowerChart = new function () {
        var self = this
        self.list = [
            {name:"yes",value:true,margin:4},
            {name:"no",value:false},
        ]
        self.codebook = [ {
            field: "showPowerChart",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.showPowerChart = data.value
            // CONFIGURE
            self.configure()
            // INIT
            if (config.sidebarOn = "on") {
                model.update()
            }
        };
        self.configure = function() {
            model.showPowerChart = config.showPowerChart
        }
        self.choose = new ButtonGroup({
            label: "Show Power Chart:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.showPowerChart);
        }
    }

    ui.menu.sidebarOn = new function () {
        var self = this
        self.list = [
            // {name:"auto",value:"auto",margin:4},
            {name:"on",value:"on",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "sidebarOn",
            decode: {
                0:"off",
                1:"on",
                2:"auto",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.sidebarOn = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            if (config.sidebarOn == "on") {
                model.update()
            } else {
                model.onDraw()
            }
        };
        self.configure = function() {
            model.optionsForElection.sidebar = (config.sidebarOn == "on")
        }
        self.choose = new ButtonGroup({
            label: "Written Results:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.sidebarOn);
        }
    }

    
    ui.menu.lastTransfer = new function () {
        var self = this
        self.list = [
            // {name:"auto",value:"auto",margin:4},
            {name:"on",value:"on",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "lastTransfer",
            decode: {
                0:"off",
                1:"on",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.lastTransfer = data.value
            // CONFIGURE
            self.configure()
            // INIT
            model.update() // must re-run election
        };
        self.configure = function() {
            model.opt.irv100 = (config.lastTransfer == "on")
        }
        self.choose = new ButtonGroup({
            label: "Show Last Transfer for Transferable Methods?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.lastTransfer);
        }
    }

    
    ui.menu.voterIcons = new function () {
        var self = this
        self.list = [
            {name:"circle",value:"circle",realname:"circle",margin:4},
            {name:"top",value:"top",realname:"circles with the top preference only",margin:4},
            {name:"dots",value:"dots",realname:"dots",margin:4},
            {name:"off",value:"off",realname:"off"},
        ]
        self.codebook = [ {
            field: "voterIcons",
            decode: {
                0:"circle",
                1:"top",
                2:"dots",
                3:"off",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.voterIcons = data.value
            // CONFIGURE
            self.configure()
            model.draw()
        };
        self.configure = function() {
            model.voterIcons = config.voterIcons
        }
        self.choose = new ButtonGroup({
            label: "Voter Icons:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.voterIcons);
        }
    }

    ui.menu.voterCenterIcons = new function () {
        var self = this
        self.list = [
            {name:"on",value:"on",realname:"on",margin:4},
            {name:"off",value:"off",realname:"off"},
        ]
        self.codebook = [ {
            field: "voterCenterIcons",
            decode: {
                0:"off",
                1:"on",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.voterCenterIcons = data.value
            // CONFIGURE
            self.configure()
            model.draw()
        };
        self.configure = function() {
            model.voterCenterIcons = config.voterCenterIcons
        }
        self.choose = new ButtonGroup({
            label: "Voter Center Icons:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.voterCenterIcons);
        }
    }


    ui.menu.candidateIcons = new function () {
        var self = this
        self.list = [
            {name:"image",value:"image",realname:"image",margin:4},
            // {name:"both",value:"both",realname:"both image and name",margin:4},
            {name:"name",value:"name",realname:"name",margin:4},
            // {name:"off",value:"off",realname:"off"},
            {name:"dots",value:"dots",realname:"dots",margin:4},
            {name:"note",value:"note",realname:"annotation",margin:0},
        ]
        self.codebook = [ {
            field: "candidateIconsSet",
            decode: {
                0:"image",
                1:"name",
                2:"dots",
                3:"note",
            }
        } ]
        var decoder = ["image","name","dots"] // be careful to only add to the end of this list
        var encoder = _simpleMakeEncode(decoder)
        self.onChoose = function(data){
            // LOAD
            // config.candidateIcons = loadDec(encoder,data,config.candidateIcons)
            config.candidateIconsSet = loadSet(config.candidateIconsSet, data)

            // config.candidateIcons = data.value
            // CONFIGURE
            self.configure()
                
            for (var i=0; i<model.candidates.length; i++) {
                model.candidates[i].init()
            }
            model.initMODEL()
            model.draw()
        };
        self.configure = function() {
            // model.candidateIconsSet = decodeDec(decoder,config.candidateIcons)
            model.candidateIconsSet = config.candidateIconsSet
        }
        self.choose = new ButtonGroup({
            label: "Candidate Icons:", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        });
        self.select = function() {
            // var d = decodeDec(decoder,config.candidateIcons)
            var d = config.candidateIconsSet
            self.choose.highlight("value", d);
        }
    }

    function loadSet(featurelist, data) {
        // e.g. var xlist = ["choose_pixel_size","yeefilter"]
        var featureset = new Set(featurelist)
        if (data.isOn) {
            featureset.add(data.value)
        } else {
            featureset.delete(data.value)
        }
        return Array.from(featureset)
    }  

    // Went back to more normal config setting for candidate set, 
    // but kept the old code there just in case.  
    // I had been encoding the combination of settings as a decimal number, 
    // but it was too likely to break in the future.
    var loadDec = function(encoder, data, a) {
        var b = _decStringToBinaryString(a)
        // pad with 0's
        var b = b.padStart(Object.keys(encoder).length, '0')
        var c = loadBinary(encoder, data, b)
        var d = _binStringToDecString(c)        
        return d
    }
    var decodeDec = function(decoder, a) {
        var b = _decStringToBinaryString(a)
        // pad with 0's
        var b = b.padStart(decoder.length, '0')
        var c = decodeBinary(decoder, b)          
        return c 
    }
                

    var loadBinary = function(encoder, data, a) {
                
        //  example config.candidateIcons is 110
        var b = _stringToArray(a)
        // b is [1,1,0]
        // which index to set?
        var c = data.value
        var d = encoder[c]
        // d is the index to set
        // what to set to?
        e = (data.isOn) ? 1 : 0
        b[d] = e
        // great!
        // now save the config
        var f = _arrayToString(b)
        return f
    }
    var decodeBinary = function(decoder, a) {
        var b = _stringToArray(a)
        // lets decode each element to a new array
        var c = []
        for (var [d,e] of Object.entries(b)) {
            if (e == 1) {
                // add the decoded value to the list
                c.push(decoder[d])
            }
        }
        return c
    }
    function _stringToArray(string) {
        return string.split("")
    }
    function _arrayToString(array) {
        return array.join("")
    }
    function _decStringToBinaryString(dec) {
        return parseInt(dec).toString(2)
    }
    function _binStringToDecString(bin) {
        return parseInt( bin, 2 )
    }


    
    ui.menu.pairwiseMinimaps = new function () {
        var self = this
        self.list = [
            // {name:"auto",value:"auto",margin:4},
            {name:"auto",value:"auto",margin:4},
            {name:"off",value:"off"},
        ]
        self.codebook = [ {
            field: "pairwiseMinimaps",
            decode: {
                0:"off",
                1:"on",
                2:"auto",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.pairwiseMinimaps = data.value
            // CONFIGURE
            self.configure()
            // INIT
            model.update() // must re-run election
        };
        self.configure = function() {
            model.pairwiseMinimaps = config.pairwiseMinimaps
        }
        self.choose = new ButtonGroup({
            label: "Show Pairwise Minimaps?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.pairwiseMinimaps);
        }
    }

    
    ui.menu.doTextBallots = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false}
        ]
        self.codebook = [ {
            field: "doTextBallots",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doTextBallots = data.value
            // CONFIGURE
            self.configure()
            // INIT AND UPDATE
            model.update()
        };
        self.configure = function() {
            showMenuItemsIf("divDoTextBallots", config.doTextBallots)
            model.doTextBallots = config.doTextBallots
        }
        self.select = function() {
            self.choose.highlight("value", config.doTextBallots);
        }
        self.choose = new ButtonGroup({
            label: "Text Ballot Input?",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    
    ui.menu.textBallotInput = new function () {
        var self = this
        self.onChoose = function(){
            // LOAD
            config.textBallotInput = self.choose.dom.value
            // CONFIGURE
            self.configure()
        };
        self.codebook = [ {
            field: "textBallotInput",
            decode: {
                0:"",
            }
        } ]
        self.configure = function() {
            model.textBallotInput = config.textBallotInput
        }
        self.select = function() {
            self.choose.dom.value = config.textBallotInput
        }
        self.choose = {
            dom: document.createElement("textarea")
        }
        self.choose.dom.addEventListener("input",self.onChoose)
    }

    ui.menu.submitTextBallots = new function () {
        var self = this
        self.list = [
            {name:"Submit"}
        ]
        self.onChoose = function(){
            // INIT AND UPDATE
            model.update()
        };
        self.choose = new ButtonGroup({
            label: "",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose,
            justButton: true
        });
    }
    

    ui.menu.behavior = new function () {
        var self = this
        self.list = [
            {name:"stand",value:"stand",realname:"stand still",margin:4},
            {name:"bounce",value:"bounce",realname:"run and bounce off the walls",margin:4},
            {name:"buzz",value:"buzz",realname:"buzz around randomly",margin:4},
            {name:"goal",value:"goal",realname:"seek the goal, try to win, using perfect information",margin:0},
        ]
        self.codebook = [ {
            field: "behavior",
            decode: {
                0:"stand",
                1:"bounce",
                2:"buzz",
                3:"goal",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.behavior = data.value
            // CONFIGURE
            self.configure()
            // INIT AND UPDATE
            model.update()
        };
        self.configure = function() {
            model.behavior = config.behavior
            if (config.behavior != "stand") {
                model.doBuzz = true
                model.buzzInterval = setInterval(function(){
                    if (model.doBuzz) {
                        model.buzz()
                        model.update()
                    }
                },60)
            } else {
                model.doBuzz = false
                clearInterval(model.buzzInterval)
            }
        }
        self.select = function() {
            self.choose.highlight("value", config.behavior);
        }
        self.choose = new ButtonGroup({
            label: "Candidate behavior over time:",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    ui.menu.switcher = new function () {
        var self = this
        self.list = [
            {name:"sandbox",value:"sandbox",realname:"sandbox",margin:4},
            {name:"ballot",value:"ballot",realname:"ballot",margin:4},
            {name:"election",value:"election",realname:"election",margin:4},
            {name:"election-ballot",value:"election-ballot",realname:"election-ballot",margin:0},
        ]
        // self.codebook = [ {
        //     field: "",
        //     decode: {
        //         0:"sandbox",
        //         1:"ballot",
        //     }
        // } ]
        self.onChoose = function(data){
            // LOAD & CONFIGURE
            if(ui.uiType != data.value || 1) {
                ui.uiType = data.value
                ui.switchedUI = true
                // send the config over to the new ui
                ui.updateConfig()
                ui.preset.config = config
                ui.preset.presetName = "switch"
                // I guess the config will stay the same...
                // UPDATE
                model.update()
            }
        };
        self.configure = function() {
        }
        self.select = function() {
            self.choose.highlight("value", ui.uiType);
        }
        self.choose = new ButtonGroup({
            label: "Switch UI",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
    }

    
    ui.menu.showToolbar = new function () {
        var self = this
        self.list = [
            {name:"on",value:"on",realname:"on",margin:4},
            {name:"off",value:"off",realname:"off"},
        ]
        self.codebook = [ {
            field: "showToolbar",
            decode: {
                0:"off",
                1:"on",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.showToolbar = data.value
            // CONFIGURE
            self.configure()
            model.initMODEL()
            model.draw()
        };
        self.configure = function() {
            model.showToolbar = config.showToolbar
        }
        self.choose = new ButtonGroup({
            label: "Show Toolbar?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.showToolbar);
        }
    }

    ui.menu.rankedVizBoundary = new function () {
        var self = this
        self.list = [
            {name:"atWinner",value:"atWinner",margin:4},
            {name:"atMidpoint",value:"atMidpoint",margin:0},
            {name:"atLoser",value:"atLoser",margin:4},
            {name:"beforeWinner",value:"beforeWinner",margin:0},
        ]
        self.codebook = [ {
            field: "rankedVizBoundary",
            decode: {
                0:"atLoser",
                1:"atMidpoint",
                2:"atWinner",
                3:"beforeWinner",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.rankedVizBoundary = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            if (model.doVoterMapGPU) {
                model.update()
            } else {
                model.draw()
            }
        };
        self.configure = function() {
            model.rankedVizBoundary = config.rankedVizBoundary
        }
        self.choose = new ButtonGroup({
            label: "Boundaries for Ranked Viz", // Sub Menu
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.rankedVizBoundary);
        }
    }

    ui.menu.useBeatMapForRankedBallotViz = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false,margin:4},
        ]
        self.codebook = [ {
            field: "useBeatMapForRankedBallotViz",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.useBeatMapForRankedBallotViz = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.useBeatMapForRankedBallotViz = config.useBeatMapForRankedBallotViz
        }
        self.choose = new ButtonGroup({
            label: "Use Beat Map for Ranked Viz", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.useBeatMapForRankedBallotViz);
        }
    }

    ui.menu.doMedianDistViz = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false,margin:4},
        ]
        self.codebook = [ {
            field: "doMedianDistViz",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doMedianDistViz = data.value
            // CONFIGURE
            self.configure()
            // UPDATE
            model.draw()
        };
        self.configure = function() {
            model.doMedianDistViz = config.doMedianDistViz
        }
        self.choose = new ButtonGroup({
            label: "Show Special Median Viz",
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.doMedianDistViz);
        }
    }

    ui.menu.showDescription = new function () {
        var self = this
        self.list = [
            {name:"on",value:"on",realname:"on",margin:4},
            {name:"off",value:"off",realname:"off"},
        ]
        self.onChoose = function(data){
            // LOAD
            var show = data.value
            config.sandboxsave = (show == "on")
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {
            ui.arena.desc.configure()
        }
        self.choose = new ButtonGroup({
            label: "Show Description?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            if (config.sandboxsave) {
                var show = "on"
            } else {
                var show = "off"
            }
            self.choose.highlight("value", show);
        }
    }

    ui.menu.doElectabilityPolls = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false}
        ]
        self.codebook = [ {
            field: "doElectabilityPolls",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doElectabilityPolls = data.value
            // CONFIGURE
            self.configure()
            // INIT AND UPDATE
            model.update()
        };
        self.configure = function() {
            model.doElectabilityPolls = config.doElectabilityPolls
        }
        self.choose = new ButtonGroup({
            label: "Do electability Polls?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.doElectabilityPolls);
        }
    }

    ui.menu.partyRule = new function () {
        var self = this
        self.list = [
            {name:"crowd",value:"crowd",margin:4},
            {name:"left-right",value:"leftright",margin:0},
        ]
        self.codebook = [ {
            field: "partyRule",
            decode: {
                0:"crowd",
                1:"leftright",
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.partyRule = data.value
            // CONFIGURE
            self.configure()
            // INIT AND UPDATE
            model.dm.redistrict()
            model.update()
        };
        self.configure = function() {
            model.partyRule = config.partyRule
        }
        self.choose = new ButtonGroup({
            label: "How do we register parties?", // Sub Menu
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.partyRule);
        }
    }

    ui.menu.doFilterSystems = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false}
        ]
        self.codebook = [ {
            field: "doFilterSystems",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doFilterSystems = data.value
            // CONFIGURE
            self.configure()
            ui.showHideSystems()
        };
        self.configure = function() {
            return
        }
        self.choose = new ButtonGroup({
            label: "Filter Voting Systems?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.doFilterSystems);
        }
    }
    
    ui.menu.filterSystems = new function() { 	
        var self = this
        self.list = ui.menu.systems.list
        for (var entry of self.list) entry.margin = 2

        self.codebook = ui.menu.systems.systemsCodebook
        self.onChoose = function(data){
            // LOAD CONFIG //
            modifyConfigFilterSystems(config,data.isOn, [data.value])
            // CONFIGURE
            self.configure()
            ui.showHideSystems()
        };
        self.configure = function() {
            return
        }
        self.select = function() {
            self.choose.highlight("value", config.filterSystems);
        }
        self.choose = new ButtonGroup({
            label: "Systems to Keep:",
            width: bw(2),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        });
    }

    ui.showHideSystems = function() {

        // categories for systems
        
        includeIf = {
            choice: [
                "FPTP",
                "+Primary",
                "Top Two",
                "IRV",
                "STV",
                "Create",
            ],
            pair: [
                "Minimax",
                "Schulze",
                "RankedPair",
                "Condorcet",
                "STAR",
                "3-2-1",
                "RBVote",
                "QuotaMinimax",
                "Create",
            ],
            score: [
                "Approval",
                "Score",
                "Borda",
                "STAR",
                "3-2-1",
                "RRV",
                "RAV",
                "QuotaApproval",
                "QuotaScore",
                "PhragmenMax",
                "equalFacilityLocation",
                "Create",
            ]
        }
        includeOnlyIf = {
            multi: [
                "RRV",
                "RAV",
                "STV",
                "QuotaApproval",
                "QuotaMinimax",
                "QuotaScore",
                "PhragmenMax",
                "equalFacilityLocation",
            ],
            dev: [
                "QuotaApproval",
                "QuotaMinimax",
                "QuotaScore",
                "PhragmenMax",
                "equalFacilityLocation",
                "Create",
            ]
        }

        // just for reference
        all = [
            "FPTP",
            "+Primary",
            "Top Two",
            "RBVote",
            "IRV",
            "Borda",
            "Minimax",
            "Schulze",
            "RankedPair",
            "Condorcet",
            "STAR",
            "3-2-1",
            "Approval",
            "Score",
            "STAR",
            "3-2-1",
            "RRV",
            "RAV",
            "STV",
            "QuotaApproval",
            "QuotaMinimax",
            "QuotaScore",
            "PhragmenMax",
            "equalFacilityLocation",
            "Create",
        ]
        
        // helper
        var getDom = x => ui.menu.systems.choose.buttonDOMByValue[x]

        // default: hide all
        for (var entry of ui.menu.filterSystems.list) {
            var dom = getDom(entry.value)
            dom.hidden = true
        }

        // show if
        for (let catName in includeIf) {
            // is the button selected?
            if (config.includeSystems.includes(catName)) {
                // show all systems in category
                let systems = includeIf[catName]
                for(let sys of systems) {
                    let dom = getDom(sys)
                    dom.hidden = false
                }
            }
        }

        // show only if
        for (let catName in includeOnlyIf) {
            // is the button NOT selecte?
            if (! config.includeSystems.includes(catName)) {
                // hide all systems in category
                let systems = includeOnlyIf[catName]
                for(let sys of systems) {
                    let dom = getDom(sys)
                    dom.hidden = true
                }
            }
        }

        // PART 2

        // hide individual systems
        for (var entry of ui.menu.filterSystems.list) {
            var dom = getDom(entry.value)
            var show = !config.doFilterSystems || config.filterSystems.includes(entry.value)
            if( show) {
                continue
            } else {
                dom.hidden = true
            }
        }


    }

    ui.menu.doFilterStrategy = new function () { // this is actually the old way of doing things... it doesn't do anything anymore
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false}
        ]
        self.codebook = [ {
            field: "doFilterStrategy",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.doFilterStrategy = data.value
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {
            return
        }
        self.choose = new ButtonGroup({
            label: "Filter Voting Strategies by System?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.doFilterStrategy);
        }
    }
    

    
    ui.menu.includeSystems = new function () {
        var self = this
        self.list = [
            {name:'<span class="smaller">choice</span>',value:"choice",realname:"choice",margin:4},
            {name:"pair",value:"pair",margin:4},
            {name:"score",value:"score",margin:4},
            {name:"multi",value:"multi",margin:4},
            {name:"dev",value:"dev"}
        ]
        self.codebook = [ {
            field: "includeSystems",
            decode: {
                0:"choice",
                1:"pair",
                2:"score",
                3:"multi",
                4:"dev",
            }
        } ]
        self.onChoose = function(data){
            // LOAD CONFIG //
            config.includeSystems = modifyArrayAsSet(config.includeSystems,data.isOn, [data.value])
            // CONFIGURE
            self.configure()
            ui.showHideSystems()
        };
        self.configure = function() {
            return
        }
        self.choose = new ButtonGroup({
            label: "Voting systems by type:", // Sub Menu
            width: bw(5),
            data: self.list,
            onChoose: self.onChoose,
            isCheckbox: true
        });
        self.select = function() {
            self.choose.highlight("value", config.includeSystems);
        }
    }

    ui.menu.putMenuAbove = new function () {
        var self = this
        self.list = [
            {name:"Yes",value:true,margin:4},
            {name:"No",value:false}
        ]
        self.codebook = [ {
            field: "putMenuAbove",
            decode: {
                0:false,
                1:true,
            }
        } ]
        self.onChoose = function(data){
            // LOAD
            config.putMenuAbove = data.value
            // CONFIGURE
            self.configure()
        };
        self.configure = function() {
            _hideOrShowFeatures()
        }
        self.choose = new ButtonGroup({
            label: "Put menu above arena?", // Sub Menu
            width: bw(4),
            data: self.list,
            onChoose: self.onChoose
        });
        self.select = function() {
            self.choose.highlight("value", config.putMenuAbove);
        }
    }

    
    // helper
    function showMenuItemsIf(name,condition) {
        // show or hide all menu items with the given name

        var hideIt = ! (condition === true)

        for (var m of [ ui.m1, ui.m2 ]) { // both menus
            var divs = m.menuNameDivs[name]
            if (divs == undefined) continue
            for (var div of divs) { // all divs
                div.hidden = hideIt
            }
        }
    }

}

function createMenu(ui) {

    // run this after loading the whole menu
    ui.menu.gearconfig.initSpecial()

    // rebuild menu

    // function to make menu items visible/hidden

    // but there are some submenus that are dependent on selections from other menus,
    // so we need to run the choose operations for those menu items
    // well, visibility is hard to compute.   There are a series of checks that must all be positive.
    // There is a list of checks.  Each triggering menu item needs to add a check to the list.
    // Or, otoh, a tree would be simpler.  Each menu item sets the visibility flag on a visibility tree.
    // Updating the menu consists of traversing the tree and checking visibility at each node.
    // Decide whether to go to subnodes.
    // Some menu items, like "advanced", affect multiple nodes belonging to the advanced class.


    // Put all in order


    // In version 1, I had a single list, featurelist, that would be controlled by many buttons.
    // In version 2, I skip the featurelist and control the divs directly from the buttons.
    // That means version 2 has 
    // CONFIGURE is the right step to control the divs
    // I also have a leftover menu where I can add another control to the divs.  So I'm going to put two divs,
    // which is kind of redundant but works.




    /////////////////
    // BUILD MENUS //
    /////////////////


    menu1 = [
        ["gearicon", [
            "gearicon",
        ]],
        [ "gearList", [
            "menuVersion",
            "doFeatureFilter",
            "gearconfig", // start of hidden list
            "presetconfig",
            "computeMethod",
            "colorChooser",
            "colorSpace",
            "spread_factor_voters",
            "arena_size",
            "median_mean",
            "utility_shape",
            "votersAsCandidates",
            "partyRule",
            "ballotVis",
            "visSingleBallotsOnly",
            "rankedVizBoundary",
            "useBeatMapForRankedBallotViz",
            "doMedianDistViz",
            "sidebarOn",
            ["divLastTransfer", [
                "lastTransfer",
            ]],
            ["divPairwiseMinimaps", [
                "pairwiseMinimaps",
            ]],
            "voterIcons",
            "voterCenterIcons",
            "candidateIcons",
            "showToolbar",
            "showDescription",
            "switcher",
            "gearoff",
            "doFilterSystems",
            "filterSystems" ,
            "putMenuAbove",
            "centerPollThreshold",
        ]],
        [ "main", [
            "includeSystems",
            "systems", // start of normal list
            [ "divRBVote", [
                "rbSystems",
            ]],
            [ "divCreate", [
                "loadCode",
                "createStrategyType",
                "createBallotType",
            ]],
            "dimensions",
            "nDistricts",
            ["divSeats", [
                "seats",
            ]],
            "nVoterGroups",
            [ "divXVoterGroups", [
                "xVoterGroups",
                "group_count",
                "group_spread",
            ]],
            "nCandidates",
            "theme",
            "customNames",
            ["divCustomNames", [
                "namelist",
            ]],
            ["divDoElectabilityPolls", [
                "doElectabilityPolls",
            ]],
            [ "divChoiceFirstStrategy", [
                "choiceFirstStrategy",
            ]],
            [ "divPairFirstStrategy", [
                "pairFirstStrategy",
            ]],
                [ "divScoreFirstStrategy", [
                "scoreFirstStrategy",
            ]],
            "doTwoStrategies",
            [ "divSecondStrategy", [
                [ "divChoiceSecondStrategy", [
                    "choiceSecondStrategy",
                ]],
                [ "divPairSecondStrategy", [
                    "pairSecondStrategy",
                ]],
                    [ "divScoreSecondStrategy", [
                    "scoreSecondStrategy",
                ]],
                "percentSecondStrategy",
            ]],
            // "primaries", // not doing this one, comment out
            [ "divPoll", [
                "autoPoll",
                [ "divManualPoll", [
                    "frontrunners",
                    "poll",
                ]],
            ]],
            "yeeon",
            ["divWinMap", [
                "yee",
                ["divYee", [
                    "yeefilter" ,
                    "choose_pixel_size"
                ]],
            ]],
            "beatMap",
            "ballotConcept",
            "roundChart",
            "showPowerChart",
            "behavior",
            "doTextBallots",
            ["divDoTextBallots", [
                "textBallotInput",
                "submitTextBallots",
            ]],
        ]],
        [ "hidden", [ // hidden menu - for things that don't fit into the other spots
            "stepMenu",
            "menuLevel",
            "spacer",
        ]],
        ["obsolete", [
            "doFilterStrategy",
        ]],
    ]


    // organize into submenus

    menu2 = [
        ["topmenu", [
            "stepMenu",
            "menuLevel",
            "spacer",
        ]],
        [ "submenu", [
            [ "geom", [
                [ "normal", [
                    "dimensions",
                    "nDistricts",
                    "nVoterGroups",
                    [ "divXVoterGroups", [
                        "xVoterGroups",
                        "group_count",
                        "group_spread",
                    ]],
                    "nCandidates",
                ]],
                [ "advanced", [
                    "spread_factor_voters",
                    "arena_size",
                    "median_mean",
                    "utility_shape",
                    "votersAsCandidates",
                    "partyRule",
                ]],
            ]],
            ["style", [
                ["normal", [
                    "theme",
                    "customNames",
                    ["divCustomNames", [
                        "namelist",
                    ]],
                    "candidateIcons",
                    "voterIcons",
                ]],
                ["advanced", [
                    "voterCenterIcons",
                    "colorChooser",
                    "colorSpace",
                    "behavior",
                ]],
            ]],
            ["vote", [
                ["normal", [
                    "includeSystems",
                    "systems",
                    [ "divRBVote", [
                        "rbSystems",
                    ]],
                    [ "divCreate", [
                        "loadCode",
                        "createStrategyType",
                        "createBallotType",
                    ]],
                    ["divSeats", [
                        "seats",
                    ]],
                    ["divDoElectabilityPolls", [
                        "doElectabilityPolls",
                    ]],
                    [ "divChoiceFirstStrategy", [
                        "choiceFirstStrategy",
                    ]],
                    [ "divPairFirstStrategy", [
                        "pairFirstStrategy",
                    ]],
                        [ "divScoreFirstStrategy", [
                        "scoreFirstStrategy",
                    ]],
                    "doTwoStrategies",
                    [ "divSecondStrategy", [
                        [ "divChoiceSecondStrategy", [
                            "choiceSecondStrategy",
                        ]],
                        [ "divPairSecondStrategy", [
                            "pairSecondStrategy",
                        ]],
                            [ "divScoreSecondStrategy", [
                            "scoreSecondStrategy",
                        ]],
                        "percentSecondStrategy",
                    ]],
                    [ "divPoll", [
                        "autoPoll",
                        [ "divManualPoll", [
                            "frontrunners",
                            "poll",
                        ]],
                    ]],
                    // "primaries", // not doing this one, comment out               
                ]],
                ["advanced", [
                    "centerPollThreshold",
                    "doTextBallots",
                    ["divDoTextBallots", [
                        "textBallotInput",
                        "submitTextBallots",
                    ]],
                    
                ]],
            ]],
            ["viz", [
                ["normal", [
                    "yeeon",
                    ["divWinMap", [
                        "yee",
                        ["divYee", [
                            "yeefilter" ,
                            "choose_pixel_size"
                        ]],
                    ]],
                    "beatMap",
                    "ballotConcept",
                    ["divLastTransfer", [
                        "lastTransfer",
                    ]],
                    ["divPairwiseMinimaps", [
                        "pairwiseMinimaps",
                    ]],
                ]],
                ["advanced", [
                    "roundChart",
                    "showPowerChart",
                    "sidebarOn",
                    "ballotVis",
                    "visSingleBallotsOnly",
                    "rankedVizBoundary",
                    "useBeatMapForRankedBallotViz",
                    "doMedianDistViz",
                ]],
            ]],
            ["ui", [
                ["normal", [
                ]],
                ["advanced", [
                    "menuVersion",
                    "doFeatureFilter",
                    "showDescription",
                    "showToolbar",
                    "gearconfig", 
                    "presetconfig",
                    "doFilterSystems",
                    "filterSystems" ,
                    "putMenuAbove",
                ]],
            ]],
            ["dev", [
                ["normal", [

                ]],
                ["advanced", [
                    "computeMethod",
                    "switcher",
                ]],
            ]],
        ]],
        ["hidden", [
            "gearoff",
            "gearicon",
        ]],
        ["obsolete", [
            "doFilterStrategy",
        ]],
    ]

    // TODO
    // basic = [
    //     "systems",
    //     "nCandidates",
    //     "nVoterGroups",
    // ]


    ui.m1 = new MenuTree(ui)
    ui.m1.assignMenu( menu1 , ui.dom.left, "basediv" )
    // detail: seems harmless, but the basediv gets reattached.
    
    ui.m1.menuNameDivs["gearList"][0].hidden = true
    ui.m1.menuNameDivs["hidden"][0].hidden = true
    ui.m1.menuNameDivs["obsolete"][0].hidden = true

    ui.m1.buildSubMenus()
    

    ui.m2 = new MenuTree(ui)
    ui.m2.assignMenu( menu2 , ui.dom.left, "basediv" )

    ui.m2.menuNameDivs["hidden"][0].hidden = true
    ui.m2.menuNameDivs["obsolete"][0].hidden = true

    

}

function MenuTree(ui) {
    var self = this

    // Loop through and collect nodes with the same name into a list
    // Later, during build, use that list to turn divs on and off

    // append all the menu dom elements to the menu


    self.menuNameDivs = {}
    // Here are all the divs that correspond to names to toggle on and off
    // list of submenu doms to turn on/off

    var ap = []
    // Here are all the attachments points for the nodes
    // Now I just need a list of the child doms for each one
    // so that later I can loop through all the attachment points and attach the children.
    // ap[i].parent: parent div
    // ap[i].children:  [array of divs to attach]
    
    self.assignMenu = function(m,parent,parentName) {
        var children = []
        var childrenNames = []
        for (var a of m) {
            if (typeof a === "string") { // child
                var div = ui.menu[a].choose.dom
                var aName = a
            } else { // parent
                var div = document.createElement("div")
                parent.appendChild(div)
                var aName = a[0]
                if (self.menuNameDivs[aName] == undefined) {
                    self.menuNameDivs[aName] = []
                }
                self.menuNameDivs[aName].push(div)
                self.assignMenu(a[1],div,aName) // recursion
            }
            children.push(div)
            childrenNames.push(aName)
        }
        ap.push({parentName:parentName,childrenNames:childrenNames,parent:parent,children:children})
    }

    // To build the menu, it's really easy, just attach the divs for the menu items to the submenu div structure
    self.buildSubMenus = function() {
        for (var a of ap) {
            for(var child of a.children) {
                a.parent.appendChild(child)
            }
        }
    }

}

function uiArena(ui,model,config,initialConfig, cConfig) {
    
    ui.arena = {}

    //////////////////////////
    //////// RESET... ////////
    //////////////////////////

    ui.arena.reset = new function() {
        var self = this
        var resetDOM = document.createElement("div");
        resetDOM.id = "reset";
        resetDOM.innerHTML = "reset";
        resetDOM.onclick = function(event){
            // special keypress to get menu back
            if (event.ctrlKey) {
                model.devOverrideShowAllFeatures = ! model.devOverrideShowAllFeatures
                ui.menu.doFeatureFilter.configure()
                return
            }
            // LOAD INITIAL CONFIG
            cConfig.reset()
            // RESET = CREATE, CONFIGURE, INIT
            model.reset()
            model.update()
            // UPDATE MENU //
            _objF(ui.menu,"select");
        };
        ui.dom.center.appendChild(resetDOM);
        self.dom = resetDOM
    }

    //////////////////////////////////
    /////// SAVE & SHARE, YO! ////////
    //////////////////////////////////

    ui.arena.desc = new function() { // Create a description up top
        var self = this
        var descDOM = document.createElement("div");
        descDOM.id = "description_container";
        var refNode = ui.dom.left;
        ui.dom.basediv.insertBefore(descDOM, refNode);
        ui.dom.descText = document.createElement("textarea");
        var descText = ui.dom.descText
        descText.id = "description_text";

        var containText = document.createElement("div");
        containText.id = "double_description_container";
        descDOM.appendChild(containText);
        containText.appendChild(descText);
		// yay.
		self.init_sandbox = function() {
			descText.value = initialConfig.description;
		}
        self.configure = function () {
            
            if (config.sandboxsave) {
                ui.dom.center.style.width = config.arena_size + model.border*2 + "px"
                descDOM.hidden = false
                descText.hidden = false
            } else {
                descDOM.hidden = true
                descText.hidden = true
            }
            if (config.theme == "Nicky") {
                descText.placeholder = "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob."
            } else {
                descText.placeholder = "[type a description for your model here.]"
            }
        }
        self.dom = descDOM
        self.text = {}
        self.text.dom = descText
    }

    ui.arena.codeEditor = new function() { // Create a description up top
        var self = this
        var codeEditorDOM = document.createElement("div");
        codeEditorDOM.id = "codeEditorText_container";
        ui.dom.basediv.appendChild(codeEditorDOM);
        ui.dom.codeEditorText = document.createElement("textarea");
        var codeEditorText = ui.dom.codeEditorText
        codeEditorText.id = "codeEditorText";

        var containText = document.createElement("div");
        containText.id = "double_codeEditorText_container";
        codeEditorDOM.appendChild(containText);
        containText.appendChild(codeEditorText);
        ui.dom.codeMirror = CodeMirror.fromTextArea(ui.dom.codeEditorText, {lineNumbers: true, mode: "javascript", autorefresh: true}) // https://stackoverflow.com/a/42619796
		// yay.
		self.init_sandbox = function() {
            ui.dom.codeMirror.setValue(initialConfig.codeEditorText)
            setTimeout( () => ui.dom.codeMirror.refresh() , 30);

            model.codeEditorText = initialConfig.codeEditorText
		}
        self.configure = function () {
            
            codeEditorText.placeholder = Election.defaultCodeScore
        }
        self.dom = codeEditorDOM
        self.text = {}
        self.text.dom = codeEditorText
    }

    ui.arena.codeSave = new function() { // Create a "save" button for code
        var self = this
        var codeSaveDOM = document.createElement("div");
        codeSaveDOM.className = "codeSave";
        codeSaveDOM.innerHTML = "Save Code";
        codeSaveDOM.onclick = function(){

            ui.arena.save.dom.onclick()

            // Open a new page in the background with the saved code and configuration            
            // window.open(ui.arena.save.link, '_blank');
            // window.focus();

            // rerun the election
            model.codeEditorText = config.codeEditorText
            model.update()
            
        };
        ui.dom.basediv.appendChild(codeSaveDOM);
        self.dom = codeSaveDOM
    }

    ui.updateConfig = function() {
        // UPDATE CONFIG //
        var pos = savePositions()  // saves the candidate and voter positions in the config.
        for (i in pos) config[i] = pos[i]  // for some weird reason config doesn't have the correct positions, hope i'm not introducing a bug
        // Description
        config.description = ui.dom.descText.value || "";
        config.codeEditorText = ui.dom.codeMirror.getValue() || "";
    }

    ui.arena.save = new function() { // Create a "save" button
        var self = this
        self.dom = document.createElement("div");
        self.dom.id = "save";
        self.dom.innerHTML = "save:";
        self.dom.onclick = function(){
            // UPDATE CONFIG //
            // config.sandboxsave = true // this seems to fix a bug
            ui.updateConfig()
            // UPDATE MAIN //
            newURLs = cConfig.save()
            
            var doTinyURL = true
            if (doTinyURL) {
                var goTiny='https://tinyurl.com/create.php?url='+encodeURIComponent(newURLs.link)
                tinyLink.setAttribute("href",goTiny)
                tinyLink.innerHTML = `TinyURL<img src="play/img/external_link.svg">`
                embedLink.innerHTML = "&lt;embed&gt;";
            }
            
            self.link = newURLs.link
            self.shortCode = newURLs.shortCode
            self.shortLink = newURLs.shortLink

            ui.dom.linkText.value = "saving...";
            setTimeout(function(){
                ui.dom.linkText.value = newURLs.linkText;
            },750);

            ui.arena.shortLink.dom.hidden = true
            // ui.arena.saveShortLink.dom.hidden = false
            _displayNoneIf(ui.arena.saveShortLink.dom,false)

            ui.arena.shortLink.dom.value = "saving...";
            setTimeout(function(){
                ui.arena.shortLink.dom.value = newURLs.shortLink;
            },750);

        };
        ui.dom.center.appendChild(self.dom);
    }


    ui.arena.linkText = new function() { // The share link textbox
        var self = this
        ui.dom.linkText = document.createElement("input");
        var linkText = ui.dom.linkText
        linkText.id = "savelink";
        linkText.placeholder = "[when you save your model, a link you can copy will show up here]";
        linkText.setAttribute("readonly", true);
        linkText.onclick = function(){
            linkText.select();
        };
        ui.dom.center.appendChild(linkText);
        self.dom = linkText
    }

    var tinyLink = document.createElement("a")
    ui.dom.center.appendChild(tinyLink)
    tinyLink.setAttribute("target", "_blank")
    tinyLink.setAttribute("class", "tinyURL")

    var embedLink = document.createElement("span")
    ui.dom.center.appendChild(embedLink)
    embedLink.setAttribute("class", "tinyURL")
    embedLink.setAttribute("style", "text-decoration: underline;")
    embedLink.onclick = function(){
        ui.embed = ! ui.embed
        ui.arena.save.dom.onclick()
    }

    var shortLinkDatabaseUrl = 'https://script.google.com/macros/s/AKfycbzMf0eb8jFTPnM7X83RIZwYN783E-xKt0M6RmgI-0AO2yf8BKb3/exec'
    ui.arena.saveShortLink = new function() { // Create a "save" button
        var self = this
        self.dom = document.createElement("div");
        self.dom.id = "save"; // todo: make into className
        self.dom.innerHTML = "publish:";
        // self.dom.hidden = true
        _displayNoneIf(self.dom,true)
        self.dom.onclick = function(e){

            ui.arena.save.dom.onclick()

            ui.arena.shortLink.dom.hidden = false

            e.preventDefault();
    
            _ajax.get(shortLinkDatabaseUrl, {shortcode: ui.arena.save.shortCode, link: ui.arena.save.link}, function(res) {
                
                // extra stuff to handle errors

                if (res != '') {
                    var resObj = JSON.parse(res)    
                    if (resObj.result == "success") {
                        return // silent
                    }
                }
                window.alert("Bad. The link didn't publish. The short link won't work.")
                ui.arena.shortLink.dom.hidden = true
                return // alert
            })
        }
        ui.dom.center.appendChild(self.dom);
    }

    ui.arena.shortLink = new function() { // The share link textbox
        var self = this
        self.dom = document.createElement("input");
        self.dom.hidden = true
        self.dom.id = "savelink"; // todo: change to className
        self.dom.placeholder = "[when you save your model, a link you can copy will show up here]";
        self.dom.setAttribute("readonly", true);
        self.dom.onclick = function(){
            self.dom.select();
        };
        ui.dom.center.appendChild(self.dom);
    }

    // additional codebooks
    ui.extraCodeBook = [
        {
            decode:{
                0:"",
                1:"[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
            },
            field: "description"
        },
        {
            decode:{
                0:"",
                1:Election.defaultCodeScore,
            },
            field: "codeEditorText"
        },
        {
            field: "hidegearconfig",
            decode:{
                0:false,
                1:true,
            },
        },
        {
            field: "sandboxsave",
            decode:{
                0:false,
                1:true,
            },
        }
    ]

    ///////////////////////////
    ////// SAVE POSITION //////
    ///////////////////////////

    var savePositions = function(log){ 
        // The positions of voters and candidates are not held in config.
        // So, we need to save them occasionally.

        // Candidate positions
        var positions = [];
        var serials = [];
        var b = []
        for(var i=0; i<model.candidates.length; i++){
            var candidate = model.candidates[i];
            positions.push([
                Math.round(candidate.x),
                Math.round(candidate.y)
            ]);
            serials.push(candidate.serial)
            b.push(candidate.b)
        }
        if(log) console.log("candidatePositions: "+JSON.stringify(positions));
        var candidatePositions = positions;

        // Voter positions
        positions = [];
        vTypes = []
        x = []
        snowman = []
        disk = []
        crowdShape = []
        group_count_vert = []
        group_count_h = []
        // voter types are varied in style
        for(var i=0; i<model.voterGroups.length; i++){
            var voter = model.voterGroups[i];
            positions.push([
                Math.round(voter.x),
                Math.round(voter.y)
            ]);
            vTypes.push(voter.voterGroupType)
            x.push(voter.x_voters)
            snowman.push(voter.snowman)
            disk.push(voter.disk)
            crowdShape.push(voter.crowdShape)
            group_count_vert.push(voter.group_count_vert)
            group_count_h.push(voter.group_count_h)
        }
        if(log) console.log("voterPositions: "+JSON.stringify(positions));
        var voterPositions = positions;

        // positions!
        return {
            candidatePositions: candidatePositions,
            voterPositions: voterPositions,
            candidateSerials: serials,
            candidateB: b,
            voterGroupTypes: vTypes,
            voterGroupX: x,
            voterGroupSnowman: snowman,
            voterGroupDisk: disk,
            crowdShape: crowdShape,
            group_count_vert:group_count_vert,
            group_count_h:group_count_h,
        };

    };

    
}

sandbox.assets = [
    
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

// helpers

function modifyConfigFeaturelist(config, condition, xlist) {
    // e.g. var xlist = ["choose_pixel_size","yeefilter"]
    var featureset = new Set(config.featurelist)
    for (var i in xlist){
        var xi = xlist[i]
        if (condition) {
            featureset.add(xi)
        } else {
            featureset.delete(xi)
        }
    }
    config.featurelist = Array.from(featureset)
}    

function modifyConfigFilterSystems(config, condition, xlist) {
    // e.g. var xlist = ["FPTP","IRV"]
    var filterSet = new Set(config.filterSystems)
    for (var i in xlist){
        var xi = xlist[i]
        if (condition) {
            filterSet.add(xi)
        } else {
            filterSet.delete(xi)
        }
    }
    config.filterSystems = Array.from(filterSet)
}    

function modifyArrayAsSet(a, condition, xlist) {
    // e.g. var xlist = ["FPTP","IRV"]
    var s = new Set(a)
    for (var i in xlist){
        var xi = xlist[i]
        if (condition) {
            s.add(xi)
        } else {
            s.delete(xi)
        }
    }
    return Array.from(s)
}    

function _simpleMakeEncode(decode) {
    var encode = {}
    for (var [i,v] of Object.entries(decode)) {
        // var value = JSON.stringify(v)
        i = Number(i)
        encode[v] = i
    }
    return encode
}

