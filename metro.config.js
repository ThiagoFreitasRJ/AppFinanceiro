const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

// Bloqueia arquivos Next.js que possam existir localmente (src/app/)
config.resolver.blockList = [
  /src\/app\/.*/,
];

module.exports = config;
