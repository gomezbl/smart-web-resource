"use strict";

const Sharp = require("sharp");

module.exports = {};

module.exports.picly = {};

module.exports.picly.info = function() {
    return {
        name: "bw",
        description: "Picly module for convert to black & white your image",
        params: [],
        sampleO: "examples/bw_original.jpg",
        sampleM: "examples/bw_mod.jpg",
        example: ""
    }
}

module.exports.picly.perform = function(params) {
    return new Promise((res, rej) => {
        Sharp(params.sourceEntity)
            .grayscale()
            .toFile( params.destEntity, (err) => {
                if (err) rej(err);
                else res();
            });
    })
}