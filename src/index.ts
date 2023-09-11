import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import SessionList  from './session/SessionList';
import validator from 'validator';

const listaSessoes = new SessionList();


const client = new Client({
  authStrategy: new LocalAuth(),
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

client.on('change_state', (state) => {
  console.log('Estado mudou!');
  console.log(state);
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
    }
  });

client.on('disconnected', (reason) => {
  console.log('Client was logged out', reason);
});

client.initialize();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/sendMessage', (req, res) => {
  try{
    const { number, message } = req.body;
    client.sendMessage(number, message);
    res.send('Mensagem enviada!').status(200);
  }
  catch (err){
    console.log("====================================");
    console.log(err);
    console.log("====================================");
  }

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

