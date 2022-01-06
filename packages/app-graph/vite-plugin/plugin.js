const nodeFs = require('node:fs');
const nodePath = require('node:path');
const { build } = require('vite');
const polka = require('polka');
const sirv = require('sirv');

/** @type { () => import('vite').PluginOption }*/
module.exports = function () {
  let root = process.cwd();
  /** @type string */
  let clientOutDir;

  const getHandlerFile = () => nodePath.resolve(__dirname, 'api.js');

  return {
    name: 'server-api',

    configResolved(config) {
      root = config.root;
      clientOutDir = nodePath.resolve(root, '../dist');
    },

    configureServer(devServer) {
      const handlerFile = getHandlerFile();
      const config = require(nodePath.resolve(process.cwd(), 'eclaireur.config.js'));
      devServer.middlewares.use(async (req, res, next) => {
        try {
          const mod = await devServer.ssrLoadModule(`/@fs/${handlerFile}`);
          const server = polka({
            onNoMatch: () => next(),
          });
          server.use((req, res, next) => {
            req.eclaireurConfig = config;
            next();
          });
          server.use(mod.handler);
          server.use(sirv(clientOutDir));
          server.use((req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(nodeFs.readFileSync(nodePath.resolve(clientOutDir, 'index.html')));
          });
          server.handler(req, res);
        } catch (error) {
          devServer.ssrFixStacktrace(error);
          process.exitCode = 1;
          next(error);
        }
      });
    },
  };
};
