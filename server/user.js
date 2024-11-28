const fs = require('fs');
const { db } = require('./db');
const { Socket } = require("socket.io");
const pricesConfig = JSON.parse(fs.readFileSync('config/prices.json'));


/**
 * status === premium = пол выбираеться, money > 50 = пол выбираеться, else = пол не выбираеться
 * активация супер поиска = 10 на 60 мин - ревалентность 100%
 * нет свободных идешь сосyт болт
 */
class User {
    /**
     * @type {'m'|'f'}
     */
    sex = undefined
    timeshtap = Date.now()
    onStart = false                         // нажата кнопка поиска
    permision = 0                           // 0 - 2
    money = 0
    status = 'free'
    token = ''                              // для сессий
    peerId = ''                             // идентификатор для связи
    likes = 0                               // лайкм от юзеров
    galery = []                             // файлы пользователя
    story = []
    info = {
        country: 'RU'
    }
    activate = {
        m: false,
        f: false,
        mf: false,
        search: false
    }
    socket = Socket.prototype
    curentCall = undefined                  // peerId текушего сеанса
    timeSuperFind = undefined               // если активирован супер поиск
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
    getRevality() {
        if(this.timeSuperFind) {
            return 100;
        }
        else if(this.status === 'premium') {
            return 60;
        }
        else {
            return 20;
        }
    }
    addStory(login) {
        if(this.story.length > 4) {
            this.story.shift();
        }

        this.story.push({
            [login]: false
        });
    }
    _create() {

    }
    _update(data) {
        Object.keys(data).forEach((key)=> {
            this[key] = data[key];
        });

        //this.bonusTime = data.bonusTime ?? 5 * (60 * 1000);
        this.money = data.money ?? 0;
        this.status = data.status ?? 'free';
        this.forvards = data.forvards ?? [];
        this.galery = data.galery ?? [];
    }
    // чекалка возможности выбрать пол
    _chekSexActivate() {
        if(this.status === 'premium' || this.money >= 50) {
            return true;
        }
    }
    // отправка по сокету
    emit(eventName, data) {
        this.socket.emit(eventName, data);
    }

    start() {
        this.onStart = true;
    }
    stop() {
        this.onStart = false;
    }
    
    activateSuperFind() {
        if(this.money - 10 >= 0 && !this.timeSuperFind) {
            this.money -= 10;
            this.timeSuperFind = 60 * (60 * 1000);          //?

            this.emit('refreshed', {
                money: this.money,
                timeSuperFind: this.timeSuperFind
            });
        }
    }
    addMoney(value) {
        if(value >= 150) {
            this.status = 'premium'
            this._statusTimeActivate = Date.now();
        }

        this.money += value;
        this.emit('refreshed', {
            money: this.money,
            status: this.status
        });
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