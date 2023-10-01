const execSync = require('child_process').execSync;
const env = Object.create(process.env);

env.CURRENT_GIT_SHA = execSync('git rev-parse --short HEAD').toString();
env.CURRENT_GIT_BRANCH = execSync('git branch --show-current').toString();
env.NODE_ENV = 'development';

console.log('Used env variables: ' + JSON.stringify(env));
console.log('Run dev script: nodemon');

execSync('nodemon', { env: env, stdio: 'inherit' });