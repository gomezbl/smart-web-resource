/*
 * This module process and url and call addins needed
 */

'use strict';

let Path = require("path");

let actionsparser = require("./actionsparser");
let actionschecker = require("./actionschecker");

let RequestBootstrap = module.exports = {};

async function _checkRequest(resource, actionsManager) {
    // 1) Parse url image request
    var actionsToPerform = actionsparser.parseActions(resource.actions); // Actions to perform

    // Check if actions manager manages actions indicated in url
    if (!actionsManager.existsActions(actionsToPerform)) {
        throw Error("One or more plugins don't exist");
    }

    // 2) Check actions are well formed in url request
    for( let act of actionsToPerform ) {
        if (!actionschecker.checkAction(act, actionsManager)) {
            throw Error(`Plugin ${actionsToPerform[i].actionName} with invalid format`);
        }
    }

    return { urlProps: resource, actionsToPerform: actionsToPerform };
}

function getAddinParams( params ) {
    let result = {};

    // Build params as json object to send to addin
    for( let param of params ) {
        result[param.name] = param.value;
    }

    return result;
}

function getAddingToInvoke( addin, actionsManager ) {
    let addinToInvoke = {};

    addinToInvoke.fnc = actionsManager.getAddinByActionName(addin.actionName).handler;
    addinToInvoke.params = getAddinParams( addin.params );

    return addinToInvoke;
}

async function _performRequest(requestInfo, actionsManager, tmpFilesManager) {
    let urlProps = requestInfo.urlProps;
    let actionsToPerform = requestInfo.actionsToPerform;
    let addinsToInvoke = [];
    
    let currentEntity = urlProps.entity;
    
    // 3) Build list sequence of addin actions to call
    for( let addin of actionsToPerform ) {
        addinsToInvoke.push( getAddingToInvoke( addin, actionsManager ) );
    }

    // If no actions to manage, return source image            
    if ( !addinsToInvoke.length ) {
        return {
            compiled: false,
            entityFullPath: currentEntity
        };
    } else {
        // 4) Set source and destination entities files names with their paths
        let nextEntity;

        for( let addin of addinsToInvoke ) {
            let nextEntityManifest = await tmpFilesManager.AllocateNewFileLocation( Path.extname(currentEntity).substr(1) ); 
            nextEntity = nextEntityManifest.location;

            addin.params['sourceEntity'] = currentEntity;
            addin.params['destEntity'] = nextEntity;

            currentEntity = nextEntity;
        }

        // Invoke addins
        for( let addin of addinsToInvoke ) {
            await addin.fnc( addin.params );
        }

        return { compiled: true, entityFullPath: nextEntity };
    }
}

async function _processRequest(resource, actionsManager, pathToTmpFile ) {
    let requestInfo = await _checkRequest(resource, actionsManager)
    return _performRequest( requestInfo, actionsManager, pathToTmpFile );
}

RequestBootstrap.processRequest = async function(resource, actionsManager, tmpFilesManager ) {
    return await _processRequest(resource, actionsManager, tmpFilesManager );
}