const fs = require('fs');


setInterval(() => {
    const randomlog = Date.now() + '   - Some random log\n';
    fs.appendFileSync('x.txt', randomlog);
}, 100);