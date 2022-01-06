const react = require('@vitejs/plugin-react');

/** @type { import('vite').UserConfig } */
const config = {
  plugins: [react()],
};

module.exports = config;
