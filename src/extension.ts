
import { ExtensionContext, Disposable, workspace, window, WebviewPanel } from 'vscode';
import { Svn } from "./svn";
import { configuration } from "./common/configuration";
import { HistoryPanel } from "./history";

export let svn: Svn | undefined;


export async function activate(context: ExtensionContext, disposables: Disposable[])
{
	svn = new Svn(context);
	context.subscriptions.push(svn);

	//
    // Register configurations/settings change watcher
    //
    const d = workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("svnext.enabled")) {
			if (configuration.get<boolean>("enableAnt") === true)
			{
				svn = new Svn(context);
				context.subscriptions.push(svn);
			}
		}	
    });
	context.subscriptions.push(d);
	
	if (window.registerWebviewPanelSerializer) {
		 window.registerWebviewPanelSerializer(HistoryPanel.viewType, {
			 async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
				 HistoryPanel.revive(webviewPanel, context.extensionPath);
			 }
		 });
	 }
}


export function deactivate() {}
