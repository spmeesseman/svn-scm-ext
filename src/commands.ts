import {
    ExtensionContext, commands, Uri
} from "vscode";
import { HistoryPanel } from "./history";
import { parseString } from 'xml2js';
import { svn } from "./extension";


export class Commands
{

    private extensionContext: ExtensionContext;


    constructor(context: ExtensionContext)
    {
        const me = this;
        const subscriptions = context.subscriptions;
        this.extensionContext = context;
        subscriptions.push(commands.registerCommand("svnext.openHistory", (uri: Uri) => me.openHistory(uri), me));
    }
    

    public async openHistory(uri: Uri)
    {
        if (svn) 
        {
            const ctx = this.extensionContext;
            const fileName = uri.path.substring(uri.path.lastIndexOf("/") + 1);
            let html = "Could not retrieve history";
            const xml = await svn.getHistory(uri);
            
            parseString(xml, (err, jso) =>
            {
                html = "<html><head>";
                html += "<style>code { color: var(--vscode-editor-foreground); }</style>";
                html += "</head><body>";
                html += "<table cellpadding=\"6\"><tr style=\"font-weight:bold;font-size:16px;\">";
                
                if (jso && jso.log && jso.log.logentry)
                {
                    html += `<td>Rev</td> 
                             <td>Date</td>
                             <td>Author</td>  
                             <td>Message</td></tr>`;   
                
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
                        html += "<td>";
                        html += "<button onclick=\"compareToHeadClick(this);\">Compare</button>";
                        html += "</td></td></tr>";
                    });
                }
                else
                {
                    html += "<tr><td colspan=\"5\">There was an error retrieving the hostory from Subversion:<br><br></td></tr>";
                    html += "<tr><td colspan=\"5\">" + xml + "</td></tr>";
                }
                html += "</table>";
                html += `<script>
                            function compareToHeadClick(btn) {
                                const vscode = acquireVsCodeApi();
                                vscode.postMessage({
                                    command: 'alert',
                                    text: '!!!!'
                                });
                            }
                         </script>`;
                html += "</body></html>";
            });

            HistoryPanel.createOrShow(ctx.extensionPath, "History - " + fileName, html, uri, true);
        }
    }

}
