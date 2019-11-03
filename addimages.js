"use strict";

const Path = require("path");
const Files = require("./lib/files/.");
const PATHTOSAMPLEIMAGES = "test/samplepictures";

(async function() {
    let imagesToAdd = ["dog-seizures.jpg", "eva.jpg"];
    let pathToFilesRepository = Path.join(__dirname, "test", "filesrepository");

    let fileServer = Files({ Path: pathToFilesRepository, Size: 3 });

    for (let img of imagesToAdd) {
        let fullPathToImage = Path.join(__dirname, PATHTOSAMPLEIMAGES, img);
        let fileId = await fileServer.AddExistingFile(fullPathToImage);
        console.log(fileId);
    }
})();
