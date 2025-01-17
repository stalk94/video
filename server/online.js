const { db } = require('./db');
const User = require('./user');
const { getPasswordHash, setPasswordHash } = require('./function');


const online = {
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
            // 14 секунд и оффлайн
            if((user.timeshtamp+14000) < time) {
                APP.exit(user.peerId);
            }
        });
    },
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
    async findSession(token, peerId, socket) {
        const session = await db.get('SESSIONS.' + token);

        if(session) {
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
    async deleteAllSession(login, sidExcp) {
        const all = await db.get('SESSIONS');
        
        Object.keys(all).forEach((sid)=> {
            if(sid !== sidExcp && all[sid].login === login) {
                db.delete('SESSIONS.' + sid);
            }
        });

        return true;
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


const registration = async function(login, password, sex, ipData) {
    if(await db.has("USERS." + login)) return { error: "Логин занят" };
    else {
        const user = new User(login, setPasswordHash(password));
        user.sex = sex;
        if(ipData) user.info = ipData;
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
const googleOuth = async function(googleData, sid, peerId, socket, sex, ipData) {
    const id = googleData.id;
    const loginHas = await db.has('USERS.' + id);
    
    if(loginHas) {
        const data = await db.get('USERS.' + id);
        const user = new User(id, setPasswordHash(id));
        online.remove(id);
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



module.exports = {
    online: online,
    registration: registration,
    autorize: autorize,
    googleOuth: googleOuth
}