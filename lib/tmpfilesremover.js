"use strict";

const NodeCron = require("node-cron");

const MAXSECONDSTOREMOVE = 60; // Older files are removed
const CRONJOBCONFIGURATION = "0 */1 * * * *"; // Every minute

let _filesManager;

function shouldBeRemoved( fileDate ) {
    let currentDate = new Date();

    return ((currentDate - fileDate) / 1000) > MAXSECONDSTOREMOVE;
}

async function checkFile( fileManifest ) {
    try {
        let fileDate = new Date(fileManifest.created);
    
        if ( shouldBeRemoved(fileDate) ) {
            await _filesManager.DeleteFile( fileManifest.fileId );
        }
    } catch(err) {
        console.info(`Exception when removing filed ${fileManifest}: ${err.message}`);
    }
}

async function checkTmpFilesTask() {
    await _filesManager.IterateAll( checkFile );
}

module.exports = function( FilesManager ) {
    _filesManager = FilesManager;

    NodeCron.schedule( CRONJOBCONFIGURATION, checkTmpFilesTask );
}