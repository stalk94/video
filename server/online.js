const { db } = require('./db');
const User = require('./user');
const { Socket } = require("socket.io");
const { getPasswordHash, setPasswordHash } = require('./function');


const online = {
    timePremium: (1000*60)*60*24*30,
    online: {},

    init() {
        const time = Date.now();

        Object.keys(this.online).forEach((peerid)=> {
            /**@type {User} */
            const user = this.online[peerid];

            // проверка таймера статуса Новичка
            if(user.timeNewUser) {
                if((user.timeNewUser - (30*1000)) < 0) {
                    user.timeNewUser = undefined;
                }
                else user.timeNewUser -= 30 * 1000;
            }
            // проверка premium
            if(user._statusTimeActivate) {
                if((time - user._statusTimeActivate) > this.timePremium) {
                    delete user._statusTimeActivate;
                    user.status = 'free';
                    user.dump();

                    APP.createIndividualAction(user.login, {
                        header: '📅Premium expired',
                        text: 'Premium status has expired.'
                    });
                }
            }
            // 14 секунд и оффлайн
            if((user.timeshtamp+14000) < time) {
                console.log('USER cleared by the system: ', user.login);
                user.emit('system.clear', {});
                APP.exit(user.peerId);
            }
        });
    },
    /**
     * Добавить в список online
     * @param {string} peerId 
     * @param {User} user 
     */
    set(peerId, user) {
        this.online[peerId] = user;
        db.set('SESSIONS.' + user.token, {
            login: user.login,
            timeshtamp: Date.now()
        });
    },
    getCountsOnline() {
        const result = {
            users: 0,
            bots: 0
        }

        Object.values(this.online).forEach((elem)=> {
            if(elem._bot) result.bots += 1;
            else result.users += 1;
        });

        return result;
    },
    /**
     * Восстановить сесию
     * @param {string} token 
     * @param {string} peerId 
     * @param {Socket} socket 
     * @returns {User}
     */
    async findSession(token, peerId, socket) {
        const session = await db.get('SESSIONS.' + token);

        if(session) {
            this.chekMultiOnline(session.login, peerId);
            const userData = await db.get('USERS.' + session.login);

            if(userData) {
                const user = new User(userData.login, userData.password);
                user._update(userData);
                user.peerId = peerId;
                user.socket = socket;
                user.token = token;
                this.online[peerId] = user;

                return user.get();
            }
        }
    },
    /**
     * Зачистить сессии юзера
     * @param {string} login 
     * @param {string} sidExcp 
     * @returns 
     */
    async deleteAllSession(login, sidExcp) {
        const all = await db.get('SESSIONS');
        
        Object.keys(all).forEach((sid)=> {
            if(sid !== sidExcp && all[sid].login === login) {
                db.delete('SESSIONS.' + sid);
            }
        });

        return true;
    },
    /**
     * Проверяет на онлайн такого же юзера и кикает
     * @param {string} login 
     * @param {string} curPeerId 
     */
    chekMultiOnline(login, curPeerId) {
        Object.keys(this.online).forEach((peerId)=> {
            const curUser = this.online[peerId];
            // кто то сидит еще
            if(curUser.login === login && peerId !== curPeerId) {
                curUser.emit('kikc', {type: 'multi'});
                if(curUser.curentCall) APP.finish(peerId);
                curUser.exit();
                delete this.online[peerId];
            }
        });
    },
    remove(login) {
        Object.keys(this.online).forEach((key)=> {
            if(this.online[key].login === login) {
                delete this.online[key];
            }
        });
    },
    exit(peerId) {
        Object.keys(this.online).forEach((key)=> {
            if(this.online[key].peerId === peerId) {
                const user = this.online[key];
                user.exit();

                delete this.online[key];
            }
        });
    }
}


const registration = async function(login, password, sex, ipData, email, ref) {
    if(await db.has("USERS." + login)) return { error: "login is taken" };
    else {
        const user = new User(login, setPasswordHash(password));
        user.sex = sex;

        if(email) user.email = email;
        if(ipData) user.info = ipData;
        if(ref) user.ref = ref; 

        user._create();
        await db.set('USERS.' + login, user.get());

        return user.get();
    };
}
const autorize = async function(login, password, sid, peerId, socket) {
    const loginHas = await db.has('USERS.' + login);
    
    if(loginHas) {
        const data = await db.get('USERS.' + login);

        if(getPasswordHash(data.password) === password){
            const user = new User(login, data.password);
            
            online.remove(login);
            online.chekMultiOnline(login, peerId);
            online.deleteAllSession(login, sid);
            user._update(data);
            user.token = sid;
            user.peerId = peerId;
            user.socket = socket;

            online.set(peerId, user);
            
            return user.get();
        }
        else return {error:'error login or password'};
    }
    else return {error:'not find user'};
}
const googleOuth = async function(googleData, sid, peerId, socket, sex, ipData, ref) {
    const id = googleData.id;
    const loginHas = await db.has('USERS.' + id);
    
    if(loginHas) {
        const data = await db.get('USERS.' + id);
        const user = new User(id, setPasswordHash(id));
        online.remove(id);
        online.chekMultiOnline(id, peerId);
        online.deleteAllSession(id, sid);
        user._update(data);
        user.token = sid;
        user.peerId = peerId;
        user.socket = socket;
        user.googleData = googleData;

        online.set(peerId, user);
        
        return user.get();
    }
    else {
        const user = new User(id, setPasswordHash(id));
        user.sex = sex;

        if(ipData) user.info = ipData;
        if(ref) user.ref = ref;

        user.googleData = googleData;
        user._create();
        user.token = sid;
        user.peerId = peerId;
        user.socket = socket;
        await db.set('USERS.' + id, user.get());

        online.set(peerId, user);

        return user.get();
    }
}
const fbOuth = async function(fbData, sid, peerId, socket, sex, ipData, ref) {
    const id = fbData.id;
    const loginHas = await db.has('USERS.' + id);
    
    if(loginHas) {
        const data = await db.get('USERS.' + id);
        const user = new User(id, setPasswordHash(id));
        online.remove(id);
        online.chekMultiOnline(id, peerId);
        online.deleteAllSession(id, sid);
        user._update(data);
        user.token = sid;
        user.peerId = peerId;
        user.socket = socket;
        user.googleData = fbData;

        online.set(peerId, user);
        
        return user.get();
    }
    else {
        const user = new User(id, setPasswordHash(id));
        user.sex = sex;

        if(ipData) user.info = ipData;
        if(ref) user.ref = ref;

        user.googleData = fbData;
        user._create();
        user.token = sid;
        user.peerId = peerId;
        user.socket = socket;
        await db.set('USERS.' + id, user.get());

        online.set(peerId, user);

        return user.get();
    }
}



module.exports = {
    online,
    registration,
    autorize,
    googleOuth,
    fbOuth
}