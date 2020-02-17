
import { ExtensionContext, Disposable, workspace, window, WebviewPanel } from 'vscode';
import { Svn } from "./svn";
import { Commands } from "./commands";
import { configuration } from "./common/configuration";
import { HistoryPanel } from "./history";
import { initLog, log } from "./util";
import { initStorage } from "./common/storage";


export let svn: Svn | undefined;
export let commands: Commands | undefined;

export async function activate(context: ExtensionContext, disposables: Disposable[])
{
	initLog(context, true);
    initStorage(context);

    log("");
	log("Init extension");
	
	if (configuration.get<boolean>("enabled") === true)
	{
		svn = new Svn(context);
		commands = new Commands(context);
	}

	//
    // Register configurations/settings change watcher
    //
    const d = workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("svnext.enabled")) {
			if (configuration.get<boolean>("enabled") === true)
			{
				svn = new Svn(context);
				commands = new Commands(context);
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

	log("    Extension active");
}


export function deactivate() {}
