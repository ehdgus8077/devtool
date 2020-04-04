import express from 'express';
import Redirect from '../manager/redirect';

const router = express.Router();
const redirect = Redirect.getInstance(router); 

router.get('/', async (req, res) => {
  res.send(redirect.getPathInfo());
});

router.get('/push', async (req, res) => {
  const path = req.query.path;
  const url = req.query.url;

  const result = redirect.push(path, url);
  res.send(result);
});

router.get('/pop', async (req, res) => {
  const path = req.query.path;
  const result = redirect.pop(path);
  res.send(result);
});

export default router;
