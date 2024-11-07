const CryptoJS = require('crypto-js');


exports.setPasswordHash =(pass)=> {
    return CryptoJS.AES.encrypt(pass, 'xa4ikxa4ik').toString()
}
exports.getPasswordHash =(hashPass)=> {
    return CryptoJS.AES.decrypt(hashPass, 'xa4ikxa4ik').toString(CryptoJS.enc.Utf8)
}

exports.scheme = {
    data: {
        login: RegExp(/^[A-Za-z0-9_-]{3,21}$/),
        password: RegExp(/^[A-Za-z0-9_-]{6,34}$/)
    },
    massage : RegExp(/^[^&<>`$"']{2,300}$/)
}