/*
 * Validates if actions indicated in url is valid according
 * to parameters indicated in plugin.
 */
'use strict';

var ActionsChecker = module.exports = {};

/*
 * Checks if action info indicated as parameter is valid
 * according to plugin module info (type of parameters, etc.).
 * Parameters:
 * action: json object with action parsed returned by actionsparser module:
 * 	{ actionName: "...", params: [ { name: "..", value: "..."}, ...] }
 * actionsManager: instance of plugins module manager
 */
ActionsChecker.checkAction = function( action, actionsManager ) {	
	// Locate plugin
	if ( !actionsManager.existsAction( action ) ) { return false; }

	let pluginInfo = actionsManager.getAddinInfo( action.actionName );

	let actionsParams = [];
	for( let i = 0; i < action.params.length; i++ ) {
		let p = action.params[i];
		if ( actionsParams[p.name] === undefined ) {
			actionsParams[p.name] = p.value;
		} else { return false; } // Param duplicated
	}

	let pluginParams = [];
	pluginInfo.params.map( (p) => {
		pluginParams[p.name] = p;
	});

	// Check parameters indicated in action are expected by plugin
	for( let i = 0; i < action.params.length; i++ ) {
		if ( pluginParams[action.params[i].name] === undefined ) { return false; }
	}

	// Check parameters types
	for( let i = 0; i < action.params.length; i++ ) {
		let paramName = action.params[i].name;
		let paramValue = action.params[i].value;
		let paramDefinition = pluginParams[paramName];

		switch( paramDefinition.type ) {
			case "integer": {				
				if ( isNaN(paramValue) ) { return false; }
			}	
			break;
			case "string": {
				if ( typeof paramValue !== 'string' ) { return false; }
			}
			break;
		}
	}

	// Check all optionals to true are present
	for( let i = 0; i < pluginInfo.params.length; i++ ) {
		let pp = pluginInfo.params[i];

		// If "optional" doesn't exists, then parameter is mandatory.
		// If exists and is false, then parameter is mandatory
		if ( pp.optional === undefined || (pp.optional !== undefined && pp.optional === false) ) {
			if ( actionsParams[pp.name] == undefined ) { return false; }
		}
	}

	return true;
}