"use strict"
var Express = require("express");
var App = Express();
const Path = require("path");

const SWR = require("../index.js");

const smartWebResourceConfig = {
    pathToResources : Path.join( process.cwd(), "test", "samplepictures"),
    pathToFilesRepository : Path.join( process.cwd(), "test", "filesrepository" ),
    cache: false,
    verbose: true,
    prefix: "-",
    sufix: "-",
    aliases: {
        smallSize: "resize:w(100)",
        mediumSize: "resize:w(280)",
        largeSize: "resize:w(520)"
    },
    plugins: [require("../swraddins/swr_bw"),
              require("../swraddins/swr_crop"),
              require("../swraddins/swr_resize") ]
}

App.use( SWR(smartWebResourceConfig) );

App.get ( "/", function(req,res) {
    res.send("Picly express!!!");
});

App.listen( 3000 );