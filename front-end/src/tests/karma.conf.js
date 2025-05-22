module.exports = function (config) {
    config.set({
      reporters: ['progress', 'coverage'], // Ajout de 'coverage'
      coverageReporter: {
        type: 'html', // Format de sortie (peut être 'json', 'lcov', 'text', etc.)
        dir: 'coverage/' // Dossier où seront stockés les rapports
      }
    });
  };