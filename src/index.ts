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
      sessao.iniciarFormulario();
      client.sendMessage(remetente, "Olá, seja bem vindo ao bot de solicitações de serviços do Clube dos Funcionários da CSN.");    
    }
      

    if (sessao.formulario != null){
      if(sessao.formulario.aguardandoResposta) {
        const validacao = sessao.formulario.responder(msg.body);
        if (validacao.valido) {
          sessao.formulario.aguardandoResposta = false;
          if (!sessao.formulario.isCompletado) {
            sessao.formulario.perguntar(client);
          }
        }
        else client.sendMessage(remetente, validacao.mensagem);
      }
      else sessao.formulario.perguntar(client);
      if (sessao.formulario.isCompletado){
        sessao.formulario.salvarExcel(sessao.formulario.respostas);
        client.sendMessage(remetente, "Obrigado por responder o formulário, em breve entraremos em contato.");

        sessao.formulario = null;
        listaSessoes.removeSessao(sessao);
      }
    }
});

client.initialize();