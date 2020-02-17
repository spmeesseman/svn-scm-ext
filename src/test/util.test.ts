/* tslint:disable */

//
// Documentation on https://mochajs.org/ for help.
//

import * as assert from "assert";
import { workspace } from "vscode";
import * as util from "../util";


suite("Util tests", () => 
{
    suiteSetup(async () =>
    {
    });

    suiteTeardown(() =>
    {
    });

    test("Turn logging on", () =>
    {
        assert(workspace.getConfiguration('svnext').update('debug', true));
    });

    test("Log to output window", () =>
    {
        assert(util.log("        spmeesseman.vscode-svnext"));
    });

    test("Log value to output window", () =>
    {
        assert(util.logValue("        spmeesseman.vscode-svnext", "true"));
    });

    test("Log a null value to output window", () =>
    {
        assert(util.logValue("        spmeesseman.vscode-svnext", null));
    });

    test("Log undefined value to output window", () =>
    {
        assert(util.logValue("        spmeesseman.vscode-svnext", undefined));
    });

    test("Test camelCase()", () =>
    {
        assert(util.camelCase("svnext", 4) === 'svnext');
        assert(util.camelCase(undefined, 4) === undefined);
        assert(util.camelCase("testgreaterindex", 19) === "testgreaterindex");
        assert(util.camelCase("test", -1) === "test");
    });

    test("Test properCase()", () =>
    {
        assert(util.properCase("svnext") === 'svnext');
        assert(util.properCase(undefined) === undefined);
    });

    //test("Turn logging off", () => {
    //  assert.ok(workspace.getConfiguration('svnext').update('debug', false));
    //});

    test("Timeout", () =>
    {
        assert(util.timeout(10));
    });

});
