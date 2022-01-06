const { createServer } = require('vite');
const serverApi = require('../vite-plugin/plugin');

(async () => {
  const { PORT: port = 3000 } = process.env;
  const server = await createServer({
    configFile: false,
    root: __dirname,
    plugins: [serverApi()],
    server: {
      port,
    },
  });

  await server.listen();

  server.printUrls();
})();
