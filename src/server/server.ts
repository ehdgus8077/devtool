import express from 'express';
import bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as constants from '../common/constants';
import Logger from '../common/logger';
import shellRouter from '../api/shell';
import redirectRouter from '../api/redirect';
// ChildProcessWithoutNullStreams
const log = Logger.createLogger('server.server');

export default class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  public async start() {
    await this.addEvent();
    this.app.listen(constants.SERVER_PORT,
      () => log.info(`Example app listening on port ${constants.SERVER_PORT}!`));
  }

  private async addEvent() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.set('views', './html');
    this.app.engine('html', ejs.renderFile);

    this.app.use('/go', redirectRouter);
    this.app.use('/sh', shellRouter);
  }
}
