const CryptoJS = require('crypto-js');


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


exports.scheme = {
    data: {
        login: RegExp(/^[A-Za-z0-9_-]{3,21}$/),
        password: RegExp(/^[A-Za-z0-9_-]{6,34}$/)
    },
    massage : RegExp(/^[^&<>`$"']{2,300}$/)
}