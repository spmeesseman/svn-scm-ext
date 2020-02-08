import * as path from 'path';
import * as vscode from 'vscode';

export class HistoryPanel 
{
	public static currentPanel: HistoryPanel | undefined;
	public static readonly viewType = 'History';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
    private _content: string;
    private _title: string;
    private _uri?: vscode.Uri | undefined;
	//private const tabs: Map<string, HistoryPanel> = new Map();

    public static createOrShow(extensionPath: string, title: string, content: string, uri: vscode.Uri) 
    {
		const column = vscode.window.activeTextEditor
			           ? vscode.window.activeTextEditor.viewColumn : undefined;

        //
        // TODO - If this history is already open, show it.
        //
		//if (HistoryPanel.currentPanel) {
		//	HistoryPanel.currentPanel._panel.reveal(column);
		//	return;
        //}
        
        const panel = vscode.window.createWebviewPanel(
			HistoryPanel.viewType,
			title,
			column || vscode.ViewColumn.One,
			{
				enableScripts: false,
				localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'res'))]
			}
		);

		HistoryPanel.currentPanel = new HistoryPanel(panel, extensionPath, title, content, uri);
    }
    

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) 
    {
        const msg = "Previously requested Subversion history (Close window)";
		HistoryPanel.currentPanel = new HistoryPanel(panel, extensionPath, "History", msg);
	}


    private constructor(panel: vscode.WebviewPanel, extensionPath: string, title: string, content: string, uri?: vscode.Uri) 
    {
		this._panel = panel;
		this._extensionPath = extensionPath;
        this._content = content;
        this._title = title;
        this._uri = uri;

		// Set the webview's initial html content
		this._update(title, content);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update(title, content);
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}


    public dispose()
    {
		HistoryPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
    }
    

    private _update(title: string, content: string) 
    {
		this._panel.title = title;
		this._panel.webview.html = content;
    }
    
}
