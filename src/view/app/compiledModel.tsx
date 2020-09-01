import * as React from 'react';
import { MonacoEditor, CursorPos } from './monacoEditor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export default class CompiledModel extends React.Component<{
  initialData: string,
}, any> {
  constructor(props: any) {
    super(props);
  }


  render() {
    const options: monacoEditor.editor.IEditorConstructionOptions = {
      minimap: {
          enabled: false
      },
      glyphMargin: false,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden'
      },
      lineNumbers: 'on',
      renderLineHighlight: 'none',
      highlightActiveIndentGuide: false,
      renderIndentGuides: false,
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      folding: false,
      readOnly: true,
      occurrencesHighlight: false,
      selectionHighlight: false,
      lineDecorationsWidth: 0,
      contextmenu: false,
      matchBrackets: "never",
  };
    const initialData = this.props.initialData;
    const maptoHTML = initialData;
    return (
      <MonacoEditor language="en" value={maptoHTML} version={1} hasFocus modelChanged={e => console.log(e)} editorMounted={e => console.log(e)} outermostParentClass="root" openLink={(uri) => console.log(uri)} options={options} cursorPos={CursorPos.Current}>
      </MonacoEditor>
    );
  }
}