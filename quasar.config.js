const { configure } = require('quasar/wrappers');
const path = require('path');

module.exports = configure(function () {
  return {
    boot: ['i18n', 'axios', 'loadPdfFont'],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'hash',
      publicPath: '/Material-management/', // ← 這裡一定要設定為 repo 名稱（尾部要有 /）
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: []
    },

    animations: [],

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,

      extendManifestJson(json) {
        Object.assign(json, {
          name: 'Material Management',
          short_name: 'Material',
          description: '貨物流動管理系統',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#ffffff',
          theme_color: '#027be3',
          icons: [
            {
              src: 'icons/favicon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: 'icons/favicon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/favicon-256x256.png',
              sizes: '256x256',
              type: 'image/png'
            },
            {
              src: 'icons/favicon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: 'icons/favicon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        });
      }
    }
  }
});
