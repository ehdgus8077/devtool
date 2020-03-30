
import express from 'express';
import * as fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as routeUtil from '../util/route';
import * as constants from '../common/constants';
import * as ttydUtil from '../util/ttyd';

export default class Shell {
  private pathInfo: {[path: string]: {command: string, port: number, filePath?: string }};

  private router: express.Router;

  private availPort: number[];

  static instance: Shell;

  constructor(router: express.Router) {
    this.router = router;
    this.availPort = [];
    for (let idx = 1; idx < 63000; idx += 1) {
      if (idx !== 80) {
        this.availPort.push(idx);
      }
    }

    if (fs.existsSync(constants.SHELL_PATH)) {
      this.pathInfo = JSON.parse(String(fs.readFileSync(constants.SHELL_PATH)));
    } else {
      this.pathInfo = {};
    }
  }

  static async getInstance(router: express.Router) {
    if (!Shell.instance) {
      Shell.instance = new Shell(router);
      await Shell.instance.init();
    }
    return Shell.instance;
  }

  async init() {
    for (const path of Object.keys(this.pathInfo)) {
      await this.push(path, this.pathInfo[path].command, this.pathInfo[path].filePath);
    }
  }

  async push(path: string, command: string, filePath?: string) {
    try {
      const port = this.availPort.pop() || 63001;
      await ttydUtil.create(command, port);
      this.pathInfo[path] = {
        command,
        port,
        filePath: (filePath !== '') ? filePath : undefined,
      };
      const option = {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        ws: true,
        pathRewrite: {},
      };
      option.pathRewrite[`^/shell${path}`] = '/';
      option.pathRewrite[`^/shell${path}/token`] = '/token';
      option.pathRewrite[`^/shell${path}/ws`] = '/ws';
      routeUtil.addRoute(this.router, path, createProxyMiddleware(`/shell${path}`, option));
      fs.writeFileSync(constants.SHELL_PATH, JSON.stringify(this.pathInfo), 'utf8');
      return this.pathInfo;
    } catch (error) {
      this.pop(path);
      return error;
    }
  }

  async pop(path: string) {
    try {
      routeUtil.removeRoute(this.router, path);
      await ttydUtil.remove(this.pathInfo[path].port);
      if (this.pathInfo[path].filePath) {
        fs.rmdirSync(this.pathInfo[path].filePath!);
      }
      delete this.pathInfo[path];
      fs.writeFileSync(constants.SHELL_PATH, JSON.stringify(this.pathInfo), 'utf8');
      return this.pathInfo;
    } catch (error) {
      return error;
    }
  }

  getPathInfo() {
    return this.pathInfo;
  }
}
