"use strict";

const Path = require("path");
const fs = require("fs");

const ActionsManager = require("./lib/actionsmanager");
const RequestBootstrap = require("./lib/requestbootstrap");
const ParseUrl = require("./lib/urlactionsparser");
const ActionsChecker = require("./lib/actionschecker");
const ActionsParser = require("./lib/actionsparser.js");
const FilesManager = require("files-repo");
const Utils = require("./lib/utils");
const PathHash = require("./lib/pathhash.js");

let _config;
let _cachedFilesManager;
let _tmpFilesManager;

let DEFAULT_PREFIX = "picly";
let DEFAULT_SUFIX = "resource";
let DEFAULT_FILESREPOSITORY_CACHED = "cached";
let DEFAULT_FILESREPOSITORY_TMP = "tmp";
let DEFAULT_FILESREPOSITORY_SIZE = 2;

function ParseRequest( pathToResource ) {
    let urlParsed = ParseUrl.parseUrl(pathToResource, _config.sufix);
    urlParsed.entity = Path.join( _config.pathToResources, urlParsed.entity );

    // Check aliases, if present, translate for their actions
    if ( _config.aliases ) {
        for( let i = 0; i < urlParsed.actions.length; i++ ) {
            let action = urlParsed.actions[i];

            if( _config.aliases[action] ) {
                urlParsed.actions[i] = _config.aliases[action];
            }
        }
    }

    return urlParsed;
}

async function PiclyRequest( urlParsed ) {
    try 
    {
        return await RequestBootstrap.processRequest( urlParsed, ActionsManager, _tmpFilesManager );
    } catch(err) {
        throw Error(err);
    }
}

function cacheResource() {
    return _config.cache && _config.cache == true;
}

function verbose() {
    return _config.verbose && _config.verbose == true;
}

async function PerformRequestAndCache( res, urlParsed, pathHash ) {
    try {
        if ( (await Utils.fileExists(urlParsed.entity)) ) {
            let resource = await PiclyRequest( urlParsed );
            await _cachedFilesManager.AddExistingFile( resource.entityFullPath, pathHash );
          
            res.sendFile( resource.entityFullPath );    
        } else {
            res.status(404).send("Resource not found");
        }
    }
    catch(err) {
        res.status(500).send(err.message);
    }
}

async function PerformRequestNoCache( res, urlParsed ) {
    try {
        if ( (await Utils.fileExists(urlParsed.entity)) ) {
            let resource = await PiclyRequest( urlParsed );
            res.sendFile( resource.entityFullPath );    
        } else {
            res.status(404).send("Resource not found");
        }
    }
    catch(err) {
        res.status(500).send(err.message);
    }
}

async function Express_middleware( req, res, next ) {
    try {
        if ( req.path.startsWith( _config.prefix ) ) {
            let urlParsed = ParseRequest( req.path );
    
            if ( cacheResource() ) {            
                let pathHash = PathHash.GetHashFromPath( req.path );
                let existsCompiledFiles = await _cachedFilesManager.ExistsFile( pathHash );
                
                if ( existsCompiledFiles ) {
                    let fullPathToFile = await _cachedFilesManager.GetFullPathToFile( pathHash );
                    res.sendFile(fullPathToFile);
                } else {
                    PerformRequestAndCache( res, urlParsed, pathHash );
                }
            } else {
                PerformRequestNoCache( res, urlParsed );
            }
        } else { 
            next(); 
        }
    } catch(err) {
        res.status(500).send(err.message);
    }
}

function checkPathConfig( msg, param ) {
    if ( !param ) throw Error(`${msg} parameter undefined in middleware configuration` );    
    if ( !fs.existsSync(param) ) throw Error(`${msg} doesn't exist` );
}

function checkMiddlewareConfig(config) {
    checkPathConfig( "Path to resources", config.pathToResources);    
    checkPathConfig( "Path to addins repository", config.pathToAddins);
    checkPathConfig( "Path to files repository", config.pathToFilesRepository);
}

function checkAliases(aliases) {
    if ( aliases ) {
        for( let alias of Object.keys(aliases) ) {
            let action = aliases[alias];
            let actionParsed = ActionsParser.parseAction(action);

            if ( !ActionsChecker.checkAction( actionParsed, ActionsManager ) ) {
                console.info(`Bad configuration of alias '${alias}'. Check addin configuration of '${action}'`)
            }
        }
    }
}

module.exports = function( config ) {
    try
    {
        checkMiddlewareConfig(config);
    
        let pathToCachedFilesRepository = Path.join(config.pathToFilesRepository, DEFAULT_FILESREPOSITORY_CACHED );
        let pathToTmpFilesRepository = Path.join(config.pathToFilesRepository, DEFAULT_FILESREPOSITORY_TMP );

        _config = config;
        _config.prefix = `/${config.prefix ? config.prefix : DEFAULT_PREFIX}/`;
        _config.sufix = config.sufix ? config.sufix : DEFAULT_SUFIX;
        _cachedFilesManager = FilesManager( { Path: pathToCachedFilesRepository, 
                                              Size: DEFAULT_FILESREPOSITORY_SIZE });
        _tmpFilesManager = FilesManager( { Path: pathToTmpFilesRepository, 
                                           Size: DEFAULT_FILESREPOSITORY_SIZE,
                                           RemoveOlderFiles: 60 });
    
        // Init addins manager asynchronously and files repository folders
        (async function() {
            await Utils.ensureDir(pathToCachedFilesRepository);
            await Utils.ensureDir(pathToTmpFilesRepository);
    
            let addinsDetected = await ActionsManager.init( _config.verbose, config.plugins );
    
            if ( verbose() ) {
                if ( addinsDetected ) {
                    console.log( `${addinsDetected} addins detected in picly middleware`);
                } else {
                    console.log( "No addins detected in plugin middleware" );
                }
            }
    
            checkAliases(config.aliases);
        })();
    
        return Express_middleware;
    }
    catch(err) {
        throw err;
    }
}