import {
    ExtensionContext, Disposable, Uri
} from "vscode";
import * as child_process from "child_process";

export class Svn implements Disposable
{

    constructor(context: ExtensionContext)
    {
        context.subscriptions.push(this);
    }


    private getCwd(uri: Uri): string
    {
        let dir = uri.fsPath.substring(0, uri.fsPath.lastIndexOf("\\") + 1);
        if (process.platform !== 'win32') {
			dir = uri.fsPath.substring(0, uri.fsPath.lastIndexOf("/") + 1);
        }
        return dir;
    }


    private getRepoPath(uri: Uri): Promise<string>
    {
        let dir = this.getCwd(uri);
        return new Promise<string>((resolve, reject) =>
        {
            this.runSvn("info --show-item url", dir)
            .then(out => resolve(out.trim()))
            .catch(out => reject(out.trim())); 
        });
    }


    public async getHistory(uri: Uri)
    {
        const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
        let dir = this.getCwd(uri);
        return await this.runSvn("log --xml " + fileName + " --verbose --limit 5", dir);
    }


    private runSvn(cmd: string, cwd: string): Promise<string>
    {
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
