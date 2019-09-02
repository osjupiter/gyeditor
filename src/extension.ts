// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as jsyaml from 'js-yaml';

const htmlFile = "resource/panel.html";
let currentPanel: vscode.WebviewPanel | undefined = undefined;
let targetText: vscode.TextDocument | undefined = undefined;
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.helloWorld', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor === null) {
                vscode.window.showInformationMessage('対象のエディタがありません');
            }
            const doc = editor!.document;
            if (doc.languageId !== "yaml") {
                vscode.window.showInformationMessage('ファイルがyamlではありません');
                return;
            }


            // Create and show a new webview
            const panel = createPanel();
            currentPanel = panel;
            const p = getPath(context, htmlFile);
            const c = getWebviewContent(p);
            const reped = replaceVars(c, context);
            // And set its HTML content
            panel.webview.html = reped;

            targetText = doc;
            vscode.workspace.onDidChangeTextDocument(() => {
                doPost(context);
            });
            doPost(context);
        })
    );
    // Our new command
    context.subscriptions.push(
        vscode.commands.registerCommand('catCoding.doRefactor', () => {
            doPost(context);
        })
    );
}

function doPost(context: vscode.ExtensionContext) {
    if (!currentPanel || !targetText) {
        return;
    }
    const editer = vscode.window.activeTextEditor;
    if (!editer) { return; }
    const document = editer.document;
    if (document !== targetText) { return; }
    const data = loadData(context, document);
    const draw = drawData(context, data);
    console.log(draw);

    // Send a message to our webview.
    // You can send any JSON serializable data.
    currentPanel!.webview.postMessage(draw);

}
function loadData(context: vscode.ExtensionContext, doc: vscode.TextDocument) {

    let content = doc.getText();
    let data = jsyaml.safeLoad(content);
    return data;
    return {
        components: [
            { tag: ["img"], pos: { x: 0, y: 0 }, src: "resource/haikei2.png" },
            { tag: ["img"], pos: { x: 10, y: 0 }, src: "resource/B1.png" },
            { tag: ["img"], pos: { x: 550, y: 0 }, src: "resource/B3.png" },
        ]
    };
}
function drawData(context: vscode.ExtensionContext, data: any) {
    let c: any[] = data.components;
    for (let i of data.components) {
        i.url = getUrlOfLocal(context, i.src).toString();
    }
    return data;
}

function getUrlOfLocal(context: vscode.ExtensionContext, file: string) {
    let basepath = context.extensionPath;
    if (vscode.workspace.workspaceFolders!==undefined &&vscode.workspace.workspaceFolders[0].name !== undefined) {
        basepath = vscode.workspace.workspaceFolders[0].uri.path;
    }
    const url = vscode.Uri.file(path.join(basepath, file)).with({ scheme: 'vscode-resource' });
    return url;
}

function replaceVars(str: string, context: vscode.ExtensionContext) {
    const url = getPath(context, "resource/fabric.min.js");
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
