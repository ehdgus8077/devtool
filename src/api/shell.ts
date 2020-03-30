import express from 'express';
import multer from 'multer';
import * as util from 'util';
import * as constants from '../common/constants';
import Shell from '../manager/shell';

const exec = util.promisify(require('child_process').exec);

const upload = multer({ dest: constants.KEY_PATH }).single('file');
const router = express.Router();

router.get('/', async (_, res) => {
  res.render('shell.html');
});

router.post('/push', async (req, res) => {
  upload(req, res, async (error) => {
    const path = req.body.path;
    let command = req.body.command;
    let filePath;
    if (error) {
      res.send(error);
    }
    if (req.file) {
      filePath = `${constants.KEY_PATH}/${req.file.originalname}`;
      await exec(`mv ${constants.KEY_PATH}/${req.file.filename} ${filePath}`);
      await exec(`chmod 400 ${filePath}`);
      command = command.replace('*', filePath);
    }
    const shell = await Shell.getInstance(router);
    const result = await shell.push(path, command, filePath);
    res.send(result);
  });
});

router.get('/pop', async (req, res) => {
  const path = req.query.path;
  const shell = await Shell.getInstance(router);
  const result = await shell.pop(path);
  res.send(result);
});
export default router;
