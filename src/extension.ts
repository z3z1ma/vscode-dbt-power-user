import "reflect-metadata";
import * as vscode from "vscode";
import { TreeviewProviderFactory } from "./treeview_provider/treeviewProviderFactory";
import { VSCodeCommandFactory } from "./commands/vscodeCommandFactory";
import { DefinitionProviderFactory } from "./definition_provider/definitionProviderFactory";
import { dbtProjectContainer } from "./manifest/dbtProjectContainer";
import { DBTStatusBar } from "./statusbar/dbtStatusBar";
import { RunResultStatusBar } from "./statusbar/runResultStatusBar";
import { container } from "tsyringe";
import { DBTPowerUserExtension } from "./dbtPowerUserExtension";

export const DBT_MODE = { language: "jinja-sql", scheme: "file" };

const dbtPowerUserExtension = container.resolve(DBTPowerUserExtension);

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    ...DefinitionProviderFactory.createDefinitionProviders(),
    ...dbtPowerUserExtension.createAutoComplete(),
    ...TreeviewProviderFactory.createModelTreeViews(),
    ...VSCodeCommandFactory.createCommands(),
    new RunResultStatusBar(),
    new DBTStatusBar(),
    dbtProjectContainer
  );

  await dbtProjectContainer.detectDBT();
  await dbtProjectContainer.initializeDBTProjects();
}

export function deactivate() {}
