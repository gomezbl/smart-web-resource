"use strict";

var sizeOf = require('image-size');
const Sharp = require("sharp");

module.exports = {};

module.exports.swr = {};

module.exports.swr.info = function() {
    return {
        name: "resize",
        description: "Smart Web Resource module for resizing image",
        params: [
            { name: "w", description: "Width in pixels", type: "integer", optional: true },
            { name: "h", description: "Height in pixels", type: "integer", optional: true }
        ],
        sampleO: "examples/resize_original.jpg",
        sampleM: "examples/resize_mod.png",
        example: "w(340)"
    }
}

var imageSize = function(fullPathToImage) {
    return new Promise((resolve, reject) => {
        sizeOf(fullPathToImage, (err, dimensions) => {
            if (!!err) reject(err);
            else resolve(dimensions);
        });
    });
}

module.exports.swr.perform = function(params) {
    return new Promise((resolve, reject) => {
        imageSize(params.sourceEntity)
            .then((originalImageSize) => {
                let finalWidth = 0;
                let finalHeight = 0;
                let destWidth = params.w;
                let destHeight = params.h;
                let resizeOption = "";

                // Case 1) - destination width set, but no height
                if (destWidth && !destHeight) {
                    finalWidth = destWidth;
                    let ratio = originalImageSize.width / destWidth;
                    finalHeight = originalImageSize.height / ratio;
                }

                // Case 2) - destination height set, but no width
                if (!destWidth && destHeight) {
                    finalHeight = destHeight;
                    let ratio = originalImageSize.height / destHeight;
                    finalWidth = originalImageSize.width / ratio;
                }

                // Case 3) - no destination width or height set, then set with to DEFAULTWIDTH
                if (!destWidth && !destHeight) {
                    finalWidth = destWidth;
                    let ratio = originalImageSize.width / destWidth;
                    finalHeight = originalImageSize.height / ratio;
                }

                // Case 4) - destination width and height set
                if (destWidth && destHeight) {
                    finalWidth = destWidth;
                    finalHeight = destHeight;
                    resizeOption = "!";
                }

                Sharp(params.sourceEntity)
                    .resize(parseInt(finalWidth), parseInt(finalHeight))
                    .toFile(params.destEntity, (err) => { 
                        if (!!err) { reject(err); } else {
                            resolve();
                        }
                    });
            })
            .catch((err) => { reject(err); })
    })
}