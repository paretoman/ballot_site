var _onscroll = function(){
	var scrollY = window.pageYOffset;
	var innerHeight = window.innerHeight;
	var a = document.getElementById("splash_iframe")
	if (a == null) return
	a.contentWindow.postMessage({
		isOnScreen: (scrollY<400)
	},"*");
};
window.addEventListener("scroll",_onscroll,false);
setTimeout(_onscroll,1000);
setTimeout(_onscroll,5000);
setTimeout(_onscroll,10000);
