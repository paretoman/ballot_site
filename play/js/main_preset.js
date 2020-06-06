main_preset()

function main_preset() {
	var url = window.location.pathname;
	var htmlname = url.substring(url.lastIndexOf('/') + 1);
	var presetName = htmlname.slice(0,htmlname.length-5)
	var ui = loadpreset(presetName)
	var preset = ui.preset
	sandbox(preset)
}
