/* tslint:disable */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () =>
{
    // Before Each
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
    test("Activate extension", function (done)
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
});
