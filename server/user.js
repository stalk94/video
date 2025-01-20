const { db } = require('./db');
const { Socket } = require("socket.io");
const { chekType } = require('./function');



/**
 * status === premium = пол выбираеться, money > 50 = пол выбираеться, else = пол не выбираеться
 * активация супер поиска = 10 на 60 мин - ревалентность 100%
 * нет свободных идешь сосyт болт
 */
class User {
    timeshtampRegistration = Date.now()     
    timeshtamp = Date.now()                 // last online
    timeSuperFind = undefined               // если активирован супер поиск
    timeNewUser = (1000*60)*5               // время до окончания режима "Новичек"
    
    onStart = false                         // нажата кнопка поиска
    permision = 0                           // 0 - 2
    money = 0
    status = 'free'
    token = ''                              // для сессий
    peerId = ''                             // идентификатор для связи
    likes = 0                               // лайкм от юзеров
    superLikes = 0                          // спец
    galery = []                             // файлы пользователя
    /** 
     * @type {{[key: string]: number}} 
     * */
    story = {}                              // история просмотра
    gifts = []                              // подаренные подарки
    info = {
        country: 'UA'
    }
    activate = {
        m: false,
        f: false,
        mf: true,
        search: false
    }                                       // уточнить модель
    socket = Socket.prototype
    curentCall = undefined                  // peerId текушего сеанса
    avatar = 'img/non-avatar.jpg'
    /**
     * @type {'m'|'fem'}
    */
    sex = undefined


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
            if(key !== 'socket' && key !== 'gifts') {
                data[key] = this[key];
            }
        });

        return data;
    }
    getRevality() {
        if(this.timeSuperFind) {
            return 100;
        }
        else if(this.timeNewUser) {
            return 80;
        }
        else if(this.status === 'premium') {
            return 60;
        }
        else {
            return 20;
        }
    }
    getSexActivate() {
        if(this.activate.m) return 'm';
        else if(this.activate.f) return 'fem';
        else return 'mf';
    }
    addStory(login) {
        const arr = Object.keys(this.story);

        if(this.story[login]) this.story[login] += 1;
        else this.story[login] = 1;

        if(arr.length > 5) delete this.story[arr[0]];
    }
    _create() {

    }
    _update(data) {
        Object.keys(data).forEach((key)=> {
            this[key] = data[key];
        });

        if(Array.isArray(this.story)) this.story = {};
        if(this.status !== 'premium' && this.money < 50) {
            this.activate.f = false;
            this.activate.mf = false;
            this.activate.m = false;
        }
        this.timeshtamp = Date.now();
        this.money = data.money ?? 0;
        this.status = data.status ?? 'free';
        this.galery = data.galery ?? [];
        this.activate.mf = true;        //?
    }
    // вызывается каждые 2 секунды
    refresh() {
        this.timeshtamp = Date.now();
        // вырубаем поиски если менее 50 coin
        if(this.money < 50) {
            this.activate.m = false;
            this.activate.f = false;
            this.activate.mf = true;
        }
        // проверка таймера суперпоиска
        if(this.timeSuperFind) {
            if((this.timeSuperFind - 2) < 0) {
                this.timeSuperFind = undefined;
                this.activate.search = false;
            }
            else this.timeSuperFind -= 2;
        }

        this.emit('refreshed', this.get());
    }

    start() {
        this.onStart = true;
    }
    stop() {
        this.onStart = false;
    }
    
    // покупка супер поиска
    activateSuperFind() {
        if((this.money - 10) >= 0 && !this.timeSuperFind) {
            this.money -= 10;
            this.timeSuperFind = 60 * (60 * 1000);          //? 60 min
            this.activate.search = true;
            this.dump();

            this.emit('refreshed', {
                money: this.money,
                timeSuperFind: this.timeSuperFind
            });
            this.emit('info', {
                title: `Удачно`,
                text: 'Супер поиск был активирован на 60 min.'
            });
            APP.createIndividualAction(this.login, {
                header: 'Активация',
                text: 'Супер поиск был активирован на 60 min.'
            });
        }
        else if(this.money < 10) {
            this.emit('warn', {
                title: `Внимание!`,
                text: 'Не хватает COINS.'
            });
        }
        else if(this.timeSuperFind) {
            this.emit('warn', {
                title: `Внимание!`,
                text: 'Супер поиск был ранее активирован.'
            });
        }
    }
    /**
     * выбор пола
     * @param {'m'|'mf'|'f'} type 
     */
    activateSex(type) {
        if(this.status === 'premium' || this.money >= 50) {
            chekType(this);
            this.dump();

            this.emit('refreshed', {
                money: this.money,
                activate: this.activate
            });
            this.emit('info', {
                title: `Удачно`,
                text: 'Выбор пола активирован.'
            });
            APP.createIndividualAction(this.login, {
                header: 'Активация',
                text: 'Выбор пола активирован.'
            });
        }
        else {
            this.emit('warn', {
                title: `Внимание!`,
                text: 'Не достаточно COINS. Либо купите premium статус.'
            });
        }
    }
    addGift(gift) {
        this.gifts.push(gift);
        this.emit('gift.add', gift);
        this.dump();
    }
    // поплнение счета либо изменение баланса юзера
    addMoney(value) {
        if(value >= 150) {
            this.status = 'premium'
            this._statusTimeActivate = Date.now();

            this.emit('info', {
                title: 'PREMIUM',
                text: 'Премиум активирован на один месяц!'
            });
        }

        this.money += value;
        this.dump();
        this.emit('refreshed', {
            money: this.money,
            status: this.status
        });
    }
    // отправка по сокету
    emit(eventName, data) {
        if(this.socket) {
            this.socket.emit(eventName, data);
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
        console.log('USER EXIT: ', this.login);
        delete this.curentCall;
        this.dump();
    }
}


module.exports = User;