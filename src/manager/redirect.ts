
import express from 'express';
import * as fs from 'fs';
import * as routeUtil from '../util/route';
import * as constants from '../common/constants';

export default class Redirect {
  private pathInfo: {[path: string]: string};

  private router: express.Router;

  static instance: Redirect;

  constructor(router: express.Router) {
    this.router = router;
    if (fs.existsSync(constants.REDIRECT_PATH)) {
      this.pathInfo = JSON.parse(String(fs.readFileSync(constants.REDIRECT_PATH)));
    } else {
      this.pathInfo = {};
    }

    for (const path of Object.keys(this.pathInfo)) {
      this.push(path, this.pathInfo[path]);
    }
  }

  static getInstance(router: express.Router) {
    if (!Redirect.instance) {
      Redirect.instance = new Redirect(router);
    }
    return Redirect.instance;
  }

  push(path: string, url: string) {
    try {
      routeUtil.addRoute(this.router, path, (_: any, response: any) => {
        response.redirect(url);
      });
      this.pathInfo[path] = url;
      fs.writeFileSync(`${constants.KEY_PATH}/redirect.json`, JSON.stringify(this.pathInfo), 'utf8');
      return this.pathInfo;
    } catch (error) {
      this.pop(path);
      return error;
    }
  }

  pop(path: string) {
    try {
      routeUtil.removeRoute(this.router, path);
      if (this.pathInfo[path]) {
        delete this.pathInfo[path];
        fs.writeFileSync(`${constants.KEY_PATH}/redirect.json`, JSON.stringify(this.pathInfo), 'utf8');
      }
      return this.pathInfo;
    } catch (error) {
      return error;
    }
  }

  getPathInfo() {
    return this.pathInfo;
  }
}
