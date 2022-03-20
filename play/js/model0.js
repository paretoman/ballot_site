// Do nothing model.

// CREATE
var model = new Model("nothing")
model.simpleUI.createDOM()
// CONFIGURE
model.preFrontrunnerIds = []
// INIT
model.simpleUI.initDOM()
// INIT
model.initPlugin()
model.voterSet.init()
model.dm.redistrict()
// UPDATE
model.update()
console.log(model)