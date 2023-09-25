module.exports = {
  apps: [
    {
      name: 'SecureGate_Backend',
      script: './dist/index.js',
      env: {
        'NODE_ENV': 'production'
      }
    }
  ]
}