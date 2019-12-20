"use strict"
const Express = require("express");
const App = Express();
const Path = require("path");
const SWR = require("../index.js");

const smartWebResourceConfig = {
    pathToResources : Path.join( process.cwd(), "test", "samplepictures"),
    //resourceHandler: ResourceHandler,
    //pathToFilesRepository : Path.join( process.cwd(), "test", "filesrepository" ),
    cache: false,
    verbose: true,
    prefix: "-",
    sufix: "-",
    aliases: {
        smallSize: "resize:w(100)",
        mediumSize: "resize:w(280)",
        largeSize: "resize:w(520)"
    },
    plugins: [require("swr_resize")]
}

async function ResourceHandler( resource ) {
    // Translate resource requested to final local path resource
}

App.use( SWR(smartWebResourceConfig) );

App.get ( "/", function(req,res) {
    res.send("swr express!!!");
});

App.listen( 3000, () => { console.log("Test server running at port 3000"); } );