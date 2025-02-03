const fs = require('fs');
const path = require('path');
const shell = require("shelljs");
const FakeUser = require('./fake_user');
const User = require('./user');
const { online } = require('./online');
const { db } = require('./db');
const { getFileExtension } = require('./function');


module.exports = {
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

            // проверка на рабочее время
            if(time.getDay() === fake.time.startDay) {
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
            }
            else if(online.online[fake.peerId] && online.online[fake.peerId]._bot) {
                console.log('BOT OFFLINE');
                online.online[fake.peerId].exit();
                delete online.online[fake.peerId];
            }
        });
    },
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
        const users = await db.get('USERS');
        Object.keys(online.online).map((peerId)=> {
            const entity = online.online[peerId];

            if(!entity._bot && users[entity.login]) {
                users[entity.login].isOnline = true;
                users[entity.login].peerId = peerId;
            }
        });

        return users;
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
            else user.emit('error', {text: 'Логин бота занят'});
        }
        else if(user) user.emit('error', {text: 'Нет прав'})
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
    async delete(peerId, data) {
        const user = online.online[peerId];
        const hasBot = await db.get(`FAKE.${data.login}`);

        if(user && user.permision > 0 && hasBot) {
            await db.delete(`FAKE.${data.login}`);
            fs.rmdirSync(`src/upload/${data.login}`, { recursive: true, force: true });

            if(online.online[hasBot.peerId]) {
                delete online.online[hasBot.peerId];
            }
        }
    },
    /**
     * 
     * @param {string} login 
     * @param {string} videoName 
     * @param {*} videoData 
     * @param {Function} clb 
     */
    async loadVideo(login, videoName, videoData, clb) {
        const data = await db.get(`FAKE.${login}`);

        if(data) {
            const bot = new FakeUser(login);
            bot._update(data);
            bot.loadVideo(videoName, videoData, clb);

            if(online.online[bot.peerId]) {
                online.online[bot.peerId] = bot;
            }
        }
    },
    async loadAvatar(login, nameImg, dataImg, clb) {
        const data = await db.get(`USERS.${login}`);
        const formatFile = "." + getFileExtension(nameImg);
        const newName = `${login}-${Date.now()}${formatFile}`;
        data.avatar = `img/avatar/${newName}`;

        if(data) {
            const findPeerId = Object.keys(online.online).find((key)=> online.online[key].login === login);

            fs.writeFile('src/'+data.avatar, dataImg, (err)=> {
                clb(err);
                db.set(`USERS.${login}.avatar`, data.avatar);
                if(findPeerId !== undefined) {
                    online.online[findPeerId].avatar = data.avatar;
                    online.online[findPeerId]?.emit('refreshed', {avatar: data.avatar});
                }
                // чистка временной папки
                shell.ls(`uploads`).forEach((name)=> {
                    fs.unlink(`uploads/${name}`, console.log);
                });
                // чиста старых аватаров
                fs.readdir(process.cwd()+`/src/img/avatar`, (err, files) => {
                    if(err) return;

                    files.forEach((name)=> {
                        if(name.includes(`${login}-`) && name !== newName) {
                            const filePath = path.join(process.cwd()+`/src/img/avatar/`, name);
                            fs.unlink(filePath, (err)=> {
                                if (err) console.error('Ошибка при удалении файла:', err);
                            });
                        }
                    });
                });
            });
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
//&& time.getDay() <= fake.time.endDay