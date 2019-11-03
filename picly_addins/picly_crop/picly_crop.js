"use strict";

var gm = require("gm");

module.exports = {};

module.exports.picly = {};

module.exports.picly.info = function() {
    return {
        name: "crop",
        description: "Picly module for croping an image",
        params: [
            { name: "w", description: "Width in pixels", type: "integer", optional: false },
            { name: "h", description: "Height in pixels", type: "integer", optional: false },
            { name: "x", description: "Horizontal offset in pixels", type: "integer", optional: true, default: 0 },
            { name: "y", description: "Vertical offset in pixels", type: "integer", optional: true, default: 0 },
        ],
        sampleO: "examples/crop_original.jpg",
        sampleM: "examples/crop_mod.jpg",
        example: "w(0),h(0),x(0),y(0)"
    }
}

module.exports.picly.perform = function(params) {
    return new Promise((res, rej) => {
        gm(params.sourceEntity)
            .crop(params.w, params.h, params.x, params.y)
            .write(params.destEntity, function(err) {
                if (err) { rej(err); } else {
                    res();
                }
            });
    })
}