import {
    ExtensionContext, commands, Disposable, window, Uri
} from "vscode";
import * as child_process from "child_process";
import { HistoryPanel } from "./history";
import { parseString } from 'xml2js';

export class Svn implements Disposable
{

    private extensionContext: ExtensionContext;
    private repoPath: string;


    constructor(context: ExtensionContext)
    {
        const me = this;
        const subscriptions = context.subscriptions;
        this.extensionContext = context;
        this.repoPath = "";
        subscriptions.push(commands.registerCommand("svnext.openHistory", function (uri: Uri) { me.openHistory(uri); }, me));
    }


    public getRepoPath(uri: Uri): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            this.runSvn(uri, "info --show-item url")
            .then(out => resolve(out.trim()))
            .catch(out => reject(out.trim())); 
        });
    }


    public async openHistory(uri: Uri)
    {
        const ctx = this.extensionContext;
        const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
        let dir = uri.fsPath.substring(0, uri.fsPath.lastIndexOf("\\") + 1);
        if (process.platform !== 'win32') {
			dir = uri.fsPath.substring(0, uri.fsPath.lastIndexOf("/") + 1);
        }
        
        // const repoPath = await this.getRepoPath(uri) + "/" + fileName;

        this.runSvn("log --xml " + fileName + " --verbose --limit 5", dir)
        .then((xml) =>
        {
            parseString(xml, (err,jso) =>
            {
                let html = "<html><body>";
                html += "<table cellpadding=\"6\"><tr style=\"font-weight:bold;font-size:16px;\">";
                
                if (jso && jso.log && jso.log.logentry)
                {
                    html += "<td>Rev</td>";   
                    html += "<td>Date</td>";
                    html += "<td>Author</td>";   
                    html += "<td>Message</td></tr>";   
                
                    let entries: Array<any> = jso.log.logentry;
                    entries.forEach(e =>
                    {
                        html += "<tr><td>";
                        if (e.$ && e.$.revision) {
                            html += e.$.revision;
                        }
                        html += "</td><td>";
                        if (e.date) {
                            html += new Date(e.date[0]).toLocaleString("en-US");
                        }
                        html += "</td><td>";
                        if (e.author) {
                            html += e.author[0];
                        }
                        html += "</td><td>";
                        if (e.msg) {
                            html += e.msg[0];
                        }
                        html += "</td></tr>";
                    });
                }
                else
                {
                    html += "<tr><td colspan=\"4\">There was an error retrieving the hostory from Subversion:</td></tr>";
                    html += "<tr><td colspan=\"4\">" + xml + "</td></tr>";
                }

                html += "</table></body></html>";

                HistoryPanel.createOrShow(ctx.extensionPath, "History - " + fileName, html, uri);
            });
        }); 
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
