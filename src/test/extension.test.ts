/* tslint:disable */

import * as assert from "assert";
import * as vscode from "vscode";


suite("Extension Tests", () =>
{
    setup(async () => { });

    teardown(() =>
    {

    });

    test("Get extension", () =>
    {
        assert.ok(vscode.extensions.getExtension("spmeesseman.svn-scm-ext"));
    });

    //
    // The extension is already activated by vscode before running mocha test framework.
    // No need to test activate any more. So commenting this case.
    //
    test("Activate extension", function(done)
    {
        this.timeout(60 * 1000);
        const extension = vscode.extensions.getExtension(
            "spmeesseman.svn-scm-ext"
        ) as vscode.Extension<any>;

        if (!extension)
        {
            assert.fail("Extension not found");
        }

        if (!extension.isActive)
        {
            extension.activate().then(
                api =>
                {
                    console.log("        ✔ Extension activated successfully");
                    done();
                },
                () =>
                {
                    assert.fail("Failed to activate extension");
                }
            );
        }
        else
        {
            console.log("        ✔ Extension activated successfully");
            done();
        }
    });

    test("Test Subversion routines", function(done)
    {
        done();
    });

});
