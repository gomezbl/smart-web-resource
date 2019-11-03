/*
 * Get the image type by data inspection
 */
"use strict";

var mmm = require("mmmagic");
var Magic = mmm.Magic;

/*
 * Returns a hash value from string indicated as parameter.
 * The hash value returnes is based on md5 algorithm
 */
module.exports = function(path) {
    return new Promise((resolve, reject) => {
        try {
            let magic = new Magic(mmm.MAGIC_MIME_TYPE);   
            magic.detectFile(path, (err, result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}