const FakeUser = require('./fake_user');
const User = require('./user');
const { online } = require('./online');
const { db } = require('./db');


module.exports = {
    init() {
        this._load();

        setInterval(()=> {
            this._load();
        }, 1000 * 60);
    },
    async getAllBots() {
        return await db.get('FAKE');
    },
    async getAllUsers() {
        return await db.get('USERS');
    },
    // управление ботами
    async _load() {
        let all = await db.get('FAKE');
        const time = new Date();
    
        // создаем тестового бота
        if(!all) {
            const bot = new FakeUser('testBaby');
            bot._create(bot);
            all = {testBaby: bot.get()};
        }

        Object.keys(all).forEach((key)=> {
            /** @type {FakeUser} */
            const fake = all[key];

            if(time.getHours() >= fake.time.start) {
                if(!online.online[fake.peerId]) {
                    console.log('BOT ADD ONLINE');
                    const user = new FakeUser(fake.login);
                    user._update(fake);
                    online.online[fake.peerId] = user;
                }
            }
            else if(time.getHours() > fake.time.end) {
                if(online.online[fake.peerId] && online.online[fake.peerId]._bot) {
                    console.log('BOT OFFLINE');
                    online.online[fake.peerId].exit();
                    delete online.online[fake.peerId];
                }
            }
        });
    },


    async create(peerId, data) {
        const user = online.online[peerId];
        const hasBot = await db.has(`FAKE.${data.login}`);

        if(user && user.permision > 0) {
            if(!hasBot) {
                const bot = new FakeUser(data.login);
                bot._create(data);
                await bot.dump();
    
                return bot;
            }
            else return {error: 'Логин бота занят'}
        }
        else return {error: 'Нет прав'}
    },
    async edit(peerId, data) {
        const user = online.online[peerId];
        const hasBot = await db.get(`FAKE.${data.login}`);

        if(user && user.permision > 0 && hasBot) {
            const bot = new FakeUser(data.login);
            bot._update(data);
            await bot.dump();

            if(online.online[bot.peerId]) {
                online.online[bot.peerId] = bot;
            }
        }
    },
    async loadVideo(login, videoName, videoData) {
        const data = await db.get(`FAKE.${login}`);

        if(data) {
            const bot = new FakeUser(login);
            bot._update(data);
            bot.loadVideo(videoName, videoData);

            if(online.online[bot.peerId]) {
                online.online[bot.peerId] = bot;
            }
        }
    },

    async editUser(peerId, data) {
        const user = online.online[peerId];
        const hasUser = await db.get(`USERS.${data.login}`);

        if(user && user.permision > 0 && hasUser) {
            const findOnline = Object.values(online.online).find((elem)=> elem.login === data.login);
            
            if(findOnline) {
                // добавлены коины
                if(data.money && data.money > findOnline.money) {
                    findOnline.addMoney(data.money - findOnline.money);
                }

                findOnline._update(data);
                findOnline.dump();
                findOnline.emit('refreshed', data);
            }
            else {
                const newUser = new User(hasUser.login, hasUser.password);
                newUser._update(hasUser);
                // добавлены коины
                if(data.money && data.money > hasUser.money) {
                    newUser.addMoney(data.money - hasUser.money);
                }

                newUser._update(data);
                newUser.dump();
            }
        }
    }
}

//&& time.getHours() < fake.time.start