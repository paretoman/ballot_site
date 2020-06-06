// Each sandbox() makes a new Loader.  The Loader is configured with an .onload and updated with .load.
// Then all the Loaders call the LoaderManager to say what files they need and to give a countdown function _onAssetLoad
// LoaderManager calls the countdown for each Loader each time an image loads.
// When the countdown reaches 0, the .onload's run


var LoaderManager = new function() {
	var self = this;
	var alreadyLoaded = []
	var alreadyRequested = []
	var assets = {}
	var onloads = {} // list of callbacks to do once the image loads
	
	self.request = function(src,f) {
		if (alreadyLoaded.includes(src)) {
			f(src,assets[src]) // do the call back now
		} else if (alreadyRequested.includes(src)) {
			onloads[src].push(f)  // do the callback later
		} else {
			alreadyRequested.push(src)
			onloads[src] = []
			onloads[src].push(f) // do the callback later

			// now do the loading
			// check filetype
			var ext = src.split('.').pop();
			if (ext == "svg") {
				// save svg as text
				var svgText
				var request = new XMLHttpRequest();
				request.open("GET", src);
				request.setRequestHeader("Content-Type", "image/svg+xml");
				request.onload = function(event) { // onload ... not load
					svgText = event.target.responseText
					loaded(src,svgText)
				}
				// request.addEventListener("load", function(event) { // onload ... not load
				// 	svgText = event.target.responseText
				// 	loaded(src,svgText)
				// });
				request.send();
			} else {
				// save image as image
				var img = new Image();
				img.onload = function() {loaded(src,img)} // send the network request for the image.
				img.src = src;
			}
		}
		
	}
	function loaded(src,img) {
		alreadyLoaded.push(src)
		assets[src] = img
		for (var i=0; i < onloads[src].length; i++) {
			onloads[src][i](src,img) // do the callback
		}
	}
}


function Loader() {
	var self = this;

	self.load = function(imagePaths){
	
		// When all images loaded, call dat callback
		var assetsToLoad = imagePaths.length;
		var ONLY_ONCE = false;
		var allAssets = {}
		var _onAssetLoad = function(src,img){
			allAssets[src] = img
			assetsToLoad--;
			if(assetsToLoad==0){
				// ONCE.
				if(ONLY_ONCE) return;
				ONLY_ONCE=true;
				self.onload(allAssets);
			}
		};
	
		// Load 'em all
		for(var i=0;i<imagePaths.length;i++){
			// send a request to LoaderManager to get an image and call back when it's done
			LoaderManager.request(imagePaths[i], _onAssetLoad)
		}
	
	};

}
