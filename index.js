require('dotenv').config();
const fs = require('fs');
const uuid = require('uuid');
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const multer  = require('multer');
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const { db } = require('./server/db');
const actions = require('./server/action');
const { scheme } = require('./server/function');
const { online, autorize, registration, googleOuth } = require('./server/online');
const botManager = require('./server/bot-manager');
const APP = require('./server/app');


globalThis.APP = APP;
const app = express();
app.use(cors({origin:"http://localhost:3001"}));
app.use(express.urlencoded({limit: '100mb'}));
app.use(express.json({limit: '1mb'}));
const upload = multer({ 
    dest: 'uploads/',
    limits : { fileSize : 50 * 1024 * 1024 }
});
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
});
process.on('uncaughtException', (err)=> {
    fs.appendFileSync("dead.log", JSON.stringify({
        massage: err.message,
        stack: err.stack
    })+"\n", {encoding:"utf-8"});
});


//.........................................................[#express]
app.get("/", (req, res)=> {
    res.sendFile(__dirname+'/dist/index.html');
});
app.post("/init", (req, res)=> {
    console.log(req.body)
});
app.post("/reg", (req, res)=> {
    if(scheme.data.login.test(req.body.login) && scheme.data.password.test(req.body.password)) {
        if(req.body.sex === 'm' || req.body.sex === 'fem') {
            registration(req.body.login, req.body.password, req.body.sex, req.body.ipData).then((data)=> {
                res.send(data);
            });
        }
    }
    else res.send({
        error: 'Проверьте поля'
    });
});
app.post("/exit", (req, res)=> {
    if(req.body.peerId) APP.exit(req.body.peerId);
});
app.post("/getAllBot", async (req, res)=> {
    const getBotsOnline =()=> {
        const result = [];

        Object.values(online.online).forEach((elem)=> {
            if(elem._bot) result.push(elem.login);
        });

        return result;
    }
    const allBots = await botManager.getAllBots();
    const botsOmline = getBotsOnline();
    Object.keys(allBots).forEach((botLogin)=> {
        allBots[botLogin].isOnline = false;
    });
    botsOmline.forEach((botLogin)=> {
        if(allBots[botLogin]) allBots[botLogin].isOnline = true;
    });

    res.send(allBots);
});
app.post("/getAllUsers", async (req, res)=> {
    res.send(await botManager.getAllUsers());
});
app.post("/getAllEvents", async (req, res)=> {
    res.send(await db.get('ACTIONS.GLOBAL'));
});
app.post('/upload', upload.single('file'), (req, res)=> {
    const botName = req.body.fileName;

    //console.log(req.file)
    fs.readFile(req.file.path, (err, data)=> {
        const fileName = req.file.originalname;

        if(!err) {
            botManager.loadVideo(botName, `src/upload/${botName}/${fileName}`, data, (data)=> {
                res.send(data)
            });
        }
    });
});


//.........................................................[#user 🔌]
io.on('connection', (socket)=> {
    socket.on('session', (msg)=> {
        if(msg?.token && msg?.peerId) {
            online.findSession(msg.token, msg.peerId, socket).then((data)=> {
                // сессия восстановлена
                if(data) {
                    delete data.password;

                    socket.emit('autorize.sucess', {
                        user: data,
                        token: data.token
                    });
                    socket.userInfo = {
                        login: data.login,
                        peerId: data.peerId
                    }
                }
                else {
                    socket.emit('autorize.filed', {});
                }
            });
        }
    });
    socket.on('auth', (msg)=> {
        if(scheme.data.login.test(msg.login) && scheme.data.password.test(msg.password)) {
            autorize(msg.login, msg.password, uuid.v4(), msg.peerId, socket).then((data)=> {
                if(!data.error) {
                    delete data.password;

                    socket.emit('autorize.sucess', {
                        user: data,
                        token: data.token
                    });
                    socket.userInfo = {
                        login: data.login,
                        peerId: data.peerId
                    }
                }
            });
        }
    });
    socket.on('authGoogle', (msg)=> {
        if(msg) {
            googleOuth(msg.googleData, uuid.v4(), msg.peerId, socket, msg.sex, msg.ipData).then((userData)=> {
                delete userData.password;
                
                socket.emit('autorize.sucess', {
                    user: userData,
                    token: userData.token
                });
                socket.userInfo = {
                    login: userData.login,
                    peerId: userData.peerId
                }
            });
        }
    });
    socket.on('start', (msg)=> {
        if(msg && msg.peerId) APP.start(msg.peerId);
    });
    socket.on('next', (msg)=> {
        if(msg && msg.peerId) APP.next(msg.peerId);
    });
    socket.on('finish', (msg)=> {
        if(msg && msg.peerId) APP.finish(msg.peerId);
    });
    socket.on('like', (msg)=> {
        if(msg && msg.peerId && msg.peerIdLike && msg.type) {
            const likeCount = APP.like(msg.peerId, msg.peerIdLike, msg.type);
            if(likeCount) socket.emit('ovner.refresh', {likes: likeCount});
        }
    });
    socket.on('gift', (msg)=> {
        if(msg && msg.peerId && msg.peerIdOvner) {
            APP.gift(msg.peerId, msg.peerIdOvner, msg.data);
        }
    });
    socket.on('activate', (msg)=> {
        if(msg && msg.peerId && msg.type) {
            APP.activate(msg.peerId, msg.type);
        }
    });
    socket.on('send.massage', (msg)=> {
        if(msg && msg.peerId && msg.text) {
            APP.sendMassage(msg.peerId, msg.text);
        }
    });
    socket.on('chek', (msg)=> {
        if(msg?.peerId) {
            const user = online.online[msg.peerId];

            if(user) {
                actions.chek(user);
                user.refresh();
            }
        }
    });
    // продажа подарка
    socket.on('gift.sell', (msg)=> {
        if(msg?.peerId) {
            const user = online.online[msg.peerId];

        }
    });
    // обоащение в SUPPORT
    socket.on('send.support', (msg)=> {
        if(msg && msg.peerId && msg.text) {
            
        }
    });

    // -- admin --
    // создать нового бота
    socket.on('admin.botCreate', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            botManager.create(msg.peerId, msg.data);
        }
    });
    // изменить свойства бота
    socket.on('admin.botRead', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            botManager.edit(msg.peerId, msg.data);
        }
    });
    // удалить бота
    socket.on('admin.botDelete', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            botManager.delete(msg.peerId, msg.data);
        }
    });
    // изменить свойства юзера
    socket.on('admin.userRead', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            botManager.editUser(msg.peerId, msg.data);
        }
    });
    // добавить событие
    socket.on('admin.eventAdd', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            const user = online.online[msg.peerId];
            actions.create(user, msg.data);
        }
    });

    socket.on("disconnect", ()=> {
        //console.log('DISCONECT SOCKET');
        if(socket?.userInfo?.peerId) {
            APP.exit(socket.userInfo.peerId);
        }
    });
});


app.use('/', express.static(path.join(__dirname, '/src')));
app.use('/', express.static(path.join(__dirname, '/dist')));
app.use(favicon(path.join(__dirname, 'src/img/fav', 'favicon.ico')));
server.listen(3000, ()=> {
    APP._init();
    botManager.init();
    console.log("start 3000");
});