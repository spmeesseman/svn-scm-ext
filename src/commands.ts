import {
    ExtensionContext, commands, Uri, window, TextDocumentShowOptions
} from "vscode";
import { HistoryPanel } from "./history";
import { parseString } from 'xml2js';
import { svn } from "./extension";
import { createTempFile } from './common/tempFile';
import * as path from "path";


export class Commands
{

    private extensionContext: ExtensionContext;


    constructor(context: ExtensionContext)
    {
        const me = this;
        const subscriptions = context.subscriptions;
        this.extensionContext = context;
        subscriptions.push(commands.registerCommand("svnext.openHistory", (uri: Uri) => me.openHistory(uri), me));
        subscriptions.push(commands.registerCommand("svnext.openCompare", (uri: Uri, rev: string) => me.openCompare(uri, rev), me));
    }


    public async openCompare(uri: Uri, rev: string, rev2?: string)
    {
        if (svn) 
        {
            const svnUri = Uri.parse(await svn.getRepoPath(uri));
            const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
            let fileContent = await svn.getFileByRev(uri, rev);
            const uri1: Uri = await createTempFile(svnUri, rev, fileContent, path.extname(fileName));
            let uri2: Uri;
            if (!rev2) {
                rev2 = "CURRENT";
                uri2 = uri;
            }
            else {
                fileContent = await svn.getFileByRev(uri, rev2);
                uri2 = await createTempFile(svnUri, rev2, fileContent, path.extname(fileName));
            }
            const title = fileName + ` (${rev} : ${rev2})`;
            return commands.executeCommand<void>("vscode.diff", uri1, uri2, title, {
                preview: true
            });
        }
    }


    public async openHistory(uri: Uri)
    {
        if (svn) 
        {
            const me = this;
            const ctx = this.extensionContext;
            const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
            let html = "Could not retrieve history";
            const xml = await svn.getHistory(uri);
            
            parseString(xml, (err, jso) =>
            {
                html = `<html><head>
                            <style>
                                code { color: var(--vscode-editor-foreground); }
                            </style>
                        </head>
                        <body>
                            <table cellpadding=\"6\"><tr style=\"font-weight:bold;font-size:16px;\">`;
                
                if (jso && jso.log && jso.log.logentry)
                {
                    html += `<td>Rev</td> 
                             <td>Date</td>
                             <td>Author</td>  
                             <td>Message</td></tr>`; 

                    let prevRev: string;
                    let entries: Array<any> = jso.log.logentry;
                    let first = true;

                    entries.forEach(e =>
                    {
                        html = html.replace("PREVIOUS_REV", e.$.revision);

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
                        html += `<td>
                                    <button onclick=\"compareToCurrentClick('` + uri.path + `','` + e.$.revision + `');\">Compare to Current</button>
                                 </td>`;
                        if (!first) {
                            html += `<td>
                                        <button onclick=\"compareToHeadClick('` + uri.path + `','` + e.$.revision + `');\">Compare to Head</button>
                                    </td>`;
                        }
                        html += `<td>
                                    <button onclick=\"compareToPrevClick('` + uri.path + `','` + e.$.revision + `', 'PREVIOUS_REV');\">Compare to Prev</button>
                                 </td></tr>`;

                        first = false;
                    });

                    //
                    // Remove the 'compare to previous' button for the first revision of this file
                    //
                    let idx1 = html.indexOf("PREVIOUS_REV");
                    idx1 = html.lastIndexOf("<td>", idx1);
                    let idx2 = html.indexOf("</td>", idx1) + 5;
                    const lastTd = html.substring(idx1, idx2);
                    html = html.replace(lastTd, "");
                }
                else
                {
                    html += "<tr><td colspan=\"5\">There was an error retrieving the hostory from Subversion:<br><br></td></tr>";
                    html += "<tr><td colspan=\"5\">" + xml + "</td></tr>";
                }
                html += "</table>";
                html += `<script>
                            var vscode;
                            function compareToCurrentClick(pFile,pRev) {
                                if (!vscode) {
                                    vscode = acquireVsCodeApi();
                                }
                                vscode.postMessage({
                                    command: 'openCompare',
                                    file: pFile,
                                    rev: pRev
                                });
                            }
                            function compareToHeadClick(pFile,pRev) {
                                if (!vscode) {
                                    vscode = acquireVsCodeApi();
                                }
                                vscode.postMessage({
                                    command: 'openCompare',
                                    file: pFile,
                                    rev: pRev,
                                    rev2: 'HEAD'
                                });
                            }
                            function compareToPrevClick(pFile,pRev,pPrevRev) {
                                if (!vscode) {
                                    vscode = acquireVsCodeApi();
                                }
                                vscode.postMessage({
                                    command: 'openCompare',
                                    file: pFile,
                                    rev: pRev,
                                    rev2: pPrevRev
                                });
                            }
                         </script>`;
                html += "</body></html>";
            });

            function cb(message: any) {
				switch (message.command) {
					case 'alert':
						window.showErrorMessage(message.text);
						return;
                    case 'openCompare':
                        me.openCompare(Uri.file(message.file), message.rev, message.rev2);
                        return;
				}
            }
            
            HistoryPanel.createOrShow(ctx.extensionPath, "History - " + fileName, html, uri, cb, true);
        }
    }

}
