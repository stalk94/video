const { db } = require('./db');
const { Socket } = require("socket.io");


class User {
    /**
     * @type {'m'|'f'}
     */
    sex = undefined
    permision = 0                           // 0 - 4
    token = ''                              // для сессий
    peerId = ''                             // идентификатор для связи
    status = 'free'
    forvards = []
    socket = Socket.prototype
    curentCall = undefined                  // peerId текушего сеанса
    avatar = 'src/img/non-avatar.jpg'

    /**
     * 
     * @param {string} login 
     * @param {string} passwordHash 
     */
    constructor(login, passwordHash) {
        this.login = login;
        this.password = passwordHash;
    }
    get() {
        const data = {};
        Object.keys(this).forEach((key)=> {
            if(key!=='socket') {
                data[key] = this[key];
            }
        });

        return data;
    }
    _create() {

    }
    _update(data) {
        Object.keys(data).forEach((key)=> {
            this[key] = data[key];
        });
    }
    // отправка по сокету
    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    dump() {
        const data = {};
        Object.keys(this).forEach((key)=> {
            if(key!=='socket' || key!=='peerId') {
                data[key] = this[key];
            }
        });

        delete data.socket;
        db.set('USERS.' + this.login, data);
    }
    exit() {
        delete this.curentCall;
        this.dump();
    }
}


module.exports = User;