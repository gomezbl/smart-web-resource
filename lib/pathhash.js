"use strict";

const Crypto = require('crypto');

module.exports = {
    GetHashFromPath : function(path) {
        return Crypto.createHash('md5').update(path).digest('hex');
    }
}