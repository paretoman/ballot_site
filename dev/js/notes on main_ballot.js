
	// This is an effort to make the ui more configurable.

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