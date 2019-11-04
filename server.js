"use strict"
var Express = require("express");
var App = Express();
const Path = require("path");

const PiclyExpress = require("./index.js");

const piclyExpressConfig = {
    pathToResources : Path.join( __dirname, "test", "samplepictures"),
    pathToFilesRepository : Path.join( __dirname, "test", "filesrepository" ),
    pathToAddins : Path.join( __dirname, "picly_addins"),
    cache: false,
    verbose: true,
    prefix: "-",
    sufix: "-",
    aliases: {
        smallSize: "resize:w(100)",
        mediumSize: "resize:w(280)",
        largeSize: "resize:w(520)"
    },
    plugins: [require("./picly_addins/picly_bw/picly_bw.js"),
              require("./picly_addins/picly_crop/picly_crop.js"),
              require("./picly_addins/picly_resize/picly_resize.js") ]
}

App.use( PiclyExpress(piclyExpressConfig) );

App.get ( "/", function(req,res) {
    res.send("Picly express!!!");
});

App.listen( 3000 );