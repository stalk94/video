const CryptoJS = require('crypto-js');
const { SourceMapConsumer } = require('source-map-js');
const fs = require('fs');

exports.setPasswordHash =(pass)=> {
    return CryptoJS.AES.encrypt(pass, 'xa4ikxa4ik').toString()
}
exports.getPasswordHash =(hashPass)=> {
    return CryptoJS.AES.decrypt(hashPass, 'xa4ikxa4ik').toString(CryptoJS.enc.Utf8)
}
exports.useTimeFormat =()=> {
    const time = new Date();
    const dmy = `${time.getDay()}.${time.getMonth()}.${time.getFullYear()} `;
    const hm = `${time.getHours()}:${time.getMinutes()}`;

    return(
        `[${dmy}] ${hm}`
    );
}
exports.chekType =(user, newType)=> {
    const vals = [];
    ['m', 'f', 'mf'].forEach((elem)=> {
        if(elem!==newType) vals.push(elem);
    });
    
    vals.forEach((type)=> {
        user.activate[type] = false;
    });

    user.activate[newType] = true;
}
exports.chekUserLogin =(userData)=> {
    if(userData.googleData) {
        return `${userData.googleData.name} ${userData.googleData.familyName}`;
    }
    else return userData.login;
}
 // Используем регулярное выражение для извлечения расширения
exports.getFileExtension =(filename)=> {
    const match = filename.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : null;
}
exports.findSourcesMap =()=> {
    fs.readdir('dist/assets/', (err, files)=> {
        if(!err) {
            const mapFiles = files.filter((file)=> file.endsWith('.js.map'));

            if(mapFiles[0]) {
                const find = `dist/assets/${mapFiles[0]}`;
                fs.renameSync(find, 'config/source-map.js.map');
            }
        }
    });
}
exports.findErrorSource =(position, clb)=> {
    const arr = position.split(':');

    fs.readFile('config/source-map.js.map', {encoding:'utf-8'}, (err, data)=> {
        if(!err) {
            const consumer = new SourceMapConsumer(JSON.parse(data));
            const original = consumer.originalPositionFor({
                line: +arr[0],
                column: +arr[1],
            });
            
            clb(original);
        }
    });
}


exports.scheme = {
    data: {
        login: RegExp(/^[A-Za-z0-9_-]{3,21}$/),
        password: RegExp(/^[A-Za-z0-9_-]{6,34}$/)
    },
    massage : RegExp(/^[^&<>`$"']{2,300}$/)
}