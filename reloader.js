#!/usr/bin/env node


    var args = ['server.js'];
    var files = [
        'server.js',
        'Shared/MATH',
        'Shared/GAME',
        'Shared/MODEL',
        'Shared/ACTIONS',
        'Shared/io/SocketMessages',
        'Server/io/ServerConnection',
        'Shared/io/Message',
        'Shared/io/SocketMessages',
        'Server/io/Clients',
        'Server/io/Client',
        'Server/DataHub',
        'Server/Game/ServerWorld',
        'Server/Game/ServerGameMain',
        'Server/ServerMain',
        'Server/Game/ServerPlayer',
        'Server/io/ConfigLoader'
    ];


    var fs = require('fs')
        , exec = require('child_process').exec
        , spawn = require('child_process').spawn
        , child = null
        , double_dashes = false
        , i = 0;

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
        watch(chunk.split('\n'));
    });
    process.stdin.on('close', function () {
        start();
    });

    process.argv.forEach(function (arg) {
        if (++i < 3) {
            return;
        }
        if (arg == '--') {
            double_dashes = true;
            return;
        }
        if (double_dashes) {
            files.push(arg);
        }
        else {
            args.push(arg);
        }
    });

    watch(files);
    if (files.length > 0) {
        start();
    }

    function reload() {
        stop();
        start();
    }

    function stop() {
        if (child === null) {
            return;
        }
        child.kill();
    }

    function start() {
        if (child !== null
            && !child.killed) {
            return;
        }
        var opts = {customFds: [process.stdin, process.stdout, process.stderr],
            cwd: process.cwd()};
        child = spawn('node', args, opts);
    }

    function watch(files) {
        files.forEach(function (filename) {
            console.log('watchFile:'+filename+'.js');
            fs.watchFile(filename+'.js', function (curr, prev) {
                if (+curr.mtime !== +prev.mtime) {
                    reload();
                }
            });
        });
    }