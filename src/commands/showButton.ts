import { window, Hover, Range, MarkdownString } from "vscode";

const content = new MarkdownString('[link](command:showCompiledModel)');
content.isTrusted = true;
const hover = new Hover(content);

const showButtonType = window.createTextEditorDecorationType({
  after: {
    backgroundColor: 'rgba(246, 106, 10, 0.50)',
    color: 'white',
    height: '100%',
    margin: '0 26px -1px 100px',
    textDecoration: 'overline solid rgba(0, 0, 0, .2)',
    width: '50ch',
  }
});

export const showButton = () => {
  const activeTextEditor = window.activeTextEditor;
  const endCharacter = activeTextEditor?.document.lineAt(0).range;
  if (activeTextEditor !== undefined) {
    activeTextEditor.setDecorations(showButtonType, [new Range(endCharacter!.end, endCharacter!.end)]);
  }
};