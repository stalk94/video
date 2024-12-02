require('dotenv').config();
const fs = require("fs");
const uuid = require('uuid');
const http = require('http');
const https = require("https");
const express = require('express');
const favicon = require('serve-favicon');
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const { scheme } = require('./server/function');
const { online, autorize, registration } = require('./server/online');
const botManager = require('./server/bot-manager');
const APP = require('./server/app');


const options = {
    cert: fs.readFileSync('./config/keys/certificate.crt'),
    key: fs.readFileSync('./config/keys/private.key')
}

const app = express();
app.use(cors({origin:"http://localhost:3001"}));
app.use(express.urlencoded({limit: '1mb'}));
app.use(express.json({limit: '1mb'}));
const server = https.createServer(options, app);
//const server = http.createServer(app);
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
    res.send(await botManager.getAllBots());
});
app.post("/getAllUsers", async (req, res)=> {
    res.send(await botManager.getAllUsers());
});
// name, login
app.post("/loadVideo", (req, res)=> {
    botManager.loadVideo(req.body.login, req.body.name);
    res.send('sucess');
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
        if(msg && msg.peerId && msg.peerIdLike) {
            const likeCount = APP.like(msg.peerId, msg.peerIdLike);
            if(likeCount) socket.emit('ovner.refresh', {likes: likeCount});
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
    // изменить свойства юзера
    socket.on('admin.userRead', (msg)=> {
        if(msg && msg.peerId && msg.data) {
            botManager.editUser(msg.peerId, msg.data);
        }
    });
});


app.use('/', express.static(path.join(__dirname, '/src')));
app.use('/', express.static(path.join(__dirname, '/dist')));
app.use(favicon(path.join(__dirname, 'src/img/fav', 'favicon.ico')));
server.listen(3000, ()=> {
    botManager.init();
    console.log("start 3000");
});