/*
 * This module recieves an URL and parses its content with the filters, plugins
 * and actions indicated in the URL string.
 * Exports:
 * parseUrl( url ): parses and url and return results in a json with this format:
	{
		entity: file requested (like "myimage.jpg")
		actions: Array with actions with their configuration included in the url
	}
 */

'use strict';

const _ = require("underscore");

var UrlActionsParser = module.exports = {};

UrlActionsParser.parseUrl = function( path, sufix ) {	
	let parts = path.substr(1).split("/");
	parts.shift(); // Remove prefix
	let resourceIndex = _.indexOf( parts, sufix );
	
	let actions = _.first(parts, resourceIndex);
	let entity = _.last(parts, parts.length-resourceIndex-1).join("/");

	var res = {
		entity: entity,
		actions: actions
	}

	return res;
}