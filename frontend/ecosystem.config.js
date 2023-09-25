module.exports = {
  apps: [
    {
      name: 'SecureGate_Frontend',
      exec_mode: 'cluster',
      instances: 'max',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start'
    }
  ]
}