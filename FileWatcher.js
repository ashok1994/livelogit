const fs = require('fs');
const LogTransformStream = require('./LogTransformStream');

class FileWatcher{
    constructor(fileName){
        this.fileName = fileName;
        this.buffer = Buffer.alloc(1);
        this.currentPosition = 0;
        this.fd = null;
        this.stat = null;
        this.logTransformStream = new LogTransformStream();
    }

    async open() {
        return new Promise((resolve, reject) => {
            fs.open(this.fileName, 'r', (err, fd) => {
                if(err) reject(err);
                else resolve(fd);
            });
        });
    }

    watch(listener) {
        console.log('Starting to watch', this.fileName);
        fs.watch(this.fileName, listener);
    }

    attachListener(listener){
        this.logTransformStream.on("data", (chunk)=> {
            listener(chunk.toString());
        });
    }

    async _read() {
        
    }

    updateStats(){
        this.stat = fs.fstatSync(this.fd);
    }

    async read() {
        const prevStat = this.stat;
        this.updateStats();
        const startPos = prevStat ? prevStat.size : 0;
        const endPos = this.stat.size;
        const sizeToRead = endPos - startPos;
        const buffer = Buffer.alloc(sizeToRead);
        
        if(startPos == endPos) {
            return "";
        }

        return new Promise((resolve, reject) => {
            fs.read(this.fd, buffer, 0, sizeToRead, startPos, function(err, bytesRead, buffer) {
                if(err) reject(err);
                else resolve(buffer.toString('utf-8'));
            });
        });
        
    }

    

    async start() {
        this.fd = await this.open();
        await this.read();
        this.watch(async (event, filename) => {
            if(event === 'change'){
                const readData = await this.read();
                this.logTransformStream.write(readData);
            }
        });
    }
}




module.exports = FileWatcher;