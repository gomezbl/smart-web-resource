const Assert = require("chai").assert;
const Path = require("path");
const FsExtra = require("fs-extra");

const Files = require("..");
const PATH_TO_TEST_FILES = "testfilesrepository";
const TESFILESDIRECTORY = "samplefiles";

const PATH_TO_FILES_REPOSITORY = Path.join( __dirname, PATH_TO_TEST_FILES );
const PATH_TO_SAMPLE_FILES = Path.join( __dirname, TESFILESDIRECTORY );
const REPOSITORY_SIZE = 8;

describe( '@gomezbl/files tests', () => {
    before( async () => {
       await FsExtra.ensureDir( PATH_TO_FILES_REPOSITORY );
    });

    it( '# Add file to repository from existing file', async() => {
        let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );
        
        let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );

        Assert.equal( fileId.length, 32 );
    });

    it( '# Add file to repository from existing file and read it', async() => {
        let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
        
        let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );
        let fileRead = await f.ReadFile( fileId );

        Assert.equal( fileId.length, 32 );
    });

    it( '# Add file from buffer', async() => {
        let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );

        Assert.equal( fileId.length, 32 );
    });

    it( '# Read file from buffer', async() => {
        let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileRead = await f.ReadFile( fileId );

        Assert.isTrue( fileBuffer.equals(fileRead) );
    });

    it( '# Get file manifest', async() => {
        let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileManifest = await f.GetFileManifest( fileId );

        Assert.isTrue( typeof fileManifest == "object" );
        Assert.isDefined( fileManifest.length );
        Assert.isDefined( fileManifest.extension );
        Assert.isDefined( fileManifest.created );
        Assert.isDefined( fileManifest.location );
    });
});