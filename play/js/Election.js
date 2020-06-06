/****************************

SINGLETON CLASS on how to COUNT UP THE BALLOTS
and RENDER IT INTO THE CAPTION

*****************************/

var Election = {};


Election.score = function(district, model, options){

	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"score")

	// Tally the approvals & get winner!
	var tally = _tally(district,model, function(tally, ballot){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	});


	var maxscore = 5

	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (options.sidebar) {

		// Caption
		var winner = winners[0];
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>score as % of max possible: </b><br>";
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += model.icon(c)+"'s score: "+_percentFormat(district, tally[c] / maxscore)+"<br>";
		}
		if(!winner | winners.length>=2){
			// NO WINNER?! OR TIE?!?!
			text += _tietext(model,winners);
			// text = "<b>TIE</b> <br> <br>" + text;
		} else {
			text += "<br>";
			text += model.icon(winner)+" has the highest score, so...<br>";
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
		}

		result.text = text;
	}
	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	return result;
};

Election.star = function(district, model, options){

	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"score")


	var maxscore = 5

	// Tally the approvals & get winner!
	var tally = _tally(district,model, function(tally, ballot){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	});
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})

	var ballots = model.voterSet.getBallotsDistrict(district)
	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[frontrunners[0]]>ballot[frontrunners[1]]){
			aWins++; // a wins!
		} else if(ballot[frontrunners[0]]<ballot[frontrunners[1]]){
			bWins++; // b wins!
		}
	}

	if (bWins > aWins) {
		var winners = [frontrunners[1]]
	} else if (aWins > bWins) {
		var winners = [frontrunners[0]]
	} else {
		var winners = frontrunners // tie
	}
	var result = _result(winners,model)
	var color = result.color


	if (model.doTop2) var theTop2 = frontrunners.slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result

	// NO WINNER?! OR TIE?!?!
	if(winners.length > 1){

		var text = "<b>TIE</b>";
		result.text = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>pairwise winner of two highest average scores wins</b><br>";
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += model.icon(c)+":"+_percentFormat(district, tally[c] / maxscore)+"<br>";
		}
		if (frontrunners.length >= 2) {
			text += "<br>";
			text += "<b>Final Round between the top two:<br></b>";
			text += model.icon(frontrunners[0])+_percentFormat(district, aWins)+". "+model.icon(frontrunners[1]) +_percentFormat(district, bWins) + "<br>";
			text += "</span>";
		}
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS <br> <br>" + text;
		result.text = text;

	}

	return result;
};

Election.three21 = function(district, model, options){

	var ballots = model.voterSet.getBallotsDistrict(district)

	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"score")
	
	// Tally the approvals & get winner!
	var tallies = _tallies(district, model, 3);

	var semifinalists = [];

	for (var i in model.candidatesById) {
	   semifinalists.push(i);
	}
	semifinalists.sort(function(a,b){return tallies[2][b]-tallies[2][a]})

	var finalists = semifinalists.slice(0,3);
	finalists.sort(function(a,b){return tallies[0][a]-tallies[0][b]})

	var ballots = model.voterSet.getBallotsDistrict(district)
	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[finalists[0]]>ballot[finalists[1]]){
			aWins++; // a wins!
		} else if(ballot[finalists[0]]<ballot[finalists[1]]){
			bWins++; // b wins!
		}
	}


	if (bWins > aWins) {
		var winners = [finalists[1]]
	} else if (aWins > bWins) {
		var winners = [finalists[0]]
	} else {
		var winners = finalists // tie
	}
	var result = _result(winners,model)
	var color = result.color
	
	if (model.doTop2) var theTop2 = finalists.slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result

	// NO WINNER?! OR TIE?!?!
	if(winners.length > 1){

		var text = "<b>TIE</b>";
		result.text = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>Semifinalists: 3 most good. Finalists: 2 least bad. Winner: more preferred.</b><br>";
		text += "<b>Semifinalists:</b><br>";
		for(var i=0; i<semifinalists.length; i++){
			var c = semifinalists[i];
			text += model.icon(c)+"'s 'good': "+ _percentFormat(district, tallies[2][c]) +"<br>";
			
		}
		text += "<b>Finalists:</b><br>";
		for(var i=0; i<finalists.length; i++){
			var c = finalists[i];
			text += model.icon(c)+"'s 'bad': "+_percentFormat(district, tallies[0][c])+"<br>";
		}
		text += "<b>Winner:</b><br>";

		text += model.icon(finalists[0])+": "+_percentFormat(district, aWins)+"; "+model.icon(finalists[1]) +": "+_percentFormat(district, bWins)+", so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS <br> <br>" + text;
		result.text = text;

	}

	return result;
};

Election.approval = function(district, model, options){

	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"approval")

	// Tally the approvals & get winner!
	var tally = _tally(district,model, function(tally, ballot){
		var approved = ballot.approved;
		for(var i=0; i<approved.length; i++) tally[approved[i]]++;
	});

	var winners = _countWinner(tally);

	var result = _result(winners,model)
	var color = result.color

	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	

	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>most approvals wins (%)</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
	}
	if(!winner | winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		text += "<br>";
		text += model.icon(winner)+" is most approved, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	}
	result.text = text;
	return result;
};

Election.condorcet = function(district, model, options){

	var text = "";
	text += "<span class='small'>";
	text += "<b>who wins each one-on-one?</b><br>";

	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the WIN tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	var beatsMe = {}
	for(var candidateID in model.candidatesById) beatsMe[candidateID] = []


	// For each combination... who's the better ranking?
	for(var i=0; i<district.candidates.length-1; i++){
		var a = district.candidates[i];
		for(var j=i+1; j<district.candidates.length; j++){
			var b = district.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins<=bWins) ? a : b;
			if (aWins != bWins) {
				tally[winner.id]++;
				beatsMe[loser.id].push(winner.id)
				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
				}else{
					by = bWins;
					to = aWins;
				}
				text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins, "+_percentFormat(district, by)+" to "+_percentFormat(district, to)+"<br>";
			} else { //tie
				beatsMe[a.id].push(b.id)
				beatsMe[b.id].push(a.id)
				tally[a.id]++;
				tally[b.id]++;
				text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==district.candidates.length-1){
			topWinners.push(id);
		}
	}

	if (topWinners.length != 1) {
		// ties

		// sort list
		var idSorted = Object.keys(tally).sort(function(x,y) {return -tally[x]+tally[y]}) // reverse?
		var indexOfId = {}
		for (var i = 0; i < idSorted.length; i++) indexOfId[idSorted[i]] = i
		var divider = 1
		for (var i = 0; i < divider; i++) {
			var b = beatsMe[idSorted[i]]
			for (var j = 0; j < b.length; j++) {
				divider = Math.max(divider, indexOfId[b[j]] + 1)
			}
		}
		topWinners = idSorted.slice(0,divider)
	}
	// probably it would be better to find the smith set but this is okay for now
	// topWinners = _countWinner(tally);
	
	

	var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result
	
	var topWinner = topWinners[0];
	// Winner... or NOT!!!!
	text += "<br>";
	if (topWinners.length == 1) {
		text += model.icon(topWinner)+" beats all other candidates in one-on-one races.<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;
	}else if (topWinners.length >= 2) {
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += model.icon(c)+" got "+tally[c]+" wins<br>";
		}
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		text += "NOBODY beats everyone else in one-on-one races.<br>";
		text += "</span>";
		text += "<br>";
		text += "THERE'S NO WINNER.<br>";
		text += "<b id='ohno'>OH NO.</b>";
	}

	// what's the loop?

	result.text = text;

	return result;
};

// PairElimination
Election.schulze = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	var reverseExplanation = true

	var text = "";
	text += "<span class='small'>";
	if (reverseExplanation) {
		text += "<b>who lost the least, one-on-one?</b><br>";
	} else {
		text += "<b>who had the strongest wins, one-on-one?</b><br>";
	}

	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;
	for(var candidateID in model.candidatesById) losses[candidateID] = 0;

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<district.candidates.length-1; i++){
		var a = district.candidates[i];
		for(var j=i+1; j<district.candidates.length; j++){
			var b = district.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==district.candidates.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {

		// switch to indexing the candidates by numbers instead of names
		var lossesI=[]
		for (var j = 0; j < district.candidates.length; j++) {
			//lossesI[j] = losses[district.candidates[j]]
			lossesI.push(losses[district.candidates[j].id])
		}

		// find the Schwartz set
		schwartz = []

		// find the lowest loss candidates and add them to the schwarz set

		max3 = district.candidates.length
		for(var j = 0; j < district.candidates.length; j++){ // see who wins 
			if(lossesI[j]<max3){
				max3 = lossesI[j]
				schwartz = []
				schwartz.push(j)
			} else if (lossesI[j]==max3){
				schwartz.push(j)
			}
		}
		// add anybody that beat them (not tied)
		var jp
		for (var j = 0; j < pairs.length; j++) {
			jp = pairs[j]
			if ( schwartz.includes(jp.loseI) && ! jp.tie && ! schwartz.includes(jp.winI) ) {
				schwartz.push(jp.winI)
				j = -1 // restart loop
			}
		}
		schwartzFirst =  (Array.from(schwartz)).map(x => district.candidates[x].id)
		



		var tieBreakerWinners = []
		for (var i = pairs.length - 1; i >= 0; i--) { // i represents the strongest pair to be eliminated
			

			if (! pairs[i].tie) {
				losses[district.candidates[pairs[i].loseI].id] -- // eliminate loss
				lossesI[pairs[i].loseI] -- // eliminate loss
			}
			if (i > 0 && pairs[i].margin == pairs[i-1].margin) { // check if there is a tie for weakest win
				continue
			}


			// find the Schwartz set
			schwartz = []

			// find the lowest loss candidates and add them to the schwarz set

			max3 = district.candidates.length
			for(var j = 0; j < district.candidates.length; j++){ // see who wins 
				if(lossesI[j]<max3){
					max3 = lossesI[j]
					schwartz = []
					schwartz.push(j)
				} else if (lossesI[j]==max3){
					schwartz.push(j)
				}
			}
			// add anybody that beat them (not tied)
			var jp
			for (var j = 0; j < i; j++) { // don't look at pairs that are already eliminated
				jp = pairs[j]
				if ( schwartz.includes(jp.loseI) && ! jp.tie && ! schwartz.includes(jp.winI) ) {
					schwartz.push(jp.winI)
					j = -1 // restart loop
				}
			}
			
			// store schwartz set to display later
			pairs[i].schwartz = (Array.from(schwartz)).map(x => district.candidates[x].id)

			// count losses

			var schwartzlosses = []
			for(var j = 0; j < district.candidates.length; j++){ 
				schwartzlosses[j] = 0
			} 
		
			
			for (var j = 0; j < pairs.length; j++) { 
				jp = pairs[j]
				if ( schwartz.includes(jp.loseI) && ! jp.tie && schwartz.includes(jp.winI) ) {
					schwartzlosses[jp.loseI]++
				}
			}
			
			//////////////////////// doesn't work yet
			


			// finda winner in the Schwartz set

			for(var j in schwartz){ // see who wins 
				var guy = schwartz[j]
				if(lossesI[guy]==0){
					tieBreakerWinners.push(district.candidates[guy].id);
				}
			}
			if (tieBreakerWinners.length > 0) break; // stop if someone won

		}
		topWinners = tieBreakerWinners
		var strongestElimination = i
	}



    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	} else {
		schwartztext = ""
		for (var j in model.candidatesById) { // go through the candidate names in order and display the ones that are in the schwartz set.
			if( schwartzFirst.includes(j)) {
				schwartztext = schwartztext + model.icon(j)	
			}
		}
		schwartztext += " is Schwartz set.<br>"
		text += schwartztext
	}

	// add text
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = district.candidates[pairs[i].winI]
		var b = district.candidates[pairs[i].loseI]
		
		if (i >= strongestElimination) {
			var begintext = "<del>"
			var endtext = "</del><br>"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}


		if (! unanimousWin) {
			schwartztext = ""
			if (pairs[i].hasOwnProperty("schwartz")) {
				for (var j in model.candidatesById) { // go through the candidate names in order and display the ones that are in the schwartz set.
					if( pairs[i].schwartz.includes(j)) {
						schwartztext = schwartztext + model.icon(j)	
					}
				}
				var extraspace = district.candidates.length - pairs[i].schwartz.length
				var spaces = Math.round(extraspace * 3.4 + 0)
				for (var j = 0; j < spaces; j++) {
					schwartztext = schwartztext + "&nbsp;"
				}
				schwartztext += "&larr;"
			} else {
				var spacelength = Math.round(district.candidates.length * 3.4 + 4)
				for (var j = 0; j < spacelength; j++) {
					schwartztext = schwartztext + "&nbsp;"
				}
			}
			begintext = schwartztext + begintext
		}

		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		
	}

	// sort losses
	var sortedlosses = []
	for(var i = 0; i < district.candidates.length; i++) sortedlosses.push({name:district.candidates[i].id,losses:losses[district.candidates[i].id]})
	sortedlosses.sort(function(a,b) {return a.losses - b.losses})

	text += "<br>";
	if (topWinners.length >= 2) {
		text += "<b>Eliminate the weakest losses until someone in the Schwartz set has 0 losses.</b><br>"
		for(var i=0; i<sortedlosses.length; i++){
			var c = sortedlosses[i].name;
			text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
		}
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 0) { // this shouldn't happen
		text = "<b>TIE</b> <br> <br>" + text;
	} else {
		topWinner = topWinners[0]
		if (unanimousWin) {
			
		} else {
			text += "<b>Eliminate the weakest wins until someone in the Schwartz set has 0 losses.<br>"
			for(var i=0; i<sortedlosses.length; i++){
				var c = sortedlosses[i].name;
				text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
			}
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	}
	
	// what's the loop?

	result.text = text;

	return result;
};

// PairElimination
Election.minimax = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	var reverseExplanation = true

	var text = "";
	text += "<span class='small'>";
	if (reverseExplanation) {
		text += "<b>who lost by the least, one-on-one?</b><br>";
	} else {
		text += "<b>who had the strongest wins, one-on-one?</b><br>";
	}

	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var i=0; i<district.candidates.length; i++){ 
		cID = district.candidates[i].id
		tally[cID] = 0
		losses[cID] = 0
	}

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<district.candidates.length-1; i++){
		var a = district.candidates[i];
		for(var j=i+1; j<district.candidates.length; j++){
			var b = district.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if (options.ballotweight) {
					var inc = options.ballotweight[k][i][j]
				} else {
					var inc = 1
				}
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins+=inc; // a wins!
				}else{
					bWins+=inc; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==district.candidates.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {
		var tieBreakerWinners = []
		for (var i = pairs.length - 1; i >= 0; i--) { // i represents the strongest pair to be eliminated
			
			if (! pairs[i].tie) {
				losses[district.candidates[pairs[i].loseI].id] -- // eliminate loss
			}
			
			if (i > 0 && pairs[i].margin == pairs[i-1].margin) { // check if there is a tie for weakest win
				continue
			}
			
			for(var id in tally){ // see who wins
				if(losses[id]==0){
					tieBreakerWinners.push(id);
				}
			}
			if (tieBreakerWinners.length > 0) break; // stop if someone won
		}
		topWinners = tieBreakerWinners
		var strongestElimination = i
	}


    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	}

	// add text
	var eventsToAssign = []
		
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = district.candidates[pairs[i].winI]
		var b = district.candidates[pairs[i].loseI]
		
		if (i >= strongestElimination) {
			var begintext = "<del>"
			var endtext = "</del> . weak<br>"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}


		var eventID = 'pair_' + a.id + '_' + b.id
		if (options.round) eventID += '_round' + options.round
		eventID += '_district' + district.i
		text += '<div id="' + eventID + '" class="pair">' // onmouseover="showOnlyPair(' + a.id + ',' + b.id + ')">'
		
		if (options.ballotweight) {
			var weightcopy = _jcopy(options.ballotweight)
			var pastwinnerscopy = _jcopy(options.pastwinners)
		}
		var pairDraw = function(aid,bid,tie) { // a function is returned, so that i has a new scope
			return function() {
				// make a backup
				var dBackup = [] // TODO: make a copy instead of a backup
				for (var i = 0; i < district.candidates.length; i++) {
					dBackup.push(district.candidates[i])
				}
				var mBackup = [] // TODO: make a copy instead of a backup
				for (var i = 0; i < model.candidates.length; i++) {
					mBackup.push(model.candidates[i])
				} // hmm... TODO: is this a mistake?  should we be using model instead of district?

				// remove all candidates except the pair
				// start at the end of the list
				for (var i = district.candidates.length-1; i >= 0; i--) {
					c = district.candidates[i]
					if (c.id == aid) {
						var ai = i
						continue // skip
					}
					if (c.id == bid) {
						var bi = i
						continue // skip
					}
					district.candidates.splice(i, 1); // remove from candidates...
				}

				// need to remove the candidates from the model list.
				for (var i = model.candidates.length-1; i >= 0; i--) {
					c = model.candidates[i]
					if (c.id == aid) continue // skip
					if (c.id == bid) continue // skip
					model.candidates.splice(i, 1); // remove from candidates...
				}

				for (var i=0; i < model.voterGroups.length; i++) {
					v = model.voterGroups[i]
					v.update() // easy way to only show the two candidates.
				}

				for(var j=0; j<district.voterPeople.length; j++){
					var v = district.voterPeople[j]
					model.voterGroups[v.iGroup].voterPeople[v.iPoint].weight = weightcopy[j][ai][bi]
				}


				model.dontdrawwinners = true
				model.drawArenas()
				model.dontdrawwinners = false
				district.candidates = dBackup
				model.candidates = mBackup
				for (var i=0; i < model.voterGroups.length; i++) {
					model.voterGroups[i].update()
				}

				// also draw past winners
				for (var i = 0; i < pastwinnerscopy.length; i++) {
					var p = pastwinnerscopy[i]
					model.candidatesById[p].draw(model.arena.ctx,model.arena)
					model.candidatesById[p].drawText("WON",model.arena.ctx,model.arena)
				}
				// draw this pair's better half
				if (! tie) district.candidates[ai].drawText("Better",model.arena.ctx,model.arena)
			}
		}

		eventsToAssign.push({eventID,f:pairDraw(a.id,b.id,pairs[i].tie)})
		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		text += '</div>'
		
	}
	result.eventsToAssign = eventsToAssign

	// sort losses
	var sortedlosses = []
	for(var i = 0; i < district.candidates.length; i++) sortedlosses.push({name:district.candidates[i].id,losses:losses[district.candidates[i].id]})
	sortedlosses.sort(function(a,b) {return a.losses - b.losses})

	text += "<br>";
	if (topWinners.length >= 2) {
		text += "<b>Eliminate the weakest losses until someone has 0 losses.</b><br>"
		for(var i=0; i<sortedlosses.length; i++){
			var c = sortedlosses[i].name;
			text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
		}
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 1) {
		topWinner = topWinners[0]
		if (unanimousWin) {
			
		} else {
			text += "<b>Eliminate the weakest wins until someone has 0 losses.<br>"
			for(var i=0; i<sortedlosses.length; i++){
				var c = sortedlosses[i].name;
				text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
			}
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	} else {
		text += "No Candidates <br>"
	}
	
	// what's the loop?

	result.text = text;

	return result;
};

// PairElimination
Election.rankedPairs = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	var reverseExplanation = false

	var text = "";
	text += "<span class='small'>";
	if (reverseExplanation) {
		text += "<b>who lost the least, one-on-one?</b><br>";
	} else {
		text += "<b>who had the strongest wins, one-on-one?</b><br>";
	}

	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;
	for(var candidateID in model.candidatesById) losses[candidateID] = 0;

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<district.candidates.length-1; i++){
		var a = district.candidates[i];
		for(var j=i+1; j<district.candidates.length; j++){
			var b = district.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==district.candidates.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {
		var showdead = true // option: should we show the dead candidates?
		var tieBreakerWinners = []
		var hadawin = new Set()
		var dead = new Set()
		var surviving = new Set()
		var survivedq = function (w3) {
			if (! dead.has(w3)) { // this guy hasn't lost yet, so make sure he's in the survivor list
				surviving.add(w3)
			}
			return
		}
		for (var i = 0; i < pairs.length; i++) { // i represents the strongest pair to be eliminated
			var w3 = pairs[i].winI
			var l3 = pairs[i].loseI
			if (pairs[i].tie) {
				survivedq(w3)
				survivedq(l3)
			} else if (surviving.size == 1 && surviving.has(l3) && dead.has(w3)) { 
				// check if there is a conflict 
				// if we're about to remove our last survivor, don't do it
				pairs[i].conflict = true
			} else {
				dead.add(l3)
				surviving.delete(l3)
				survivedq(w3)
			}
			pairs[i].survivors = (Array.from(surviving)).map(x => district.candidates[x].id)
			if (showdead) pairs[i].dead = (Array.from(dead)).map(x => district.candidates[x].id)
		}
		topWinners = (Array.from(surviving)).map(x => district.candidates[x].id)
	}




	
    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	}

	// add text

	if (! unanimousWin) {
		text += "(also, cross out the conflicts)<br>";
		text += "(left list: had a win & no loss)<br>"
		var keepShowingSurvivors = true
	}
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = district.candidates[pairs[i].winI]
		var b = district.candidates[pairs[i].loseI]
		
		if (pairs[i].conflict) {
			var begintext = "<del>"
			var endtext = "</del><br>" // "conflict"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}
		if (! unanimousWin) { // this is the block that shows the survivors
			survivorstext = ""
			if (keepShowingSurvivors) {
				for (var ic in pairs[i].survivors) {
					var c = pairs[i].survivors[ic]
					survivorstext = survivorstext + model.icon(c)
				}
				if (showdead) {
					survivorstext = survivorstext + ">"
					var deadtext = ""
					for (var ic in pairs[i].dead) {
						var c = pairs[i].dead[ic]
						deadtext = model.icon(c) + deadtext
					}
					survivorstext = survivorstext + deadtext
					var extraspace = district.candidates.length - pairs[i].survivors.length - pairs[i].dead.length
					survivorstext = survivorstext + "&nbsp;&nbsp;&nbsp;"
				} else {
					var extraspace = district.candidates.length - pairs[i].survivors.length
				}
				if (pairs[i].survivors.length == 1 && pairs[i].dead.length + 1 == district.candidates.length) keepShowingSurvivors = false
				
				var spaces = Math.round(extraspace * 3.4 + 0)
				for (var j = 0; j < spaces; j++) {
					survivorstext = survivorstext + "&nbsp;"
				}
			} else {
				var spacelength = Math.round(district.candidates.length * 3.4 + 6)
				for (var j = 0; j < spacelength; j++) {
					survivorstext = survivorstext + "&nbsp;"
				}
			}
			begintext = survivorstext + begintext
		}
		
		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		
	}

	text += "<br>";
	if (topWinners.length >= 2) {
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 1) {
		topWinner = topWinners[0]
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	} else {
		text += "<br> No Candidates <br>"
	}
	
	// what's the loop?

	result.text = text;

	return result;
};

Election.rbvote = function(district, model, options){ // Use the RBVote from Rob Legrand

	if (model.checkRunTextBallots()) {
		// var filler = {candidates:[]}
		// result = _check01(filler,model)
		// if (! result.good) return result
		var text = "<span class='small'>";
		rbvote.setreturnstring() // tell rbvote that we might want return strings (unless we're not doing the sidebar)
		document.rbform = {
			rvote:{
				value:model.textBallotInput
			},
			tiebreak:{
				value:""
			},
			ignore:{
				value: ""
			},
			reverse:{
				checked: false
			}
		}
		if (! rbvote.readvotes()) return
		resultRB = model.rbelection(options.sidebar) // e.g. result = rbvote.calctide() // having a sidebar display means we want to construct explanation strings

		if (resultRB.str) { // e.g. when the sidebar is on
			// replace some of the html in the output of rbvote to make it match the style of betterballot
			var rbvote_string = (resultRB.str).replace("style.css","../play/css/rbvote.css").replace()
			rbvote_string = rbvote_string.replace('<th rowspan="5">for</th>',)
			text += rbvote_string
		}
		text += "</span>";
		result = {text:text};
	
		return result;
	}

	var reverseExplanation = false

	
	result = _check01(district,model)
	if (! result.good) return result

	var text = "<span class='small'>";

	var ballots = model.voterSet.getBallotsDistrict(district)

	rbvote.setreturnstring() // tell rbvote that we might want return strings (unless we're not doing the sidebar)
	rbvote.readballots(ballots,district,model)
	resultRB = model.rbelection(options.sidebar) // e.g. result = rbvote.calctide() // having a sidebar display means we want to construct explanation strings
	


	topWinners = [resultRB.winner]



    var result = _result(topWinners,model)
    var color = result.color

	if (!options.sidebar) return result 
	
	// replace some of the html in the output of rbvote to make it match the style of betterballot
	var rbvote_string = (resultRB.str).replace("style.css","../play/css/rbvote.css").replace()
	var intext = []
	var outtext = []
	for(var i = model.candidates.length - 1; i >= 0; i--) {
		var c = model.candidates[i]
		var t = '[^{](' + c.id + ")"
		intext.push(t)
		outtext.push(model.icon(c.id))
	}
	// var outtext = Object.keys(model.candidatesById).map(x => model.icon(x))
	for (var i in intext) {
		
		rbvote_string = rbvote_string.replace(new RegExp(intext[i],"g"), (match, $1) => {
			return match.slice(0,1) + outtext[i]
		})
		// rbvote_string = rbvote_string.replace(new RegExp(intext[i],"g"),outtext[i])
	}
	rbvote_string = rbvote_string.replace('<th rowspan="5">for</th>',)

	text += rbvote_string
	topWinner = topWinners[0]
	text += "</span>";
	text += "<br>";
	text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
	// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	

	result.text = text;

	return result;
};

Election.rrv = function(district, model, options){

	var numreps = model.seats
	var maxscore = 5

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getVoterArray()
		history.v = v
		history.seats = numreps
		history.maxscore = maxscore
		model.round = -1
	}

	var invmaxscore = 1/maxscore
	var ballots = model.voterSet.getBallotsDistrict(district)
	var ballotweight = []
	var ballotsum = []
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = 1
		ballotsum[i] = 0
	}
	var resolved = false
	var tallies = []
	var winnerslist = []
	
	var candidates = [];
	for(var i=0; i<district.candidates.length; i++){
		candidates.push(district.candidates[i].id);
	}
	
	for(var j=0; j<numreps;j++) {
		// Tally the approvals & get winner!
		var tally = _tally_i(district, model, function(tally, ballot, i){
			for(var j=0; j<candidates.length; j++){
				var candidate = candidates[j];
				tally[candidate] += ballot[candidate] * ballotweight[i]
			}
		})
		tallies.push(tally)
		
		var winners = _countWinner(tally);
		var winner = winners[0] // really we should have a tree of scenarios form here because a whole different group can be chosen from a tiebreaker TODO
		winnerslist.push(winner)
		

		//reweight
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			var votetotal = tally[winner]
			ballotsum[i] += ballot[winner] 
			ballotweight[i] = 1/(1+ballotsum[i]*invmaxscore)
		}

		if (options.sidebar) {
			var roundHistory = {
				winners:[model.candidatesById[winner].i],
				q:_jcopy(ballotweight),
				tally:tally
			}
			history.rounds.push(roundHistory)

		}
		
		// remove winner from candidates
		candidates.splice(candidates.indexOf(winner),1)
	}

	var result = _result(winnerslist.concat().sort(),model)

	if (options.sidebar) {

		// Caption
		var text = "";
		for(j=0; j<winnerslist.length;j++){
			text += '<div id="district'+district.i+'round' + (j+1) + '" class="round">'
			text += "Round " + (j+1);
			text += "<span class='small'>";
			var tally = tallies[j]
			var winner = winnerslist[j];
			if (j>0) text += "<br><b>After votes go to winner,</b>"
			text += "<br><b>score as %:</b><br>";
			for(var i=0; i<district.candidates.length; i++){
				var c = district.candidates[i].id;
				//text += model.icon(c)+"'s score: "+((tally[c]/district.voterPeople.length).toFixed(2))+" out of 5.00<br>";
				text += model.icon(c)+": "+_percentFormat(district, tally[c] / maxscore)
				if (winner == c) text += " &larr;"//" <--"
				text += "<br>";
			}
			var color = _colorsWinners([winner],model)[0]
			text += "";
			//text += model.icon(winner)+" has the highest score, so...";
			text += "</span>";
			text += "";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;
			text += '</div>'
		}
	
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (winnerslist.length+1) + '" class="round">'
			text += "Final Winners:";
			text += "<br>";
			for(var j=0; j<winnerslist.length; j++){
				var c = winnerslist[j]
				text += model.icon(c)+" ";
			}
			text += "<br>";
			text += "<br>";
			text += '</div>'
			
			result.history = history
			result.eventsToAssign = [] // we have an interactive caption
			result.text = text;
			
			// attach caption hover functions
			for (var i=0; i < winnerslist.length+1; i++) {
				var cbDraw = function(i) { // a function is returned, so that i has a new scope
					return function() {
						model.round = i+1
						model.drawArenas()
						model.round = -1
					}
				}
				var e = {
					eventID: "district"+district.i+"round" + (i+1),
					f: cbDraw(i)
				}
				result.eventsToAssign.push(e)
			}
		}

	}

	// if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)  
	if (model.doTop2) var theTop2 = winnerslist.slice(0,2)  /// TODO: see if this actually works 
	if (model.doTop2) result.theTop2 = theTop2

	return result;
};

Election.rav = function(district, model, options){
	
	var numreps = model.seats
	var maxscore = 1

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getVoterArray()
		history.v = v
		history.seats = numreps
		history.maxscore = maxscore
		model.round = -1
	}

	var invmaxscore = 1/maxscore
	var ballots = model.voterSet.getBallotsDistrict(district)
	var ballotweight = []
	var ballotsum = []
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = 1
		ballotsum[i] = 0
	}
	var resolved = false
	var tallies = []
	var winnerslist = []
	
	var candidates = [];
	for(var i=0; i<district.candidates.length; i++){
		candidates.push(district.candidates[i].id);
	}
	
	for(var j=0; j<numreps;j++) {
		// Tally the approvals & get winner!
		var tally = _tally_i(district, model, function(tally, ballot, i){
			var approved = ballot.approved;
			for(var i=0; i<approved.length; i++) {
				if (candidates.includes(approved[i])) {
					tally[approved[i]] += ballotweight[i];
				}
			}
		})
		tallies.push(tally)
		
		var winners = _countWinner(tally);
		var winner = winners[0] // really we should have a tree of scenarios form here because a whole different group can be chosen from a tiebreaker TODO
		winnerslist.push(winner)
		

		//reweight
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			var approved = ballot.approved;
			if (approved.includes(winner)) {
				ballotsum[i]++
				ballotweight[i] = 1/(1+ballotsum[i]*invmaxscore)
			}
		}

		if (options.sidebar) {
			var roundHistory = {
				winners:[model.candidatesById[winner].i],
				q:_jcopy(ballotweight),
				tally:tally
			}
			history.rounds.push(roundHistory)

		}
		
		// remove winner from candidates
		candidates.splice(candidates.indexOf(winner),1)
	}

	var result = _result(winnerslist.concat().sort(),model)

	if (options.sidebar) {

		// Caption
		var text = "";
		for(j=0; j<winnerslist.length;j++){
			text += '<div id="district'+district.i+'round' + (j+1) + '" class="round">'
			text += "Round " + (j+1);
			text += "<span class='small'>";
			var tally = tallies[j]
			var winner = winnerslist[j];
			if (j>0) text += "<br><b>After votes go to winner,</b>"
			text += "<br><b>score as %:</b><br>";
			for(var i=0; i<district.candidates.length; i++){
				var c = district.candidates[i].id;
				//text += model.icon(c)+"'s score: "+((tally[c]/district.voterPeople.length).toFixed(2))+" out of 5.00<br>";
				text += model.icon(c)+": "+_percentFormat(district, tally[c])
				if (winner == c) text += " &larr;"//" <--"
				text += "<br>";
			}
			var color = _colorsWinners([winner],model)[0]
			text += "";
			//text += model.icon(winner)+" has the highest score, so...";
			text += "</span>";
			text += "";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;
			text += '</div>'
		}
	
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (winnerslist.length+1) + '" class="round">'
			text += "Final Winners:";
			text += "<br>";
			for(var j=0; j<winnerslist.length; j++){
				var c = winnerslist[j]
				text += model.icon(c)+" ";
			}
			text += "<br>";
			text += "<br>";
			text += '</div>'
		}

		result.history = history
		result.text = text;
		// attach caption hover functions
		result.eventsToAssign = [] // we have an interactive caption
		for (var i=0; i < winnerslist.length+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}

	// if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)  
	if (model.doTop2) var theTop2 = winnerslist.slice(0,2)  /// TODO: see if this actually works 
	if (model.doTop2) result.theTop2 = theTop2

	return result;
};

Election.borda = function(district, model, options){

	// Tally the approvals & get winner!
	var numcan = district.candidates.length
	var tally = _tally(district,model, function(tally, ballot){
		for(var i=0; i<numcan; i++){
			var candidate = ballot.rank[i];
			tally[candidate] += numcan - i - 1; // reverse the rank and subtract 1 because nobody's going to rank their least favorite.
		}
	});
	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	// Caption
	var text = "";
	text += "<span class='small'>";
	text += "<b>higher score is better</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		text += model.icon(c)+"'s total score: "+tally[c]+" = "+_percentFormat(district, tally[c] / (numcan-1))+"%<br>";
	}
	if(winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}else{
		var winner = winners[0];
		text += "<br>";
		text += model.icon(winner)+" has the <i>highest</i> score, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	}
	result.text = text;
	return result;
};

Election.irv = function(district, model, options){

	var dopoll = "Auto" == model.autoPoll
	if (options.dontpoll) dopoll = false
	if (dopoll) polltext = doPollAndUpdateBallots(district,model,options,"irv")

	var drawFlows = (model.ballotConcept != "off") && ( ! options.yeefast )
	if (drawFlows) {
		var transfers = []
		var coalitions = []
		var topChoice = []
		var coalitionInRound = []
		var lastlosers = []
		var losers = []
	}
	var ballots = model.voterSet.getBallotsDistrict(district)

	var text = "";
	if (options.sidebar) text += "<span class='small'>";

	if (dopoll) text += polltext;
	var resolved = null;
	var roundNum = 1;

	var candidates = [];
	var startingCandidates = []
	for(var i=0; i<district.candidates.length; i++){
		var cid = district.candidates[i].id
		candidates.push(cid);
		startingCandidates.push(cid)
	}
	var loserslist = []

	if(options.sidebar) {
		// var ov = model.voterGroups // original voters
		// var temp = JSON.parse(JSON.stringify(model.voterGroups)) // save the voters before changing them
		// model.voterGroups = temp
		// var vt = []
		// for (var i=0; i<model.voterGroups.length; i++) {
		// 	vt[i]=[]
		// 	for (varj=0; j < model.voterGroups[i].voterPeople.length; j++)
		// 	vt[i][j] = []
		// 	Object.create(model.voterGroups[i].ballots) // new copy
		// }
		// model.voterGroups = vt
		// // model.voterGroups = model.voterGroups.map( x => Object.create(x)) // new copy
	}
	while(!resolved){

		// There are three stages,
		// 1. Tallying votes
		// 2. Deciding whether to continue
		// 3. Eliminating candidates

		// 1. Tally

		// Tally first choices
		var pre_tally = _tally(district,model, function(tally, ballot){
			var top = ballot.rank[0]; // just count #1
			tally[top]++;
		});

		// Filter
		// ONLY list the remaining candidates
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		// Explanation Text
		if (options.sidebar) 
		{
			text += "<b>round "+roundNum+":</b><br>";
			text += "who's voters' #1 choice?<br>";
			for(var i=0; i<candidates.length; i++){
				var c = candidates[i];
				text += model.icon(c)+":"+_percentFormat(district, tally[c])
				if(i<candidates.length-1) text+=", ";
			}
			text += "<br>";
		}

		if (drawFlows) {

			// find top choices 
			topChoice[roundNum-1] = []
			for(var i=0; i<ballots.length; i++){
				var top = ballots[i].rank[0];
				topChoice[roundNum-1][i] = top
			}

			// count coalition members
			coalitionInRound[roundNum-1] = {}
			for(var i=0; i<candidates.length; i++){
				var cid = candidates[i];
				coalitionInRound[roundNum-1][cid] = {}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalitionInRound[roundNum-1][cid][cid2] = 0
				}
			}
			// for all the ballots
			// add to their current top choice's coalition
			for(var k=0; k<ballots.length; k++){
				cid = ballots[k].rank[0]
				first = topChoice[0][k]
				coalitionInRound[roundNum-1][cid][first] ++
			}
		}


		// 2. DECIDE WHETHER TO CONTINUE

		// Do they have more than 50%?
		var winners = _countWinner(tally);
		var winner = winners[0];
		var ratio = tally[winner] / district.voterPeople.length;
		var option100 = model.opt.IRV100
		if (option100) {
			if (candidates.length == 1) {
				resolved = "done";
				if (options.sidebar) text += model.icon(winner)+" is the last candidate standing<br>";
				break;
			}
			
		} else 	if(ratio>0.5){
			if (winners.length >= 2) {	// won't happen bc ratio > .5	
				resolved = "tie"; 
				break;
			}
			resolved = "done";
			if (options.sidebar) text += model.icon(winner)+" has more than 50%<br>";
			break;
		}
		// Otherwise... runoff...
		var losers = _countLoser(tally);
		var loser = losers[0];
		if (model.opt.breakEliminationTiesIRV && losers.length > 1) {

			loser = losers[Math.floor(losers.length * Math.random())]

			if (options.sidebar) {
				for (var li = 0; li < losers.length ; li++ ) {
					cid = losers[li]
					text += model.icon(cid)
				}
				text += " tie during elimination.<br>"
				text += model.icon(loser) + " chosen to lose by tiebreaker.<br>"
			}

			losers = [loser]
		}
		if (losers.length >= candidates.length) {
			resolved = "tie"; 
			break;
		}
		if (0 && candidates.length > 2 && candidates.length - losers.length === 1) {
			// There's only one candidate left
			if (options.sidebar) text += model.icon(winner)+" wins because the others tied in this elimination round.<br>";
			break;
		}
		loserslist = loserslist.concat(losers)

		if (drawFlows) {

			// keep a list of the most recent losers
			lastlosers = losers


			// assign coalitions for the losers
			for (var li = 0; li < losers.length ; li++ ) {
				cid = losers[li]
				var coalition = {
					id: cid,
					list: coalitionInRound[roundNum-1][cid]
				}
				coalitions.push(coalition)
			}

		}

		// 3. ELIMINATE
		
		//text += "nobody's more than 50%. ";

		if (drawFlows) {transfers[roundNum-1] = []}

		for (var li = 0; li < losers.length ; li++ ) {
			loser = losers[li];
			if (options.sidebar) text += "eliminate loser, "+model.icon(loser)+".<br>";

			// REMOVE THE LOSER
			candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
			for(var i=0; i<ballots.length; i++){ // remove from ballots
				var ranking = ballots[i].rank;
				var loserIndex = ranking.indexOf(loser)
				ranking.splice(loserIndex, 1); 		
			}

		}
		if (drawFlows) {
			// calculate transferred voters
			for (var li = 0; li < losers.length ; li++ ) {
				loser = losers[li];

				// make empty data structure for losing candidate
				transfer = {from:loser, flows:{}}
				for (var k = 0; k < candidates.length; k++) {
					var cid = candidates[k]
					transfer.flows[cid] = {}
					for (var m = 0; m < startingCandidates.length; m++) {
						var cid2 = startingCandidates[m]
						transfer.flows[cid][cid2] = 0
					}
				}

				for(var i=0; i<ballots.length; i++){
					var old = topChoice[roundNum-1][i]
					if (old === loser) {
						var first = topChoice[0][i]
						var now = ballots[i].rank[0];
						transfer.flows[now][first] ++
					}
				}
				transfers[roundNum-1].push(transfer)
			}
		}
		roundNum++
		if (options.sidebar) text += "<br>"
	
	}


	if(options.sidebar) {
		
		for(var i=0; i<model.voterGroups.length; i++){
			var voter = model.voterGroups[i];
			voter.update();
		}
		// for (var i=0; i<model.voterGroups.length; i++) {
		// 	model.voterGroups[i].ballots = temp[i].ballots // originals
		// }
		// model.voterGroups = temp // restore the original ballots
		// model.voterGroups = ov
	}

	if (drawFlows) {

	}

	if (model.doTop2 || drawFlows) {
		// add the rest of the candidates to the list of "losers"
		loserslist = loserslist.concat(_sortTallyRev(tally))
	}

	if (model.doTop2) {
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) result.theTop2 = theTop2

	if (drawFlows) {

		// add the rest of the candidates onto the end of the loserslist
		// and find their coalitions
		for(var i=0; i<candidates.length; i++){
			var cid = candidates[i];
			
			if (1) {
				var rounds = coalitionInRound.length
				var coalition = {
					id: cid,
					list: coalitionInRound[rounds-1][cid]
				}
			} else {
				var coalition = {id: cid, list:{}}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalition.list[cid2] = 0
				}
	
				// record the coalition
				for(var k=0; k<ballots.length; k++){
					var ranking = ballots[k].rank;
					if (ranking[0] === cid) {
						first = topChoice[0][k]
						coalition.list[first] ++
					}	
				}
			}
			coalitions.push(coalition)
		}

		result.loserslist = loserslist
		result.canIdByDecision = loserslist
		result.transfers = transfers
		result.topChoice = topChoice
		result.coalitions = coalitions
		result.lastlosers = lastlosers
		result.nBallots = ballots.length
	}

	if (!options.sidebar) return result

	if (resolved == "tie") {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		// END!
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;	
	}

	result.text = text;

	return result;
};

Election.stv = function(district, model, options){

	var numreps = model.seats
	
	var drawFlows = (model.ballotConcept != "off") && ( ! options.yeefast )
	if (drawFlows) {
		var transfers = []
		var coalitions = []
		var topChoice = []
		var coalitionInRound = []
		var lastlosers = []
		var losers = []
		var canIdByDecision = []
	}

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getVoterArray()
		history.v = v
		history.seats = numreps
		history.maxscore = 5
		model.round = -1
	}

	var quota = 1/(numreps+1)

	if (options.sidebar) {
		var quotapercent = Math.round(quota * 100)
		var text = "";
		text += "<span class='small'>";
		text += "Find " + numreps + " winners.<br>"
		text += "Set quota at 1/(1+" + numreps + ") = " + quotapercent + "%.<br><br>"
	}
	var resolved = null;
	var roundNum = 1;

	var candidates = [];
	var startingCandidates = []
	for(var i=0; i<district.candidates.length; i++){
		var cid = district.candidates[i].id
		candidates.push(cid);
		startingCandidates.push(cid)
	}
	var loserslist = []
	var winnerslist = []
	var ballots = model.voterSet.getBallotsDistrict(district)	
	var ballotweight = []
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = 1
	}
	while(!resolved){

		
		if (options.sidebar) {
			
					
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(ballots),
				stillin: stillin
			}

			text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
			text += "<b>round "+roundNum+":</b><br>";
			text += "who's voters' #1 choice?<br>";
		}

		var pre_tally = _tally_i(district, model, function(tally, ballot, i){
			var first = ballot.rank[0]; // just count #1
			tally[first] += ballotweight[i];
		});

		// ONLY tally the remaining candidates...
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		if (options.sidebar) {
			// Say 'em...
			for(var i=0; i<candidates.length; i++){
				var c = candidates[i];
				// text += model.icon(c)+":"+Math.round(tally[c]);
				text += model.icon(c)+":"+_percentFormat(district,tally[c]);
				
				if(i<candidates.length-1) text+=", ";
			}
			text += "<br>";
		}


		if (drawFlows) {

			// find top choices 
			topChoice[roundNum-1] = []
			for(var i=0; i<ballots.length; i++){
				var top = ballots[i].rank[0];
				topChoice[roundNum-1][i] = top
			}

			// count coalition members
			coalitionInRound[roundNum-1] = {}
			for(var i=0; i<candidates.length; i++){
				var cid = candidates[i];
				coalitionInRound[roundNum-1][cid] = {}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalitionInRound[roundNum-1][cid][cid2] = 0
				}
			}
			// for all the ballots
			// add to their current top choice's coalition
			for(var k=0; k<ballots.length; k++){
				cid = ballots[k].rank[0]
				first = topChoice[0][k]
				coalitionInRound[roundNum-1][cid][first] += ballotweight[k]
			}
		}


		// 2. DECIDE WHETHER TO CONTINUE

		// Do they have more than 50%?
		var winners = _countWinner(tally);
		var winner = winners[0];  // there needs to be a better tiebreaker here. TODO
		var ratio = tally[winner]/district.voterPeople.length;
		
		// show all the transfers if the 100% option is chosen
		var option100 = model.opt.IRV100
		var lastwin = numreps - winnerslist.length == 1 // this could be the last winner
		var oneleft = candidates.length == 1 // there is only one candidate left
		var wait = option100 && lastwin & !oneleft // don't name the last winner unless he's the only one left
		
		if(ratio>quota && ! wait){
			// if (winners.length >= 2) {	// won't happen bc ratio > .5	
			// 	resolved = "tie"; 
			// 	break;
			// }
			reweight = 1-quota/ratio
			winnerslist.push(winner)
			
			if (options.sidebar) {
				text += model.icon(winner)+" has more than " + quotapercent + "%<br>";
				text += "select winner, "+model.icon(winner)+".<br><br>";
			}

			if (drawFlows) {
				var coalition = {
					id: winner,
					list: coalitionInRound[roundNum-1][winner]
				}
				coalitions.push(coalition)
			}
	
			// 3. Remove winner from candidates

			candidates.splice(candidates.indexOf(winner), 1); // remove from candidates...
			// var ballots = model.voterSet.getBallotsDistrict(district)
			for(var i=0; i<ballots.length; i++){
				var rank = ballots[i].rank;
				if (rank[0] === winner) {
					ballotweight[i] *= reweight
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
			if (drawFlows) {
				canIdByDecision = canIdByDecision.concat(winner)
				var transferFrom = [winner]
			}

			if (winnerslist.length == numreps) {
				resolved = "done"

				break
			}
			if (candidates.length == 0) break
		} else {
			winners = []
			winner = null
			// Otherwise... runoff...
			var losers = _countLoser(tally);
			var loser = losers[0];
			if (model.opt.breakEliminationTiesIRV && losers.length > 1) {
				loser = losers[Math.floor(losers.length * Math.random())]
				losers = [loser]
			}
			if (losers.length >= candidates.length) {
				resolved = "tie"; 
				winnerslist = winnerslist.concat(losers)
				var tiedlosers = losers
				break;
			}
			loserslist = loserslist.concat(losers)
			if (drawFlows) canIdByDecision = canIdByDecision.concat(losers)

			if (drawFlows) {

				// keep a list of the most recent losers
				lastlosers = losers
	
	
				// assign coalitions for the losers
				for (var li = 0; li < losers.length ; li++ ) {
					cid = losers[li]
					var coalition = {
						id: cid,
						list: coalitionInRound[roundNum-1][cid]
					}
					coalitions.push(coalition)
				}
	
			}
	
			// 3. ELIMINATE
			
			//text += "nobody's more than 50%. ";
			

			for (var li = 0; li < losers.length ; li++ ) {
				loser = losers[li];
				
				if (options.sidebar) {
					text += "eliminate loser, "+model.icon(loser)+".<br>";
				}
				candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
				for(var i=0; i<ballots.length; i++){
					var ranking = ballots[i].rank;
					var loserIndex = ranking.indexOf(loser)
					ranking.splice(loserIndex, 1); // REMOVE THE LOSER		
				}
			}
			var transferFrom = losers
		}
		

		if (drawFlows) {
			// calculate transferred voters
			
			transfers[roundNum-1] = []

			for (var li = 0; li < transferFrom.length ; li++ ) {
				from = transferFrom[li];

				// make empty data structure for losing candidate
				transfer = {from:from, flows:{}}
				for (var k = 0; k < candidates.length; k++) {
					var cid = candidates[k]
					transfer.flows[cid] = {}
					for (var m = 0; m < startingCandidates.length; m++) {
						var cid2 = startingCandidates[m]
						transfer.flows[cid][cid2] = 0
					}
				}

				for(var i=0; i<ballots.length; i++){
					var old = topChoice[roundNum-1][i]
					if (old === from) {
						var first = topChoice[0][i]
						var now = ballots[i].rank[0];
						transfer.flows[now][first] += ballotweight[i]
					}
				}
				transfers[roundNum-1].push(transfer)
			}
		}


		if (candidates.length == 0) {
			// we ran out of candidates, everybody won already
			resolved = "done"
			break
		}

		// And repeat!
		roundNum++;  // TODO: clarify what the round number means, w.r.t ties

		if (options.sidebar) {
			
			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(ballots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)

			text += "<br>"
			text += '</div>'
		}
	}
	
	if (options.sidebar) {
			
		roundHistory.tally = tally
		roundHistory.ballots = _jcopy(ballots)
		if (winner) {
			roundHistory.winners = [model.candidatesById[winner].i]
		} else {
			roundHistory.winners = []
		}
		history.rounds.push(roundHistory)

		text += "<br>"
		text += '</div>'

		// push out a final reweight just to evaluate how well the method worked
		if (1) {
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(ballots),
				stillin: stillin
			}

			var pre_tally = _tally_i(district, model, function(tally, ballot, i){
				var first = ballot.rank[0]; // just count #1
				tally[first] += ballotweight[i];
			});
	
			// ONLY tally the remaining candidates...
			var tally = {};
			for(var i=0; i<candidates.length; i++){
				var cID = candidates[i];
				tally[cID] = pre_tally[cID];
			}

			
			var winners = _countWinner(tally);
			var winner = winners[0];  // there needs to be a better tiebreaker here. TODO

			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(ballots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			
		}
	}
	
	if (options.sidebar) {
		text += '</div>'
	}

	winners = winnerslist.sort() 

	if (model.doTop2) { /// TODO: see if this actually works
		loserslist = loserslist.concat(_sortTallyRev(tally))
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color
	if (model.doTop2) result.theTop2 = theTop2

	
	if (drawFlows) {

		// add the rest of the candidates onto the end of the list of candidates sorted by decision order
		// and find their coalitions
		for(var i=0; i<candidates.length; i++){
			var cid = candidates[i];
			canIdByDecision.push(cid)
			
			if (1) {
				var rounds = coalitionInRound.length
				var coalition = {
					id: cid,
					list: coalitionInRound[rounds-1][cid]
				}
			} else {
				var coalition = {id: cid, list:{}}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalition.list[cid2] = 0
				}
	
				// record the coalition
				for(var k=0; k<ballots.length; k++){
					var ranking = ballots[k].rank;
					if (ranking[0] === cid) {
						first = topChoice[0][k]
						coalition.list[first] ++
					}	
				}
			}
			coalitions.push(coalition)
		}

		result.loserslist = loserslist
		result.canIdByDecision = canIdByDecision
		result.transfers = transfers
		result.topChoice = topChoice
		result.coalitions = coalitions
		result.lastlosers = lastlosers
		result.nBallots = ballots.length
	}

	if (options.sidebar) {
		text += '<div id="district'+district.i+'round' + (roundNum+1) + '" class="round">'
		if (resolved == "tie") {
			text += _tietext(model,tiedlosers);
			// text = "<b>TIE</b> <br> <br>" + text;
		} 
		text = "<br>" + text
		for (var i in winners) {
			var winner = winners[i]
			var color = _colorsWinners([winner],model)[0]
			// END!
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;	
		}
		text += '</div>'
	
		result.history = history
		result.eventsToAssign = [] // we have an interactive caption
		result.text = text;
		
		// attach caption hover functions
		for (var i=0; i < roundNum+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}

	// we messed around with the rankings, so lets put them back
	for(var j=0; j<model.voterGroups.length; j++){
		model.voterGroups[j].update();
	}

	return result;
};

Election.quotaMinimax = function(district, model, options){

	var numreps = model.seats

	var pairEventsToAssign = []

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getVoterArray()
		history.v = v
		history.seats = numreps
		history.maxscore = 5
		model.round = -1
	}

	var quota = 1/numreps

	if (options.sidebar) {
		var quotapercent = Math.round(quota * 100)
		var text = "";
		text += "<span class='small'>";
		text += "Find " + numreps + " winners.<br>"
		text += "Set quota at 1/" + numreps + " = " + quotapercent + "%.<br><br>"
	}

	var candidates = [];
	for(var i=0; i<district.candidates.length; i++){
		candidates.push(district.candidates[i].id);
	}
	var winnerslist = []
	var ballots = model.voterSet.getBallotsDistrict(district)	
	var oldballots = _jcopy(ballots)
	var ballotweight = []
	var numcan = district.candidates.length
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = []
		for(var j=0; j < district.candidates.length; j++) {
			ballotweight[i][j] = []
			for(var k=0; k < district.candidates.length; k++) {
				ballotweight[i][j][k] = 1
			}
		}
	}
	var all1 = _jcopy(ballotweight)
	var ballotcounted = _jcopy(all1)

	var oldCandidates = district.candidates
	district.candidates = _jcopy(oldCandidates)
	for ( var roundNum = 1; roundNum <= numreps; roundNum++) {

		
		if (options.sidebar) {
			
					
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(ballots),
				stillin: stillin
			}

			text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
			text += "<b>round "+roundNum+":</b><br>";
			if (roundNum>1) {
				text += "Since we already counted the winner's supporters, only count the remaining votes.<br>";
			} 
		}

		var tempOptions = _jcopy(options) // send new options to minimax
		tempOptions.ballotweight = ballotweight
		tempOptions.round = roundNum
		tempOptions.pastwinners = winnerslist
		var roundResult = Election.minimax(district, model,tempOptions)


		pairEventsToAssign = pairEventsToAssign.concat(roundResult.eventsToAssign)
		
		var winners = roundResult.winners
		var winner = winners[0];  // there needs to be a better tiebreaker here. TODO
		winnerslist.push(winner)
		
		if (options.sidebar) {
			text += '</div>'
			text += roundResult.text
		}


		if (options.sidebar) {
			
			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(ballots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			// text += '</div>'
			text += "<br>"
		}
		
		
		var support = []
		for(var j=0; j < numcan; j++) {
			support[j] = []
			for(var k=0; k < numcan; k++) {
				support[j][k] = 0
			}
		}

		var sequential = false
		if (sequential) {
			// add up support for the winner
			for(var i=0; i<ballots.length; i++){
				var rank = ballots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						if (jr >= winpos && kr >= winpos) {
							support[j][k] += ballotweight[i][j][k]
						}
					}
				}
			}
			// figure out how much to reweight
			reweight = []
			for(var j=0; j < numcan; j++) {
				reweight[j] = []
				for(var k=0; k < numcan; k++) {
					var ratio = support[j][k] / (roundNum * quota * ballots.length)
					// reweight[j][k] = Math.max(0,1-ratio)
					if (ratio == 0) {
						reweight[j][k] = 1
					} else {
						reweight[j][k] = Math.max(0,1-1/ratio)
					}
				}
			}
			// reweight and eliminate winner
			for(var i=0; i<ballots.length; i++){
				var rank = ballots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						if (jr >= winpos && kr >= winpos) {
							ballotweight[i][j][k] *= reweight[j][k]
						}
					}
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
		} else {
			// add up support for a the winning candidates so far
			for(var i=0; i<oldballots.length; i++){
				var rank = oldballots[i].rank;
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						var add = 0
						for (var l=0; l<winnerslist.length;l++){
							var w = winnerslist[l]
							var winpos = rank.indexOf(w)
							if (jr >= winpos && kr >= winpos) {
								add = 1
							}
						}
						ballotcounted[i][j][k] = add
						support[j][k] += add
					}
				}
			}
			// figure out how much to reweight
			// if there is a lot of support for the winning candidates, then the voters can still have positive weight.
			// if there is zero support for the winners, then the voters are at full weight.
			reweight = []
			for(var j=0; j < numcan; j++) {
				reweight[j] = []
				for(var k=0; k < numcan; k++) {
					var ratio = support[j][k] / (roundNum * quota * ballots.length)
					if (ratio == 0) {
						reweight[j][k] = 1
					} else {
						reweight[j][k] = Math.max(0,1-1/ratio) // don't let reweighting go negative
					}
				}
			}
			ballotweight = _jcopy(all1)
			// reweight and eliminate winner
			for(var i=0; i<ballots.length; i++){
				var rank = ballots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (ballotcounted[i][j][k]) {
							ballotweight[i][j][k] = reweight[j][k]
						}
					}
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
		}
		var cids = [] // candidate id's
		for (var i=0; i < district.candidates.length; i++) {
			cids.push(district.candidates[i].id)
		}
		district.candidates.splice(cids.indexOf(winner), 1); // remove from candidates...

	}
	district.candidates = oldCandidates
	
	if (options.sidebar) {
		
		roundHistory.tally = tally
		roundHistory.ballots = _jcopy(ballots)
		if (winner) {
			roundHistory.winners = [model.candidatesById[winner].i]
		} else {
			roundHistory.winners = []
		}
		history.rounds.push(roundHistory)

		text += "<br>"
		text += '</div>'

		// push out a final reweight just to evaluate how well the method worked
		if (0) {
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(ballots),
				stillin: stillin
			}

			var pre_tally = _tally_i(district, model, function(tally, ballot, i){
				var first = ballot.rank[0]; // just count #1
				tally[first] += ballotweight[i];
			});
	
			// ONLY tally the remaining candidates...
			var tally = {};
			for(var i=0; i<candidates.length; i++){
				var cID = candidates[i];
				tally[cID] = pre_tally[cID];
			}

			
			var winners = _countWinner(tally);
			var winner = winners[0];  // there needs to be a better tiebreaker here. TODO

			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(ballots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			
		}
	}
	
	// TODO: fill in last votes

	if (options.sidebar) {
		text += '</div>'
	}

	winners = winnerslist.sort() 

	if (model.doTop2) { /// TODO: see if this actually works
		loserslist = loserslist.concat(_sortTallyRev(tally))
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) result.theTop2 = theTop2

	if (options.sidebar) {
		text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
		text = "<br>" + text
		for (var i in winners) {
			var winner = winners[i]
			var color = _colorsWinners([winner],model)[0]
			// END!
			text += "</span>";
			text += "<br>";
			// text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;	
		}
		text += '</div>'
	
		result.history = history
		result.eventsToAssign = [] // we have an interactive caption
		result.text = text;
		
		// attach caption hover functions
		for (var i=0; i < roundNum; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
		// attach more
		for (var i=0; i < pairEventsToAssign.length; i++) {
			var e = pairEventsToAssign[i]
			result.eventsToAssign.push(e)
		}
	}

	// we messed around with the rankings, so lets put them back
	for(var j=0; j<model.voterGroups.length; j++){
		model.voterGroups[j].update();
	}

	return result;
};

Election.quotaApproval = function(district, model, options){
	
	var v = model.voterSet.getVoterArray()

	var seats = model.seats
	var winners = []
	var winnersIndexes = []
	
	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		history.v = v
		history.seats = seats
		history.maxscore = 1
		model.round = -1
	}

	var q = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
	}
	for (var n = 0; n < district.candidates.length; n++) {
		if (winners.length >= seats) {
			break
		}
		var tally = []
		for (var k = 0; k < district.candidates.length; k++) {
			tally[k] = 0
		}
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			var quota = Math.max(q[i],0)
			
			for (var k = 0; k < b.length; k++) {
				if (winnersIndexes.includes(k)) continue
				if (b[k] == 1) {
					// add up the number of votes
					tally[k] += quota
				}
			}
		}
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
			text += "Round " + (n+1);
			text += "<br>";
			for(var i=0; i<district.candidates.length; i++){
				var c = district.candidates[i].id;
				text += model.icon(c)+" got "+_percentFormat(district, tally[i])+"<br>";
			}
			text += "<br>";
			text += '</div>'
		}
		// who won this round?
		var roundWinners = _countWinner(tally) // need to exclude twice-winners
		if (model.opt.breakWinTiesMultiSeat) {
			roundWinners = roundWinners[Math.floor(Math.random() * roundWinners.length)]
			roundWinners = [roundWinners]
		}
		roundWinners = roundWinners.map(x => Number(x))
		roundWinners.forEach(x => winnersIndexes.push(Number(x)))
		roundWinnersId = roundWinners.map( x => district.candidates[x].id)
		roundWinnersId.forEach(x => winners.push(x))

		// subtract off the quota
		for (var i=0; i < roundWinners.length; i++) {
			var winnerIndex = roundWinners[i]
			var sum = tally[winnerIndex]
			var rep = v.length / sum / seats
			for (var k=0; k < v.length; k++) { 
				var b = v[k].b
				if (b[winnerIndex]) { // if this voter voted for this candidate
					q[k] -= rep // we could just multiply by b[wI]
				}
			}
		}
		if (options.sidebar) {
			var roundHistory = {
				winners: roundWinners,
				q:q,
				tally:tally
			}
			history.rounds.push(roundHistory)
		}
	}

	
	if(options.sidebar) {
		text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
		text += "Final Winners:";
		text += "<br>";
		for(var i=0; i<winners.length; i++){
			var c = winners[i]
			text += model.icon(c)+" ";
		}
		text += "<br>";
		text += "<br>";
		text += '</div>'
	}
	
	var result = _result(winners,model)
	if (options.sidebar) {
		result.history = history
		
		result.text = text

		result.eventsToAssign = [] // we have an interactive caption
		// attach caption hover functions
		for (var i=0; i < n+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}
	return result
}

Election.quotaScore = function(district, model, options){
	
	var v = model.voterSet.getVoterArray()

	var seats = model.seats
	var winners = []
	var winnersIndexes = []
	var maxscore = model.voterGroups[0].voterModel.maxscore
	
	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		history.v = v
		history.seats = seats
		history.maxscore = maxscore
		model.round = -1
	}

	var q = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
	}
	for (var n = 0; n < district.candidates.length; n++) {
		if (winners.length >= seats) {
			break
		}
		var tally = []
		for (var k = 0; k < district.candidates.length; k++) {
			tally[k] = 0
		}
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			var quota = Math.max(q[i],0)
			
			for (var k = 0; k < b.length; k++) {
				if (winnersIndexes.includes(k)) continue
				// add up the number of votes
				tally[k] += quota * b[k] / maxscore
			}
		}
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
			text += "Round " + (n+1);
			text += "<br>";
			for(var i=0; i<district.candidates.length; i++){
				var c = district.candidates[i].id;
				text += model.icon(c)+" got "+_percentFormat(district, tally[i])+"<br>";
			}
			text += "<br>";
			text += '</div>'
		}
		// who won this round?
		var roundWinners = _countWinner(tally) // need to exclude twice-winners
		if (model.opt.breakWinTiesMultiSeat) {
			roundWinners = roundWinners[Math.floor(Math.random() * roundWinners.length)]
			roundWinners = [roundWinners]
		}
		roundWinners = roundWinners.map(x => Number(x))
		roundWinners.forEach(x => winnersIndexes.push(Number(x)))
		roundWinnersId = roundWinners.map( x => district.candidates[x].id)
		roundWinnersId.forEach(x => winners.push(x))

		// subtract off the quota
		for (var i=0; i < roundWinners.length; i++) {
			var winnerIndex = roundWinners[i]
			var sum = tally[winnerIndex]
			var rep = v.length / sum / seats
			for (var k=0; k < v.length; k++) { 
				var b = v[k].b
				q[k] -= rep * b[winnerIndex] / maxscore // we could just multiply by b[wI]
			}
		}
		if (options.sidebar) {
			var roundHistory = {
				winners: roundWinners,
				q:q,
				tally:tally
			}
			history.rounds.push(roundHistory)
		}
	}

	
	if(options.sidebar) {
		text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
		text += "Final Winners:";
		text += "<br>";
		for(var i=0; i<winners.length; i++){
			var c = winners[i]
			text += model.icon(c)+" ";
		}
		text += "<br>";
		text += "<br>";
		text += '</div>'
	}
	
	var result = _result(winners,model)
	if (options.sidebar) {
		result.history = history
		
		result.text = text

		result.eventsToAssign = [] // we have an interactive caption
		// attach caption hover functions
		for (var i=0; i < n+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}
	return result
}

Election.toptwo = function(district, model, options){ // not to be confused with finding the top2 in a poll, which I already made as a variable

	options = options || {};

	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"plurality")

	// Tally the approvals & get winner!
	var tally1 = _tally(district,model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	var sortedtally = _sortTally(tally1)
	var toptwo = sortedtally.slice(0,2)
	
	// ties.  Who matched the scores of the top two? (I'm not sure of the official way to break ties.)
	var winningscores = toptwo.map(x => tally1[x])
	toptwo = sortedtally.filter(x => winningscores.includes(tally1[x]))
	

	// only do 2 candidates
	var oldcandidates = district.candidates
	district.candidates = district.candidates.filter( x => toptwo.includes(x.id)) 
	for(var j=0; j<model.voterGroups.length; j++){
		model.voterGroups[j].update();
	}
	var tally = _tally(district,model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	district.candidates = oldcandidates

	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>top two move to 2nd round</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		text += model.icon(c)+" got "+_percentFormat(district, tally1[c])+"<br>";
	}
	text += "<br><b>2nd round</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		if (toptwo.includes(c)) text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;
	return result
};

Election.pluralityWithPrimary = function(district, model, options){
	options = options || {};

	// Tally the approvals & get winner!
	var ptallies = _tally_primary(district, model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	// if ("we gotta problem" == ptallies) {
	// 	model.result.colors = ["#aaa"]
	// 	return
	// }

	pwinners = []
	for (var i in ptallies) {
		var tally = ptallies[i]
		pwinners = pwinners.concat(_countWinner(tally))
	}

	// only do 2 candidates
	var oldcandidates = district.candidates
	district.candidates = district.candidates.filter( x => pwinners.includes(x.id)) 
	for(var j=0; j<model.voterGroups.length; j++){
		model.voterGroups[j].update();
	}
	var tally = _tally(district,model, function(tally, ballot){
		tally[ballot.vote]++;
	});

	// return original candidates and update voters' ballots 
	// TODO: make this better.
	district.candidates = oldcandidates
	var ptallies = _tally_primary(district, model, function(tally, ballot){
		tally[ballot.vote]++;
	});

	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	for (var i in ptallies) {
		var tally1 = ptallies[i]
		var ip1 = i*1+1
		text += "<b>primary for group " + ip1 + ":</b><br>";
		var pwin = _countWinner(tally1)
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += model.icon(c)+" got "+_percentFormat(district, tally1[c]);
			if (pwin.includes(c)) text += " &larr;"
			text += "<br>"
		}
		text += "<br>"
	}
	text += "<b>general election:</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		if (pwinners.includes(c)) text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;
	return result
}


Election.plurality = function(district, model, options){

	// if (model.primaries == "Yes"){
	// 	Election.pluralityWithPrimary(model, options)
	// 	return
	// }
	options = options || {};
	var result = {}

	
	if ("Auto" == model.autoPoll) polltext = doPollAndUpdateBallots(district,model,options,"plurality")

	// Tally the approvals & get winner!
	var tally = _tally(district,model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	var winners = _countWinner(tally);
	var result = _result(winners,model)
    var color = result.color
	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result


	// Caption
	var winner = winners[0];

	if(options.verbose) {
		text = "<span class='small'>";
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += model.icon(c)+": "+tally[c];
			text+=" votes";
			if(i<district.candidates.length-1) text+=", ";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		
		result.text = text;
		return result
	} else if (options.original) {
		text = "<span class='small'>";
		for(var i=0; i<district.candidates.length; i++){
			var c = district.candidates[i].id;
			text += c+": "+tally[c];
			if(i<district.candidates.length-1) text+=", ";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		
		result.text = text;
		return result

	}
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>most votes wins</b><br>";
	for(var i=0; i<district.candidates.length; i++){
		var c = district.candidates[i].id;
		text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;
	return result
};


// HELPERS:
function _getBallots(district, model){
	var ballots = [];
	for(var i=0; i<district.voterPeople.length; i++){
		var v = district.voterPeople[i]
		var b = model.voterGroups[v.iGroup].voterPeople[v.iPoint].ballot
		// var b = model.voterGroups[v.iGroup].ballots[v.iPoint]
		ballots = ballots.concat(b);
	}
	return ballots;
};

var doPollAndUpdateBallots = function(district,model,options,electiontype){

	// check to see if there is a need for checking frontrunners

	var not_f = ["zero strategy. judge on an absolute scale.","normalize"]
	var skipthis =  true
	for(var i=0;i<model.voterGroups.length;i++){ // someone is looking at frontrunners, then don't skipthis
		if (! not_f.includes(model.firstStrategy) && model.voterGroups[0].percentSecondStrategy != 100) skipthis = false
		if (! not_f.includes(model.voterGroups[i].secondStrategy) && model.voterGroups[0].percentSecondStrategy != 0) skipthis = false
	}   //not_f.includes(config.firstStrategy) && not_f.includes(config.secondStrategy)
	if (skipthis) return ""

	// just sets the frontrunners and reruns the ballots, then sets the frontrunners back to normal, but keeps the altered ballots.

	polltext = ""
	var oldkeep = model.preFrontrunnerIds // only a temporary change
	model.preFrontrunnerIds = []
	model.dm.districtsListCandidates()

	model.pollResults = undefined
	if (options.sidebar) {
		if (electiontype=="irv") {
			polltext += "A low-risk strategy in IRV is to look at who wins and make a compromise if you're not winning.  Voters look down their ballot and pick the first one that defeats the current winner head to head. <br> <br>"
			polltext += "<b>Polling first preferences: </b></br>"
			// this strategy could be further refined by voting for people who will be eliminated but who we like better
		} else {
			polltext += "<b>polling for viable candidates: </b><br>";
			//polltext += "<b>(score > " + (100*threshold/district.voterPeople.length).toFixed(0) + " = half max)</b><br>"
		}
	}
	for (var k=0;k<5;k++) { // do the polling many times
			
		// get the ballots (hold the poll)
		for(var i=0; i<model.voterGroups.length; i++){
			var voter = model.voterGroups[i];
			voter.update();
		}

		// count the votes in the poll

		if (electiontype == "score") {
			// Tally
			var tally = _tally(district,model, function(tally, ballot){
				for(var candidate in ballot){
					tally[candidate] += ballot[candidate];
				}
			});
		} else if (electiontype=="approval"){ 
			// Tally the approvals & get winner!
			var tally = _tally(district,model, function(tally, ballot){
				var approved = ballot.approved;
				for(var i=0; i<approved.length; i++) tally[approved[i]]++;
			});
		} else if (electiontype=="plurality"){
			var tally = _tally(district,model, function(tally, ballot){
				tally[ballot.vote]++;
			});
		} else if (electiontype=="irv"){

			// for the report, get the first preferences
			var pre_tally = _tally(district,model, function(tally, ballot){
				var first = ballot.rank[0]; // just count #1
				tally[first]++;
			});

			var options2 = {dontpoll:true, sidebar:true}
			Election.irv(district,model,options2) // do an IRV election to find out who wins
			
			/// Get really good polling results.
			temp1 = model.pollResults // doing a poll without strategy.  not sure if this would work
			model.pollResults = undefined
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				voter.update();
			}
			var ballots = _getBallots(district, model) // kinda double effort here but okay
			head2head = {}
			// For each combination... who's the better ranking?
			for(var i=0; i<district.candidates.length; i++){
				var a = district.candidates[i];
				head2head[a.id] = {}
				for(var j=0; j<district.candidates.length; j++){
					var b = district.candidates[j];
					// How many votes did A get?
					var aWins = 0;
					for(var m=0; m<ballots.length; m++){
						var rank = ballots[m].rank;
						if(rank.indexOf(a.id)<rank.indexOf(b.id)){
							aWins++; // a wins!
						}
					}
					head2head[a.id][b.id] = aWins
				}
			}
			model.pollResults = temp1

			tally = {head2head:head2head, firstpicks:pre_tally}
		}
		
		model.pollResults = tally

		// decide who the frontrunners are
		if (0) { // 0 - let the voters have individual thresholds
			var factor = .5
			var max1 = 0
			for (var can in tally) {
				if (tally[can] > max1) max1 = tally[can]
			}
			var threshold = max1 * factor
			var viable = []
			for (var can in tally) {
				if (tally[can] > threshold) viable.push(can)
			}

			model.preFrontrunnerIds = viable 
			model.dm.districtsListCandidates()
		}

		if(options.sidebar) {
			
			for(var i=0; i<district.candidates.length; i++){
				var c = district.candidates[i].id;
				if (electiontype == "irv"){
					polltext += model.icon(c)+""+_padAfter(3,_percentFormat(district, tally.firstpicks[c]) + ". ") + " "
				} else {
					polltext += model.icon(c)+""+ _padAfter(3,_percentFormat(district, tally[c]/model.voterGroups[0].voterModel.maxscore) + ".") + " "
					//if (tally[c] > threshold) polltext += " &larr;"//" <--"
					//polltext += "<br>"
				}
			}
			polltext += "<br>"
		}
		// end of one poll
	}		
	if (electiontype == "irv") polltext += "<br>"
	// get the ballots
	for(var i=0; i<model.voterGroups.length; i++){
		var voter = model.voterGroups[i];
		voter.update();
	}
	if (options.sidebar){
		// model.draw() // not sure why this was here
	}
	if (1) {
		model.preFrontrunnerIds = oldkeep // something interesting happens when you turn this off.
		model.dm.districtsListCandidates()
	}

	return polltext
}


var _tally = function(district, model, tallyFunc){

	// Create the tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;
	
	// Count 'em up
	var ballots = model.voterSet.getBallotsDistrict(district)
	for(var i=0; i<ballots.length; i++){
		tallyFunc(tally, ballots[i]);
	}

	// only keep the candidates that are in the current list.
	trim_tally = {}
	for (var i = 0; i < district.candidates.length; i++) {
		var cid = district.candidates[i].id
		trim_tally[cid] = tally[cid]
	}


	// Return it.
	return trim_tally;

}

var _tally_primary = function(district, model, tallyFunc){

	var primaries_tallies = []
	var oldcandidates = district.candidates// temporary change
	caninprimary = []
	for ( var j = 0; j < model.voterGroups.length; j++){
		caninprimary.push([])
	}
	
	for (var c in district.candidates){
		var can = district.candidates[c]
		var maxdist2 = Infinity
		var votebelong = 0
		for ( var j = 0; j < model.voterGroups.length; j++){
			var dist2 = distF2(model, model.voterGroups[j], can)
			// var dx = model.voterGroups[j].x - can.x
			// var dy = model.voterGroups[j].y - can.y
			// var dist2 = dx*dx + dy*dy
			if (dist2 < maxdist2) {
				votebelong = j
				maxdist2 = dist2
			}
		}
		caninprimary[votebelong].push(district.candidates[c])
	}

	// make sure there are candidates in each primary
	// problem = false
	// for ( var j in caninprimary){
	// 	if (caninprimary[j].length == 0) problem = true
	// }
	// if (problem) return "we gotta problem"

	for ( var j = 0; j < model.voterGroups.length; j++){
		
		// Create the tally
		var tally = {};
		for(var candidateID in model.candidatesById) tally[candidateID] = 0;

		// Count 'em up
		district.candidates = caninprimary[j]	
		if (district.candidates.length == 0) district.candidates = oldcandidates // workaround
		model.voterGroups[j].update()
		var ballots = model.voterSet.getBallotsCrowdAndDistrict(j,district)
		for(var i=0; i<ballots.length; i++){
			tallyFunc(tally, ballots[i]);
		}
		primaries_tallies.push(tally)
	}
	district.candidates = oldcandidates // reset
	// Return it.
	model.drawArenas()
	return primaries_tallies;

}


var _tally_i = function(district, model, tallyFunc){

	// Create the tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	// Count 'em up
	var ballots = model.voterSet.getBallotsDistrict(district)
	for(var i=0; i<ballots.length; i++){
		tallyFunc(tally, ballots[i], i);
	}

	// Return it.
	return tally;

}

var _tallies = function(district, model, levels){

	// Create the tally
	var tallies = [];
	for (var level=0; level<levels; level++) {
		var tally = {};
		for(var candidateID in model.candidatesById) tally[candidateID] = 0;
		tallies.push(tally)
	}

	// Count 'em up
	var ballots = model.voterSet.getBallotsDistrict(district)
	for(var i=0; i<ballots.length; i++){
		var ballot = ballots[i]
		for(var candidate in ballot){
			tallies[ballot[candidate]][candidate] += 1;
		}
	}

	// Return it.
	return tallies;

}

var _countWinner = function(tally){

	// TO DO: TIES as an array?!?! // attempted

	var highScore = -1;
	var winners = [];

	for(var candidate in tally){
		var score = tally[candidate];
		if(score>highScore) {
			winners = [];
		}
		if(score>=highScore){
			highScore = score;
			winners.push(candidate);
		}
	}

	return winners;

}

var _sortTally = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})
	
	return frontrunners
}

var _sortTallyRev = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return -tally[b]+tally[a]})
	
	return frontrunners
}

var _countLoser = function(tally){

	// TO DO: TIES as an array?!?!

	var lowScore = Infinity;
	var winner = null;

	for(var candidate in tally){
		var score = tally[candidate];
		if(score<lowScore) {
			winners = [];
		}
		if(score<=lowScore){
			lowScore = score;
			winners.push(candidate);
		}
	}
	return winners;
}

var _colorsWinners = function(winners,model){
	return winners.map( x => (x) ? model.candidatesById[x].fill : "" );
}

function _oneColor(colors){
	if (colors.length > 1) {
		return "#ccc"; // grey
	} else {
		return colors[0]
	}
}

function _result(winners,model) {
	result = {}
    var colors = _colorsWinners(winners,model)
    var color = _oneColor(colors)
    result.winners = winners
    result.colors = colors
    result.color = color
	return result
}


function _tietext(model,winners) {
	text = "";
	for ( var i=0; i < winners.length; i++) {
		if(i) {
			text += " and ";
		} 
		text += model.icon(winners[i]); 
	}
	text += " tie<br>";
	text += "</span>";
	text += "<br>";	
	text += "<b>TIE</b>";
	return text;
}

function _percentFormat(district,count) {
	var a = "" + (100*count/(district.voterPeople.length)).toFixed(0)
	var dopadding = false
	if (dopadding) {
		for (var i = a.length; i < 2; i ++) {
			a = "&nbsp;&nbsp;" + a
		}	
	}
	return a
}

function _padBefore(padding,a){
	for (var i = a.length; i < padding; i ++) {
		a = "&nbsp;&nbsp;" + a
	}	
	return a
}
function _padAfter(padding,a){
	for (var i = a.length; i < padding; i ++) {
		a = a + "&nbsp;&nbsp;"
	}	
	return a
}

function _drawBars(iDistrict, arena, model, round) {
	// sort the voters
	// according to x

	var v = model.getSortedVoters()
	// get only the sorted voters for this district.
	v = v.filter(x => x.iDistrict == iDistrict)
	var v2 = []
	// draw only the district's voters
	model.districtIndexOfVoter = []
	for (var i = 0; i < v.length; i++) {
		model.districtIndexOfVoter[model.district[iDistrict].voterPeople[i].iAll] = i
	}

	// There are two sorts here... one for all voters and one for the district
	// we want to use the one for all voters... and we want to get data that is based on the one for the districtq[]
	// definitions
	//   q[iAll] or q[iDistSort]
	//   district[].voterPeople[iDistSort]
	//   iAll = district[].voterPeople[iDistSort].iAll
	//   v[iTSP]
	//   iAll = orderOfVoters[iTSP]
	//   iDistSort = model.districtIndexOfVoter[iAll]


	// for votes cast, draw rectangles
	var lineHeight = 6
	var width = arena.canvas.width 
	// need to make a rectangle for displaying.
	var widthRectangle = width / v.length
	var heightRectangle = Math.min(300 / model.candidates.length, 300/10)
	
	if (0) { // do later
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			for (var k = 0; k < b.length; k++) {
				if (b[k] == 1) {

					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)

					var top = Math.round((k+1/2) * heightRectangle - lineHeight / 2)
					var bottom = Math.round((k+1/2) * heightRectangle + lineHeight / 2)
					
					var color = model.candidates[k].fill
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
				}
			}
		}
	}


	heightRectangle = 100


	// draw background for quota and build
	var base = 600
	var left = 0
	var right = width
	var top = base - heightRectangle
	var bottom = base
	if (0) {
		var color = "#492"
		arena.ctx.fillStyle = color
	} else {
		var g = arena.ctx.createLinearGradient(0,top,0,bottom)
		g.addColorStop(0,"#ccc")
		g.addColorStop(1,"black")
		arena.ctx.fillStyle = g
	}
	arena.ctx.fillRect(left,top,right-left,bottom-top)
	//arena.ctx.fill()


	
	// calculate quota and build
	var w = model.result.winners
	var seats = model.seats//w.length // how many seats there are to fill.... just count the number of winners
	var q = []
	var build = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
		build.push(0)
	}

	var baralpha = .8
	arena.ctx.globalAlpha = baralpha


	if (model.system == "STV") {
		var hacknum = 1
	} else {
		var hacknum = 0
	}
	for (var r=0; (round == -1 && r < model.result.history.rounds.length-hacknum) || (round > -1 && r < round-1); r++) {
		var thisround = model.result.history.rounds[r]
		var w = thisround.winners
		if (w.length == 0) continue
		for (var i=0; i < w.length; i++) {
			// how many people voted for each winner?
			var winnerIndex = w[i]
			if (model.system == "STV") {
				var tally = thisround.tally
				var sum = tally[model.candidates[winnerIndex].id] // TODO doublecheck
			} else {
				var sum = 0
				for (var k=0; k < v.length; k++) {
					var b = v[k].b
					var support = b[winnerIndex] / model.result.history.maxscore
					sum += support // add the vote to the candidate
				}
			}
			var rep = v.length / sum / seats

			for (var k=0; k < v.length; k++) { // subtract the winners from each voter's quota
				
				if (model.system == "STV") {
					var b = v[k].b
					for (var m = 0; m < b.length; m++) {
						var c = b[m]
						if (thisround.stillin.includes(c)) break
						// go through the list of people the voter voted for in order until we get to one that is still in the race
					}
					if (c == winnerIndex) {
						var support = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[k]]]
					} else {
						var support = 0
					}
				} else { // a scoring system
					var b = v[k].b
					var support = b[winnerIndex] / model.result.history.maxscore
				}
			
				if (support > 0) {
					// draw the build

					var left = Math.round(k * widthRectangle)
					var right = Math.round((k+1) * widthRectangle)
					var top = Math.round(base-(build[k] + rep*support) * heightRectangle)
					var bottom = Math.round(base-build[k] * heightRectangle)
					var bucket = Math.round(base- heightRectangle) // where the shadows start

					// white background for bar
					arena.ctx.globalAlpha = 1
					arena.ctx.fillStyle = "white"
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
					arena.ctx.globalAlpha = baralpha

					var color = model.candidates[winnerIndex].fill
					arena.ctx.fillStyle = color

					var greyedout = .2
					if (bottom > bucket) { // bottom is in bucket
						if (top < bucket) { // top is out of bucket
							arena.ctx.fillRect(left,bucket,right-left,bottom-bucket)
							arena.ctx.fill()
							arena.ctx.globalAlpha = greyedout
							arena.ctx.fillRect(left,top,right-left,bucket-top)
							arena.ctx.fill()
						} else { // entirely in bucket
							arena.ctx.fillRect(left,top,right-left,bottom-top)
							arena.ctx.fill()
						}
					} else { // entirely out of bucket
						arena.ctx.globalAlpha = greyedout
						arena.ctx.fillRect(left,top,right-left,bottom-top)
						arena.ctx.fill()
					}
					arena.ctx.globalAlpha = baralpha

					// calculate the next step
					q[k] -= rep*support
					build[k] += rep*support
				}
			}
		}
	}
			
	arena.ctx.globalAlpha = 1

	if (0){ // don't draw the weight.. for now
		if (model.system == "RRV" || model.system == "RAV") {
			var startpos = 450
			// draw the quota
			for (var i=0; i < q.length; i++) {
				var quota = Math.max(q[i],0)
				if (r==0) {
					var quota = 1
				} else {
					var quota = Math.max(model.result.history.rounds[r-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
				}
				var left = Math.round(i * widthRectangle)
				var right = Math.round((i+1) * widthRectangle)
				var top = Math.round(startpos - 1 * heightRectangle)
				var bottom = Math.round(startpos - (1-quota) * heightRectangle)
				arena.ctx.fillStyle = "#ccc"
				arena.ctx.fillRect(left,top,right-left,bottom-top)
				arena.ctx.fill()
	
			}
			// draw line at bottom
			var yLine = bottom
			var ctx = arena.ctx
			ctx.beginPath();
			ctx.moveTo(0,yLine*2);
			ctx.lineTo(ctx.canvas.width,yLine*2);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#888";
			ctx.stroke();
	
			_drawStroked("Weight",70,400,40,arena.ctx)
		}
	}

	// draw votes for each candidate in this round
	var pos = 170
	heightRectangle = 30	
	
	heightRectangle = Math.min(200 / model.candidates.length, 200/5)
	

	if (model.system == "STV") {
		var rowFunction = "rounds"
		// var rowFunction = "candidates"

		// use order
		// use order with history
		// use calculations from before, in the voting system
		// grey out the ones that were eliminated that we voted for
		
		if (round == -1) {
			var r = model.result.history.rounds.length - 1
		} else {
			var r = round - 1
		}


		if (rowFunction == "rounds") {
			// loop through all the rounds we want to see
			for (var m = 0	; m <= r; m++) {
				var thisround = model.result.history.rounds[m]

				// who is still in the race
				var stillin = thisround.stillin

				// for each voter
				for (var i = 0; i < v.length; i++) {
					var b = v[i].b
					if (r==0) {
						var quota = 1
					} else {
						var quota = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[i]]]
					}

					// find who we are voting for
					for (var k = 0; k < b.length; k++) {
						var c = b[k]
						if (stillin.includes(c)) {
							var color = model.candidates[c].fill
							break
						}
					}

					// determine where to draw
					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)
					var middle = Math.round(pos+(m+quota*1) * heightRectangle)
					var middle2 = Math.round(pos+(m+1-quota) * heightRectangle)
					var top = Math.round(pos+(m) * heightRectangle)
					var bottom = Math.round(pos+(m+1) * heightRectangle)

					// draw candidate color
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
					
					// draw amount of support
					arena.ctx.fillStyle = "white"
					supportMethod = "useTransparency"
					if (supportMethod == "useTransparency") {
						arena.ctx.globalAlpha = 1-quota
						var width = right-left
						var height = bottom-top
						arena.ctx.fillRect(left,top,width,height)
					} else { // "useVertical"
						arena.ctx.globalAlpha = .7
						var topdown = true
						if (topdown) {
							arena.ctx.fillRect(left,middle,right-left,bottom-middle)
						} else {
							arena.ctx.fillRect(left,top,right-left,middle2-top)
						}
					}
									
					arena.ctx.globalAlpha = 1
				}

			}
		} else {
			var thisround = model.result.history.rounds[r]
	
			var stillin = thisround.stillin
			// who is still in the race
			for (var i = 0; i < v.length; i++) {
				var b = v[i].b
				if (r==0) {
					var quota = 1
				} else {
					var quota = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[i]]]
				}
	
				for (var k = 0; k < b.length; k++) {
					var c = b[k]
					// determine where to draw
					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)
	
					var middle = Math.round(pos+(c+quota*1) * heightRectangle)
					var middle2 = Math.round(pos+(c+1-quota) * heightRectangle)
					var top = Math.round(pos+(c) * heightRectangle)
					var bottom = Math.round(pos+(c+1) * heightRectangle)
					
					var color = model.candidates[c].fill
					if (stillin.includes(c)) {
						// draw support in color
					} else {
						// draw support in grey
						// var color = "#ccc"
						middle = top // just solid grey, no quota stuff
					}
	
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
					
					arena.ctx.globalAlpha = .7
					arena.ctx.fillStyle = "white"
					if (1) {
						arena.ctx.fillRect(left,middle,right-left,bottom-middle)
					} else {
						arena.ctx.fillRect(left,top,right-left,middle2-top)
					}
									
					arena.ctx.globalAlpha = 1
	
					if (stillin.includes(c)) {
						break
						// go through the list of people the voter voted for in order until we get to one that is still in the race
					}
				}
			}
	

		}


	} else {
		
		// var rowFunction = "rounds"
		var rowFunction = "candidates"

		if (rowFunction == "rounds") {
			heightRectangle /= (r+1)
			for (var m = 0	; m <= r; m++) {
						
				for (var i = 0; i < v.length; i++) {
					var b = v[i].b
					if (model.system == "QuotaApproval" || model.system == "QuotaScore") { // workaround for now
						var quota = Math.max(q[i],0)
					} else {
						if (m==0) {
							var quota = 1
						} else {
							var quota = Math.max(model.result.history.rounds[m-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
						}
					}
					
					for (var k = 0; k < b.length; k++) {
						
						var support = b[k] / model.result.history.maxscore
						if (support > 0) {
							var left = Math.round(i * widthRectangle)
							var right = Math.round((i+1) * widthRectangle)
			
							var interleaveCandidates = false
							if (interleaveCandidates) {
								var g = m * b.length + k
							} else {
								var g = m + k * (r+1)
							}
							var middle = Math.round(pos+(g+quota*support) * heightRectangle)
							var middle2 = Math.round(pos+(g+1-quota) * heightRectangle)
							var top = Math.round(pos+(g) * heightRectangle)
							var useHeight = true
							if (useHeight) { // for STV, support = 1
								var bottom = Math.round(pos+(g+support) * heightRectangle)
							} else {
								var bottom = Math.round(pos+(g+1) * heightRectangle)
							}
							
							var color = model.candidates[k].fill
							arena.ctx.fillStyle = color
							arena.ctx.fillRect(left,top,right-left,bottom-top)
							arena.ctx.fill()
							
							// draw amount of support
							arena.ctx.fillStyle = "white"
							supportMethod = "useTransparency"
							if (supportMethod == "useTransparency") {
								arena.ctx.globalAlpha = (1-quota) * support
								var width = right-left
								var height = bottom-top
								arena.ctx.fillRect(left,top,width,height)
							} else { // "useVertical"
								arena.ctx.globalAlpha = .7
								var topdown = true
								if (topdown) {
									arena.ctx.fillRect(left,middle,right-left,bottom-middle)
								} else {
									arena.ctx.fillRect(left,top,right-left,middle2-top)
								}
							}
											
							arena.ctx.globalAlpha = 1
						}
					}
				}
			}

		} else {
			for (var i = 0; i < v.length; i++) {
				var b = v[i].b
				if (model.system == "QuotaApproval" || model.system == "QuotaScore") { // workaround for now
					var quota = Math.max(q[i],0)
				} else {
					if (r==0) {
						var quota = 1
					} else {
						var quota = Math.max(model.result.history.rounds[r-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
					}
				}
				
				for (var k = 0; k < b.length; k++) {
					
					var support = b[k] / model.result.history.maxscore
					if (support > 0) {
						var left = Math.round(i * widthRectangle)
						var right = Math.round((i+1) * widthRectangle)
		
						var middle = Math.round(pos+(k+quota*support) * heightRectangle)
						var middle2 = Math.round(pos+(k+1-quota) * heightRectangle)
						var top = Math.round(pos+(k) * heightRectangle)
						var bottom = Math.round(pos+(k+support) * heightRectangle)
						
						var color = model.candidates[k].fill
						arena.ctx.fillStyle = color
						arena.ctx.fillRect(left,top,right-left,bottom-top)
						arena.ctx.fill()
						
							// draw amount of support
							arena.ctx.fillStyle = "white"
							// var supportMethod = "useTransparency"
							var supportMethod = "useVertical"
							if (supportMethod == "useTransparency") {
								arena.ctx.globalAlpha = (1-quota) * support
								var width = right-left
								var height = bottom-top
								arena.ctx.fillRect(left,top,width,height)
							} else { // "useVertical"
								arena.ctx.globalAlpha = .7
								var topdown = true
								if (topdown) {
									arena.ctx.fillRect(left,middle,right-left,bottom-middle)
								} else {
									arena.ctx.fillRect(left,top,right-left,middle2-top)
								}
							}
										
						arena.ctx.globalAlpha = 1
					}
				}
			}
		}
	
	}

	// labels
	if (rowFunction == "rounds") {
		_drawStroked("Votes by Round",10,150,40,arena.ctx,"start")
	} else {
		_drawStroked("Votes",10,150,40,arena.ctx,"start")
	}
	_drawStroked("Power",10,480,40,arena.ctx,"start")
	
}

function _percentileToX(percentile,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	var indexPercentile = (v.length-1) * percentile/100 // fine tuning TODO
	// linear interpolation
	var indexLeft = Math.floor(indexPercentile)
	var frac = indexPercentile - indexLeft
	var indexRight = indexLeft + 1
	indexRight = Math.min(indexRight,v.length-1)
	var left = v[indexLeft].x
	var right = v[indexRight].x
	var xNew = left + frac * (right - left)
	return xNew
}

function _percentileToY(percentile,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	var indexPercentile = (v.length-1) * percentile/100 // fine tuning TODO
	// linear interpolation
	var indexLeft = Math.floor(indexPercentile)
	var frac = indexPercentile - indexLeft
	var indexRight = indexLeft + 1
	indexRight = Math.min(indexRight,v.length-1)
	var left = v[indexLeft].y
	var right = v[indexRight].y
	var yNew = left + frac * (right - left)
	return yNew
}

function _xToPercentile(x,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	for (var k = 0; k < v.length; k++) {
		if (x < v[k].x) break
	}
	var iLeft = k - 1
	iLeft = Math.max(iLeft,0)
	var iRight = k
	iRight = Math.min(iRight,v.length-1)
	var left = v[iLeft].x
	var right = v[iRight].x
	if (right == left) {
		var frac = 1
	} else {
		var frac = (x - left) / (right - left)
	}
	var indexP = iLeft + frac * (iRight - iLeft)
	var percentile =  indexP / v.length * 100
	return percentile
}

_check01 = function(district,model) {
	result = {good:false}
	if (district.candidates.length === 0) {
	    result = _result([],model)
		result.text = "Nobody ran.";
	} else if (district.candidates.length === 1) {
	    result = _result([district.candidates[0].id],model)
		result.text = "Uncontested.";
	} else {
		result.good = true
	}
	return result
}