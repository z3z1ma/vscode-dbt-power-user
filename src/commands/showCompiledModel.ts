import * as fs from "fs";
import * as path from "path";
import { window, workspace, DecorationOptions, Range, OverviewRulerLane, ExtensionContext, Uri, ViewColumn } from "vscode";
import { IConfig } from "../view/app/model";

export class ShowCompiledModel {
  context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  show = async () => {
    const activeTextEditor = window.activeTextEditor;
    const fullPath = activeTextEditor?.document.fileName;
    if (fullPath !== undefined && activeTextEditor !== undefined) {
      const fileName = path.basename(fullPath, '.sql');
      const dirName = path.dirname(fullPath).split('/').pop();
      const filePaths = await workspace.findFiles(`**/compiled/**/${dirName}/*.sql`, '**/{dbt_modules,.history}/**');
      const filePath = filePaths.find(filePath => filePath.path.split('/').pop() === fileName + '.sql');

      if (filePath !== undefined) {
        const runResultFile = fs.readFileSync(filePath.path).toString("utf8");
        const runResultFileSegment = runResultFile.split('\n');
        const panel = window.createWebviewPanel(
          'modelWebview',
          `Compiled ${fileName}`,
          ViewColumn.Active,
          {
            enableScripts: true,
            localResourceRoots: [
              Uri.file(path.join(this.context.extensionPath, "configViewer"))
            ]
          }
        );
        const onDiskCssPath = Uri.file(
          path.join(this.context.extensionPath, 'media', 'style.css')
        );
        const cssPath = panel.webview.asWebviewUri(onDiskCssPath);
        panel.webview.html = this.getWebviewContent(runResultFile, cssPath);
      }
    };
  };

  private getWebviewContent(runResultFile: string, cssPath: Uri): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = Uri.file(
      path.join(this.context.extensionPath, "configViewer", "configViewer.js")
    );
    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>
        <link rel="stylesheet" type="text/css" href=${cssPath}>
        <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
                      img-src https:;
                      script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                      style-src vscode-resource: 'unsafe-inline';">

        <script>
          window.initialData = ${JSON.stringify(runResultFile)};
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script src="${reactAppUri}"></script>
    </body>
    </html>`;
  }
}