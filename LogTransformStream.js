const stream = require('stream');

class LogTransformStream extends stream.Transform {
    constructor() {
        super();
        this._buffer = "";
        this._separator = "\n";
    }

    _transform(chunk, enc, done) {
        let sepPos;
        this._buffer += chunk.toString();
        while((sepPos = this._buffer.indexOf(this._separator)) != -1) {
            var portion = this._buffer.substr(0, sepPos);
            this.push(portion);
            this._buffer = this._buffer.substr(sepPos + this._separator.length);
        }
        done();
    }
}

module.exports = LogTransformStream;