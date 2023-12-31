const http = require('http');
const Koa = require('koa');
const WS = require('ws');
const { createServer } = require('https');
const { readFileSync } = require('fs');
const { WebSocketServer } = require('ws');

const app = new Koa();

const port = process.env.PORT|7070;
const server = http.createServer(app.callback());

// const server = createServer({
//   cert: readFileSync('/path/to/cert.pem'),
//   key: readFileSync('/path/to/key.pem')
// });

// const server = createServer({rejectUnauthorized: false, requestCert: true});

const wsServer = new WS.Server({
  server
});

// const wsServer = new WebSocketServer({ server });

function getCurrentDateTime() {
  const currentdate = new Date();
  const datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  return datetime;
}

chat = [{ user: 'ahmet', time: '07/11/2023 21:10:04', text: 'Я твой труба шатал' }, { user: 'Танюша', time: '05/10/2023 01:45:12', text: 'Ой, что происходит? Съещь еще этих мягких французких булок да выпей чаю' }];
users = [];

wsServer.on('connection', (ws) => {
  let currentUser;

  ws.on('message', (message) => {

    const data = JSON.parse(message);

    if ('text' in data) {
      data.time = getCurrentDateTime();

      chat.push(data);

      Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({ users: users, chat: chat })));
    } else {
      if (users.includes(data.user)) {
        ws.send(JSON.stringify({ isUser: true }));
      } else {
        ws.send(JSON.stringify({ isUser: false }));
        users.push(data.user);

        currentUser = data.user;

        Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({ users: users, chat: chat })));
      }
    }
  });

  ws.on('close', () => {
    if (currentUser !== undefined) {
      users.splice(users.indexOf(currentUser), 1);

      Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({ users: users, chat: chat })));
    }
  });
});

server.listen(port);
console.log(port);