import express from 'express';

export const addRoute = (router: express.Router, path: string, method: any) => {
  router.get(path, method);
};

export const removeRoute = (router: express.Router, path: string) => {
  const layers = router.stack;
  const newLayers: any[] = [];
  for (const layer of layers) {
    const layerPath: string = layer.route.path;
    if (layerPath.indexOf(path) !== 0) {
      newLayers.push(layer);
    }
  }
  router.stack = newLayers;
};
