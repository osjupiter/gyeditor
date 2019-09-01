// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const htmlFile = "src/panel.html";
let currentPanel: vscode.WebviewPanel | undefined = undefined;
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.helloWorld', () => {
            // Create and show a new webview
            const panel = createPanel();
            currentPanel = panel;
            const p = getPath(context, htmlFile);
            const c = getWebviewContent(p);
            const reped = replaceVars(c, context);
            // And set its HTML content
            panel.webview.html = reped;
        })
    );
    // Our new command
    context.subscriptions.push(
        vscode.commands.registerCommand('catCoding.doRefactor', () => {
            if (!currentPanel) {
                return;
            }
            const data=loadData(context);
            const draw=drawData(context,data);

            // Send a message to our webview.
            // You can send any JSON serializable data.
            currentPanel.webview.postMessage(draw);
        })
    );
}
function loadData(context:vscode.ExtensionContext){
    return {
        components:[
            {tag:"img",pos:{x:10,y:10},src:"resource/B1.png"},
        ]
    };
}
function drawData(context:vscode.ExtensionContext,data:any){
    let c:any[]=data.components;
    for (let i of data.components){
        i.url=getUrlOfLocal(context,i.src).toString();
    }
    return data;
}

function getUrlOfLocal(context: vscode.ExtensionContext, file: string) {
    const url = vscode.Uri.file(path.join(context.extensionPath, file)).with({ scheme: 'vscode-resource' });
    return url;
}

function replaceVars(str: string, context: vscode.ExtensionContext) {
    const url = getUrlOfLocal(context, "src/fabric.min.js");
    const replaced = str.replace(/P5JSSRC/g, url.toString());
    return replaced;
}

function createPanel() {
    return vscode.window.createWebviewPanel(
        'catCoding',
        'Cat Coding',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true
        }
    );

}

function getPath(context: vscode.ExtensionContext, file: string) {
    const pathToHtml = vscode.Uri.file(path.join(context.extensionPath, file));
    const pathUri = pathToHtml.with({ scheme: 'vscode-resource' });
    return pathUri;
}

function getWebviewContent(p: vscode.Uri) {
    return fs.readFileSync(p.fsPath, 'utf8');
}

// this method is called when your extension is deactivated
export function deactivate() { }
