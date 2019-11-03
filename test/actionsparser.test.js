const Assert = require("chai").assert;
const ActionsParser = require("../lib/actionsparser.js");

describe( 'actionsparser module tests', () => {
    it( '# Parse simple resize', () => {
        let r = ActionsParser.parseAction( "resize:w(100)" );
        
        Assert.equal( "resize", r.actionName );
        Assert.equal( 1, r.params.length );
        Assert.equal( "w", r.params[0].name );
        Assert.equal( "100", r.params[0].value );
    });

    it( '# Parse two plugins', () => {
        let r = ActionsParser.parseActions( ["resize:w(100)", "bw"] );

        Assert.equal( 2, r.length );
        Assert.equal( "resize", r[0].actionName );
        Assert.equal( "bw", r[1].actionName );
    })

    it( '# Parse plugin with some params', () => {
        let r = ActionsParser.parseAction( "plugin:a(20),b(30),c(40)" );

        Assert.equal( 3, r.params.length );
        Assert.equal( "plugin", r.actionName );
        Assert.equal( "a", r.params[0].name );
        Assert.equal( "b", r.params[1].name );
        Assert.equal( "c", r.params[2].name );
    })
});