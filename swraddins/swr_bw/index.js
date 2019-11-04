"use strict";

const Sharp = require("sharp");

module.exports = {};

module.exports.swr = {};

module.exports.swr.info = function() {
    return {
        name: "bw",
        description: "Smart Web Resource module for convert to black & white your image",
        params: [],
        sampleO: "examples/bw_original.jpg",
        sampleM: "examples/bw_mod.jpg",
        example: ""
    }
}

module.exports.swr.perform = function(params) {
    return new Promise((res, rej) => {
        Sharp(params.sourceEntity)
            .grayscale()
            .toFile(params.destEntity, (err) => {
                if (!!err) rej(err);
                res();
            });
    })
}