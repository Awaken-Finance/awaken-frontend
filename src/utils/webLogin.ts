import { WebLoginInterface } from 'aelf-web-login';

let instance: WebLoginInstance;

export class WebLoginInstance {
  static get() {
    if (!instance) {
      instance = new WebLoginInstance();
    }
    return instance;
  }

  private _context!: WebLoginInterface;

  setWebLoginContext(context: WebLoginInterface) {
    this._context = context;
  }

  getWebLoginContext() {
    return this._context;
  }
}
