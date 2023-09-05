import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import SessionList  from './session/SessionList';
import validator from 'validator';

const listaSessoes = new SessionList();

console.log('Iniciando bot...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
  },
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('loading_screen', (percent, message) => {
    console.log('Carregando...', percent, message);
});


client.on('ready', () => {
  console.log('Tudo pronto, bot iniciado!');
  //Start new thread

});

client.on('message', async msg => {
    const from = msg.from;
    const session = SessionList.checkIfExistsAndCreate(listaSessoes, from);

    if (msg.body === '!start') {
      await session.startChat(client);
    }

    if (session.form == null) {
      if (validator.isInt(msg.body)) {
        session.initForm(client, msg.body);
      }
    }
    else{
      let response = session.form.interact(client, msg.body);

      if (response['end']){
        session.form = null;
        listaSessoes.delSession(session)
      }
      console.log("ASDASD")
    }
  });

client.on('disconnected', (reason) => {
  console.log('Client was logged out', reason);
});

client.initialize();

import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

app.post('/sendMessage', (req, res) => {
  const { number, message } = req.body;
  const numberCompleted = number;
  client.sendMessage(numberCompleted, message);
  res.send('Mensagem enviada com sucesso!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

