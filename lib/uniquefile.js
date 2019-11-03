/* 
 * This modules generates de unique name for a file adding to its
 * base name an unique identifier.
 * For example: sandra.jpg -> sandra_eu239xs.jpg
 */

'use strict';

var path = require("path");
var util = require("util");

// Images ids are proveded in final name given to the image file; it should prevents
// to use "_" due to in some cases, image id is extracted from url request
const IDSCHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-=";
var shortId = require("shortid")
shortId.characters(IDSCHARACTERS);

const RESERVEDCHARACTERS = " _/?<>\:*|\"'";

var UniqueFile = module.exports = {};

/*
 * Returns the file name given as parameter with a new and unique name and its
 * unique ID assigned in a json: 
 * {
 *    filename: <new file name>,
 *    id: unique id for the file
 * }
 */
UniqueFile.generateUniqueName = function(filename) {
    if (filename.length == 0) {
        throw new Error(util.format("Invalid file name of '%s'", filename));
    }

    var ext = path.extname(filename);
    var name = path.basename(filename, ext);
    var id = shortId.generate();

    for (let i = 0; i < RESERVEDCHARACTERS.length; i++) {
        name = name.split(RESERVEDCHARACTERS[i]).join("-");
        ext = ext.split(RESERVEDCHARACTERS[i]).join("-");
    }

    return {
        filename: util.format("%s_%s%s", name, id, ext),
        id: id
    };
}

UniqueFile.isValid = function(id) {
    return id.length <= 12;
}