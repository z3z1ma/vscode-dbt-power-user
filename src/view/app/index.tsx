import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CompiledModel from './compiledModel';
import "./index.css";

declare global {
  interface Window {
    initialData: string;
  }
}

ReactDOM.render(
  <CompiledModel initialData={window.initialData} />,
  document.getElementById("root")
);