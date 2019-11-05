const http = require('http');
const fs = require("fs");
const express = require('express');
const socketio = require('socket.io');

const FileWatcher = require('./FileWatcher');


function getFileNameFromCommandLine() {
    return process.argv[2];
}

function createApp() {
    const app = express();
    const httpServer = http.createServer(app);
    const io = socketio(httpServer);
    return {
        app,
        httpServer,
        io
    };
}

function isFilePresent(path) {
    try {
        const data = fs.statSync(path);    
        return true;
    }catch(e) {
        const message = `File not present error: ${path} is not present
Please provide a valid path
`;
        process.stderr.write(message);
        process.exit(1);
    } 
}

const fileName = getFileNameFromCommandLine();

if(isFilePresent(fileName)){
    bootstrap(fileName);    
}

function bootstrap(fileName){
    const fileWatcher = new FileWatcher(fileName);
    const { app, httpServer, io } = createApp();

    attachRoute(app);
    attachIOHandler(io, { fileName });
    startApp(httpServer);
    
    fileWatcher.attachListener((line) => {
        io.emit('logline', line);
    });

    fileWatcher.start();
}

function attachRoute(app) {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
}

function attachIOHandler(io, meta) {
    io.on('connection', function(socket) {
        console.log('Client connected with id', socket.id);
        socket.emit('filename', meta.fileName);
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
}


function startApp(httpServer) {
    const port = 3000;
    httpServer.listen(port, (err) => {
        if(err) {
            console.log(err.message);
        } else {
            console.log(`Started server at http://localhost:3000`);
        }
    });
}
// Usage : 
// (async function run() {
//     const fileName = getFileNameFromCommandLine();
//     if(!fileName) return;
//     const fileWatcher = new FileWatcher(fileName);
//     fileWatcher.start();
// })();


