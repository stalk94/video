const { db } = require('./db');
const User = require('./user');
const { getPasswordHash, setPasswordHash } = require('./function');


const online = {
    online: {},

    set(peerId, user) {
        this.online[peerId] = user;
        db.set('SESSIONS.' + user.token, {
            login: user.login,
            timeshtamp: Date.now()
        });
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
    async deleteAllSession(login) {
        const all = await db.get('SESSIONS');
        
        Object.keys(all).forEach((sid)=> {
            if(all[sid].login === login) {
                db.delete('SESSIONS.' + sid);
            }
        });

        return true;
    },
    remove(login) {
        Object.keys(this.online).forEach((key)=> {
            if(this.online[key].name === login) {
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


const registration = async function(login, password, sex) {
    if(await db.has("USERS." + login)) return { error: "Логин занят" };
    else {
        const user = new User(login, setPasswordHash(password));
        user.sex = sex;
        user._create();
        await db.set('USERS.' + login, user.get());

        return user.get();
    };
}
const autorize = async function(login, password, sid, peerId, socket) {
    const loginHas = await db.has('USERS.' + login);
    
    if(loginHas){
        const data = await db.get('USERS.' + login);

        if(getPasswordHash(data.password) === password){
            const user = new User(login, data.password);
            
            online.remove(login);
            await online.deleteAllSession(login);
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


module.exports = {
    online: online,
    registration: registration,
    autorize: autorize
}