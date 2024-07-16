// import { WebLoginInterface } from 'aelf-web-login';

let instance: WebLoginInstance;
// TODO: v2 remove
export class WebLoginInstance {
  static get() {
    if (!instance) {
      instance = new WebLoginInstance();
    }
    return instance;
  }

  private _context!: any;

  setWebLoginContext(context: any) {
    this._context = context;
  }

  getWebLoginContext() {
    return this._context;
  }
}
