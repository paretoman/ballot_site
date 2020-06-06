function switcher(ui) {

    // keeps the model but switches the ui
    

    if (ui == undefined) ui = {}

    ui.update = function() {
    
    



        ui.switchedUI = false
        if (ui.uiType == "ballot") {
            main_ballot(ui)
        } else {
            sandbox(ui)
        }
        
        _insertFunctionAfter(ui.model,"onUpdate", function() {
            if (ui.switchedUI) {
                // ui.uiType = model.uiType
                ui.attach.detach()
                // delete div

                ui.update()
            }
        })
    }

    ui.update()
}
