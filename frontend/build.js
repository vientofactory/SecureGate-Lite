const execSync = require('child_process').execSync;
const env = Object.create(process.env);

env.NUXT_ENV_BUILD_DATE = new Date().getTime();
env.NUXT_ENV_CURRENT_GIT_SHA = execSync('git rev-parse --short HEAD').toString();
env.NUXT_ENV_CURRENT_GIT_BRANCH = execSync('git branch --show-current').toString();

console.log('Used env variables: ' + JSON.stringify(env));
console.log('Run build script: nuxt build');

execSync('nuxt build', { env: env, stdio: 'inherit' });