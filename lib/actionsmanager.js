/* 
 * Module for loading addins modules installed in system
 */
'use strict';

var isJson = require("is-json");

var _pluginsByName = [];

var ActionsManager = module.exports = {};

function _checkAddin(plugin) {	
	let pluginInfo = plugin.swr.info();

	if ( !isJson(pluginInfo, true) ) {
		throw new Error( `Invalid plugin info: ${plugin}`);
	}
	
	// Test. Plugin with same name doesn't exist
	if ( _pluginsByName[pluginInfo.name] !== undefined ) {
		throw new Error(`Addin ${pluginInfo.name} already exists and repeated`);
	}

	if ( typeof plugin.swr.perform != 'function' ) {
		throw new Error( `Invalid plugin perform function: ${plugin}` );
	}

	// TODO: check info json schema
}

/*
 * Initilizes addins module and validates them
 * Returns a promise.
 * If success, returns the number of addins loaded
 */
ActionsManager.init = async function(verbose, plugins) {
	_pluginsByName = [];

	for( let plugin of plugins) {
		let pluginInfo = plugin.swr.info();
		
		_checkAddin( plugin );

		_pluginsByName[pluginInfo.name] = {
			info: pluginInfo,
			handler: plugin.swr.perform
		}
	}

	return plugins.length;
}

/*
 * Returns an adding given its name ( "cr", "rs", ... )
 */
ActionsManager.getAddinByActionName = function(name) {
	if ( _pluginsByName[name] === undefined ) throw new Error( `No module with action name of ${name}` );

	return _pluginsByName[name];
}

/*
 * Returns info parameter or plugin module with information
 * about params needed by plugin
 */
ActionsManager.getAddinInfo = function(name) {
	if ( _pluginsByName[name] === undefined ) throw new Error( `No module with action name of ${name}` );

	return _pluginsByName[name].info;
}

/*
 * Check if all actions indicated in params exist in actions managed by module.
 * Params: array with the actions to check:
 * [ 
 *  { actionName: 'cr' },
 *  { actionName: 'bw' }
 *  ...
 * ]
 */
ActionsManager.existsActions = function( actions ) {
	for( let i = 0; i < actions.length; i++ ) {
		if ( _pluginsByName[actions[i].actionName] === undefined ) { return false; }
	}

	return true;
}

/*
 * Check if one action exists and it is managed by module.
 * Params: json object with the action to check:
 *  { actionName: 'cr' }
 */
ActionsManager.existsAction = function( action ) {
	return _pluginsByName[action.actionName] !== undefined;
}

/*
 * Returns the associative array with all addins loaded.
 * The key of the array if the action name of the addin ("rs", "bw", etc.)
 * init() function should be called first
 */
ActionsManager.getAddinsByName = function() {
	return _pluginsByName;
}