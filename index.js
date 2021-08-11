"use strict";

const Path = require("path");

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

let DEFAULT_PREFIX = "swr";
let DEFAULT_SUFIX = "resource";
let DEFAULT_ROOT_FOLDER_FOR_FILES = "tmpfiles";
let DEFAULT_FILESREPOSITORY_CACHED = "cached";
let DEFAULT_FILESREPOSITORY_TMP = "tmp";
let DEFAULT_FILESREPOSITORY_SIZE = 2;

/* 
 * Returns full path to resource.
 * If resourceHandler in config is defined, then that function should translate
 * the resource requested to its final and real location.
 */
async function GetFullPathToResource( resource, resourceHandler ) {
    if ( resourceHandler ) {
        return resourceHandler(resource);
    } else {
        return Path.join( _config.pathToResources, resource );
    }
}

async function ParseRequest( pathToResource ) {
    let urlParsed = ParseUrl.parseUrl(pathToResource, _config.sufix);

    urlParsed.entity = await GetFullPathToResource( urlParsed.entity, _config.resourceHandler );

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
            let urlParsed = await ParseRequest( req.path );
    
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

function checkPathConfig( msg, path ) {
    if ( !path ) throw Error(`${msg} parameter undefined in middleware configuration` );    
    if ( !Utils.existsFolderSync(path) ) throw Error(`${msg} at ${path} doesn't exist` );
}

function checkMiddlewareConfig(config) {
    if ( !config.resourceHandler ) {
        checkPathConfig( "Path to resources", config.pathToResources);    
    }
    
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
        let cnf = Object.assign( {}, config );
        let pathToCachedFilesRepository;
        let pathToTmpFilesRepository;

        cnf.pathToFilesRepository = cnf.pathToFilesRepository ? cnf.pathToFilesRepository : Path.join( __dirname, DEFAULT_ROOT_FOLDER_FOR_FILES );
        Utils.ensureDirSync( cnf.pathToFilesRepository );

        pathToCachedFilesRepository = Path.join(cnf.pathToFilesRepository, DEFAULT_FILESREPOSITORY_CACHED );
        pathToTmpFilesRepository = Path.join(cnf.pathToFilesRepository, DEFAULT_FILESREPOSITORY_TMP );

        checkMiddlewareConfig(cnf);
    
        _config = cnf;
        _config.prefix = `/${cnf.prefix ? cnf.prefix : DEFAULT_PREFIX}/`;
        _config.sufix = cnf.sufix ? cnf.sufix : DEFAULT_SUFIX;
        _cachedFilesManager = FilesManager( { Path: pathToCachedFilesRepository, 
                                              Size: DEFAULT_FILESREPOSITORY_SIZE });

        if ( cnf.removeOlderFile && cnf.removeOlderFiles == true ) {
            _tmpFilesManager = FilesManager( { Path: pathToTmpFilesRepository, 
                                               Size: DEFAULT_FILESREPOSITORY_SIZE,
                                               RemoveOlderFiles: 60 });
        } else {
            _tmpFilesManager = FilesManager( { Path: pathToTmpFilesRepository, 
                Size: DEFAULT_FILESREPOSITORY_SIZE });
        }
    
        // Init addins manager asynchronously and files repository folders
        (async function() {
            await Utils.ensureDir(pathToCachedFilesRepository);
            await Utils.ensureDir(pathToTmpFilesRepository);
    
            if (config.removeCacheAtStartup && config.removeCacheAtStartup == true) {
                await _cachedFilesManager.EmptyRepository();
            }

            let addinsDetected = await ActionsManager.init( _config.verbose, cnf.plugins );
    
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