import { singleton } from "tsyringe";
import { AutocompletionProviderFactory } from "./autocompletion_provider/autocompletionProviderFactory";

@singleton()
export class DBTPowerUserExtension {
  constructor(private autocompletionProvider: AutocompletionProviderFactory) {}

  createAutoComplete() {
    return this.autocompletionProvider.createAutoCompletionProviders();
  }
}
