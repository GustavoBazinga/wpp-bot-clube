import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import ListaSessao  from './session/ListaSessao';
import Sessao from './session/Sessao';

const listaSessoes = new ListaSessao();

console.log('Iniciando bot...');

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
});

client.on('message', async msg => {
    const remetente = msg.from;
    const sessao = ListaSessao.checarSessaoExisteECriar(listaSessoes, remetente);

    if (msg.body == "!start") {
      sessao.started = true;
      client.sendMessage(remetente, "Olá, seja bem vindo ao bot de solicitações de serviços do Clube dos Funcionários da CSN.\nPara começar, digite !solicitacao");    
    }
    if (sessao.started){

      if (msg.body == "!solicitacao") {
        if (sessao.formulario == null) {
          sessao.iniciarFormulario("solicitacao", remetente, client);
        }
      }

      if (sessao.formulario != null){
        if(sessao.formulario.aguardandoResposta){
          sessao.formulario.responder(msg.body);
          sessao.formulario.perguntar(client);
        }
        
      }
    }
  });
  
client.initialize();