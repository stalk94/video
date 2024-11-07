const { db } = require('./db');
const { Socket } = require("socket.io");


class User {
    /**
     * @type {'m'|'f'}
     */
    sex = undefined
    permision = 0                           // 0 - 4
    time = 0                                // время для просмотра чата платное
    bonusTime = 5 * (60 * 1000)             // время для просмотра чата free
    token = ''                              // для сессий
    peerId = ''                             // идентификатор для связи
    status = 'free'
    forvards = []                           // избранные контакты (логины)
    galery = []                             // файлы пользователя
    socket = Socket.prototype
    curentCall = undefined                  // peerId текушего сеанса
    avatar = 'img/non-avatar.jpg'

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

        this.bonusTime = data.bonusTime ?? 5 * (60 * 1000);
        this.time = data.time ?? 0;
        this.status = data.status ?? 'free';
        this.forvards = data.forvards ?? [];
        this.galery = data.galery ?? [];
    }
    // отправка по сокету
    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    // --- timers ---
    start() {
        this._timeStartChat = Date.now();
    }
    stop() {
        if(this.curentCall && this._timeStartChat) {
            if(this.time) {
                if(Date.now() <= (this._timeStartChat + this.time)) {
                    this.time = 0;
                }
                else this.time -= (Date.now() - this._timeStartChat);
            }
            else {
                if(Date.now() <= (this._timeStartChat + this.bonusTime)) {
                    this.bonusTime = 0;
                }
                else this.bonusTime -= (Date.now() - this._timeStartChat);
            }

            delete this._timeStartChat;
            this.emit('refreshed', {
                time: this.time
            });
        }
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