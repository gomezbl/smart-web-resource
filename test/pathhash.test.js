const assert = require("chai").assert;
const PathHash = require("../lib/pathhash.js");

describe( 'pathhash module tests', () => {
    it( '# Get hash', () => {
        let path = "/-/resize:w(100)/eva.jpeg";
        let hash = PathHash.GetHashFromPath( path );

        assert.equal( 32, hash.length );
    });

    it( '# Get hash same string', () => {
        let path = "/-/resize:w(100)/eva.jpeg";
        let hash1 = PathHash.GetHashFromPath( path );
        let hash2 = PathHash.GetHashFromPath( path );

        assert.equal( hash1, hash2 );
    });
});