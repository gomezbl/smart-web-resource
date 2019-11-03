/*
 * Module to parse plugins invoked in a url
 */

'use strict';

const extractValues = require("extract-values");
const ActionsParser = module.exports = {};

ActionsParser.parseAction = function( action ) {
	var partials = extractValues( action, "{actionname}:{actionparams}" );
	var a = {};

	if ( partials == null ) { partials = extractValues( action, "{actionname}" ); }

	a.actionName = partials.actionname;
	a.params = [];

	if ( partials.actionparams !== undefined ) {
		var s = partials.actionparams.split(","); 
		for( let i = 0; i < s.length; i++ ) {
			var actionparam = s[i];
			var param = extractValues( actionparam, "{name}({value})");

			a.params.push( {
				name: param.name,
				value: decodeURIComponent(param.value)
			})
		}
	}

	return a;
}

/*
 * Parse a string with plugins configuration such as /resize:w(100)/bw/...
 * Returns an array with action names and params like:
 * [ { actionName: 'cr',
 *     actionParams: [ { name: 'w', value: '180'}, ... ] },
 * 	 ...
 * ]
 */
ActionsParser.parseActions = function( actions ) {
	var res = [];
	
	for( let j = 0; j < actions.length; j++ ) {
		res.push( ActionsParser.parseAction(actions[j]) );
	}

	return res;
}