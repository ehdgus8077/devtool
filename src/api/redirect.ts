import express from 'express';
import Redirect from '../manager/redirect';

const router = express.Router();

router.get('/', async (req, res) => {
  res.send(Redirect.getInstance(router).getPathInfo());
});

router.get('/push', async (req, res) => {
  const path = req.query.path;
  const url = req.query.url;

  const result = Redirect.getInstance(router).push(path, url);
  res.send(result);
});

router.get('/pop', async (req, res) => {
  const path = req.query.path;
  const result = Redirect.getInstance(router).pop(path);
  res.send(result);
});

export default router;
