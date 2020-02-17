import * as TestRunner from "./istanbultestrunner";
// import * as TestRunner from "./nyctestrunner";

const testRunner = TestRunner;

const mochaOpts: Mocha.MochaOptions = {
    ui: "tdd", // the TDD UI is being used in extension.test.ts (suite, test, etc.)
    useColors: true, // colored output from test results,
    timeout: 30000, // default timeout: 10 seconds
    retries: 1,
    reporter: "mocha-multi-reporters",
    reporterOptions: {
        reporterEnabled: "spec, mocha-junit-reporter",
        mochaJunitReporterReporterOptions: {
            mochaFile: __dirname + "/../../test-reports/extension_tests.xml",
            suiteTitleSeparatedBy: ": "
        }
    }
};

testRunner.configure(mochaOpts,
{
    coverConfig: "../../.coverconfig.json"
});

module.exports = testRunner;
