'use babel';

console.log("HI?")

import WebToolbarView from './web-toolbar-view';
import { CompositeDisposable } from 'atom';

export default {

  webToolbarView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.webToolbarView = new WebToolbarView(state.webToolbarViewState);
    this.modalPanel = atom.workspace.addTopPanel({
      item: this.webToolbarView.getElement(),
      visible: true,
      priority: 1
    });
    console.log(this.webToolbarView)

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-toolbar:toggle': () => this.toggle(),
      'web-toolbar:start': () => this.webToolbarView.startServer(),
      'web-toolbar:stop': () => this.webToolbarView.stopServer()
    }));

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.webToolbarView.destroy();
  },

  serialize() {
    return {
      webToolbarViewState: this.webToolbarView.serialize()
    };
  },

  toggle() {
    console.log('webToolbar was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide(this.webToolbarView.stopServer()) :
      this.modalPanel.show()
    );
  }

};
