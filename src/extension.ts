
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {

	console.log('"svn-scm-ext" is now active!');

	let disposable = vscode.commands.registerCommand('svnext.about', () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Extended SVN SCM 0.0.1 by Scott Meesseman');
	});

	context.subscriptions.push(disposable);
}


export function deactivate() {}
