const fs = require('fs');
const shell = require("shelljs");
const { db } = require('./db');


class FakeUser {
    _bot = true
    /**
     * @type {'m'|'f'}
     */
    sex = undefined
    onStart = true
    timeshtap = Date.now()
    time = {
        start: 12,
        end: 1
    }
    peerId = ''
    money = 0
    status = 'free'
    likes = 0                               // лайкм от юзеров
    galery = []                             // файлы пользователя
    story = []
    videos = [] 
    info = {
        country: 'RU'
    }
    curentCall = undefined                  // peerId текушего сеанса
    avatar = 'img/non-avatar.jpg'

    /**
     * 
     * @param {string} login 
     * @param {string} passwordHash 
     */
    constructor(login) {
        this.login = login;
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
    #addStory(login) {
        if(this.story.length > 4) {
            this.story.shift();
        }

        this.story.push(login);
    }
    _create(data) {
        this.peerId = Date.now().toString();

        Object.keys(data).forEach((key)=> {
            this[key] = data[key];
        });

        if(this.login!=='testBaby') fs.mkdir(__dirname + `/src/upload/${this.login}`, (err)=> {
            if(err) logger.error(err, 'ERROR CREATE BOT DIR');
        });
        this.dump();
    }
    _update(data) {
        Object.keys(data).forEach((key)=> {
            this[key] = data[key];
        });
        shell.ls(`src/upload/${this.login}`).forEach((elem)=> {
            if(elem.split('.')[1])  this.videos.push(elem);
        });

        this.money = data.money ?? 0;
        this.status = data.status ?? 'free';
        this.galery = data.galery ?? [];
    }

    start() {
        
    }
    stop() {
       
    }

    async dump() {
        const data = {};
        Object.keys(this).forEach((key)=> {
            if(key!=='socket' || key!=='peerId') {
                data[key] = this[key];
            }
        });

        delete data.socket;
        db.set('FAKE.' + this.login, data);
    }
    loadVideo(videoName) {
        this.videos = shell.ls(`src/upload/${this.login}`);
        console.log(this.videos);
        db.set(`FAKE.${this.login}.videos`, this.videos);
    }
    exit() {
        delete this.curentCall;
        this.dump();
    }
}


module.exports = FakeUser;