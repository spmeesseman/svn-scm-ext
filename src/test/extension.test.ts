/* tslint:disable */

//
// Documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import * as vscode from "vscode";
import { configuration } from "../common/configuration";
import { setWriteToConsole, timeout } from '../util';


suite("Extension Tests", () => 
{
    setup(async () => 
    {
    });


    teardown(() =>
    {
    });


    test("Enable required testing options", async function()
    {
        this.timeout(10 * 1000);
        assert.ok(vscode.extensions.getExtension("spmeesseman.svn-scm-ext"));
        //
        // Enable views, use workspace level so that running this test from Code itself
        // in development doesnt trigger the TaskExplorer instance installed in the dev IDE
        //
        await configuration.updateWs('enabled', true);
        setWriteToConsole(true); // write debug logging from exiension to console
    });


    test("Get active extension", async function()
    {
        let wait = 0;
        const maxWait = 15;  // seconds

        this.timeout(20 * 1000);

        let ext = vscode.extensions.getExtension("spmeesseman.svn-scm-ext");
        assert(ext, "Could not find extension");

        //
        // For coverage, we remove activationEvents "*" in package.json, we should
        // not be active at this point
        //
        if (ext)
        {
            if (!ext.isActive) 
            {
                console.log('        Manually activating extension');
                try {
                    await ext.activate();
                    assert(vscode.commands.executeCommand("svnext.showOutput"));
                }
                catch(e) {
                    assert.fail("Failed to activate extension");
                }
            } 
            else {
                //
                // Wait for extension to activate
                //
                while (!ext.isActive && wait < maxWait * 10) {
                    wait += 1;
                    await timeout(100);
                }
                assert(!ext.isActive || wait < maxWait * 10, "Extension did not finish activation within " + maxWait + " seconds");
                //
                // Set extension api exports
                //
                assert(vscode.commands.executeCommand("svnext.showOutput"));
            }
        }
        assert(vscode.commands.executeCommand("svnext.showOutput"));
    });

});
