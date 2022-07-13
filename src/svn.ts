import {
    ExtensionContext, Disposable, Uri
} from "vscode";
import * as child_process from "child_process";
import { configuration } from "./common/configuration";
import { getCwd, log, logValue } from './util';


export class Svn implements Disposable
{

    constructor(context: ExtensionContext)
    {
        context.subscriptions.push(this);
    }


    public async getRepoPath(uri: Uri): Promise<string>
    {
        let dir = getCwd(uri);
        return new Promise<string>((resolve, reject) =>
        {
            this.runSvn("info --show-item url", dir)
            .then(out => resolve(out.trim()))
            .catch(out => reject(out.trim())); 
        });
    }


    public async getFileByRev(uri: Uri, rev: string)
    {
        const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
        let dir = getCwd(uri);
        return await this.runSvn("cat -r " + rev + " " + fileName, dir);
    }


    public async getHistory(uri: Uri)
    {
        const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
        let dir = getCwd(uri);
        let limit = configuration.get<number>("logHistoryLimit");
        limit = limit <0 ? 0 : limit
        let limitParam = limit === 0 ? '' : ` --limit ${limit}`
        return await this.runSvn("log --xml " + fileName + " --verbose" + limitParam, dir);
    }


    private runSvn(cmd: string, cwd: string): Promise<string>
    {
        log("run svn");
        logValue("   cmd", cmd, 2);

        return new Promise<string>((resolve, reject) =>
        {
            let output = "";
            const child = child_process.spawn("svn.exe", cmd.split(" "),
            { 
                stdio: ["pipe", "pipe", "pipe"], 
                env: process.env, 
                cwd
            });

            if (!child.stderr || !child.stdout) {
                reject("");
                return;
            }

            child.stdout.setEncoding("utf8");
            child.stderr.setEncoding("utf8");

            child.stdout.on("data", data => {
                if (child.killed) {
                    return;
                }
                output += data;
            });

            child.stderr.on("data", data => {
                if (child.killed) {
                    return;
                }
                output += data;
            });

            child.on("exit", code => {
                resolve(output);
            });
        });
    }


    public dispose()
    {
        // TODO - cache svn child process id's when launched, and kill them here if active
    }

}
