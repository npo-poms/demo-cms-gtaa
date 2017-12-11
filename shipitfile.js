module.exports = function(shipit) {
    require('shipit-deploy')(shipit);
    var chalk = require('chalk');
    var util = require('util');

    shipit.initConfig({
        default: {
            workspace: '/tmp/shipit/demo-cms-gtaa',
            deployTo: '/data/demo-cms-gtaa/',
            repositoryUrl: 'git@bitbucket.org:vpro/demo-cms-gtaa.git',
            ignores: ['.git', '.DS_Store', 'node_modules'],
            rsync: ['--del'],
            keepReleases: 2,
            shallowClone: true
        },
        test: {
            servers: 'root@vs-appl-02.vpro.nl'
        }
    });

    shipit.on('updated', function() {
        shipit.start('npm install');
        shipit.start('keycloak config');
        shipit.start('restart');
    });

    shipit.task('npm install', function() {
        var cdPath = shipit.releasePath || shipit.currentPath;
        chalk.green("Installing packages at path %s", cdPath);
        return shipit.remote(util.format('cd %s && PATH=$PATH:/data/nvm/current/versions/node/v8.2.1/bin/ npm install --production --silent', cdPath));
    });

    shipit.task('keycloak config', function() {
        var cdPath = shipit.releasePath || shipit.currentPath;
        chalk.green("Installing keycloak.json");
        return shipit.remote(util.format('cd %s && mv keycloak-test.json keycloak.json', cdPath));
    });

    shipit.task('restart', ['keycloak config', 'npm install'], function() {
        return shipit.remote('service demo-cms-gtaa restart');
    });
};