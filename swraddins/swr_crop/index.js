"use strict";

const Sharp = require("sharp");

module.exports = {};

module.exports.swr = {};

module.exports.swr.info = function() {
    return {
        name: "crop",
        description: "Smart Web Resource module for croping an image",
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

module.exports.swr.perform = function(params) {
    return new Promise((res, rej) => {
        Sharp(params.sourceEntity)
            .extract({ left: parseInt(params.x), 
                       top: parseInt(params.y),
                       width: parseInt(params.w), 
                       height: parseInt(params.h) })
            .toFile(params.destEntity, (err) => {
                if (err) rej(err);
                else res();
            });
    })
}