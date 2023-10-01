const execSync = require('child_process').execSync;
const os = require('os');
const env = Object.create(process.env);

env.CURRENT_GIT_SHA = execSync('git rev-parse --short HEAD').toString();
env.CURRENT_GIT_BRANCH = execSync('git branch --show-current').toString();

console.log('Used env variables: ' + JSON.stringify(env));
console.log('Run build script: tsc');

execSync('tsc', { env: env, stdio: 'inherit' });
if (os.type() === 'Windows_NT') {
  execSync('powershell cp -r src/web/modules/templates dist/web/modules', { encoding: 'utf-8', stdio: 'inherit' });
  execSync('powershell cp -r src/web/modules/locales dist/web/modules', { encoding: 'utf-8', stdio: 'inherit' });
} else {
  execSync('cp -r src/web/modules/templates dist/web/modules', { encoding: 'utf-8', stdio: 'inherit' });
  execSync('cp -r src/web/modules/locales dist/web/modules', { encoding: 'utf-8', stdio: 'inherit' });
}