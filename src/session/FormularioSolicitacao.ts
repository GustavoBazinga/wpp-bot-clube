import Formulario from "./Formulario";
import validator from "validator";

class FormularioSolicitacao implements Formulario {
    perguntas = [
        {
            idPergunta: "nome",
            pergunta: "Qual o seu nome?",
            listRespostas: null
        },
        {
            idPergunta: "solicitacao",
            pergunta: "Qual o sua solicitação?",
            listRespostas: [
                "Solicitação de manutenção elétrica",
                "Solicitação de manutenção hidráulica",
                "Solicitação de manutenção de TI",
                "Solicitação de Limpeza"
            ]
        },
        {
            idPergunta: "local",
            pergunta: "Qual o local da solicitação?",
            listRespostas: [
                "Sede",
                "PET",
                "Quadra",
                "Padel",
                "Sauna",
                "Piscina",
                "Campo de futebol",
                "Quadra de Tenis",
                "Ginásio",                
            ]
        },
        {
            idPergunta: 'data',
            pergunta: "Qual o data/hora da solicitação? Responsa no formato dd/mm/aaaa hh:mm, por exemplo 01/01/2021 12:00.",
            listRespostas: null
        },
        {
            idPergunta: 'motivo',
            pergunta: "Descreva a solicitação.",
            listRespostas: null
        },
        {
            idPergunta: 'motivo',
            pergunta: "Qual o motivo da solicitação?",
            listRespostas: null
        },
        {
            idPergunta: 'telefone',
            pergunta: "Qual o seu telefone?",
            listRespostas: null
        }
    ];
    respostas = [];
    isIniciado = false;
    isCompletado = false;
    aguardandoResposta = false;
    excelPath = "C:/Users/gustavo.alves/Desktop/programs/WhatsAppBotClubeNew/data.xlsx";

    iniciar(): void {
        this.isIniciado = true;
    }

    completar(): void {
        this.isCompletado = true;
    }


    private id: string;

    constructor(id: string) {
        this.id = id;
    }


    perguntar(client:any): void {
        if (this.isCompletado) return;
        if (!this.isIniciado) return;
        
        
        ("Perguntando...");
        const perguntaAtual = this.perguntas[this.respostas.length];
        (perguntaAtual);

        let mensagem = perguntaAtual.pergunta;

        //Checar se é uma pergunta com opções
        if (perguntaAtual.listRespostas != null) {
            mensagem += "\nResponda com o número da opção.";
            perguntaAtual.listRespostas.forEach((resposta, index) => {
                mensagem += `\n${index + 1} - ${resposta}`;
            });
        }
        client.sendMessage(this.id, mensagem);
        this.aguardandoResposta = true;
    }

    validarResposta(id: string, msg: string): {valido: boolean, dado:string, mensagem:string} {
        let valido = false;
        let mensagem = "";
        let dado = "";
        if (id == "nome") {
            if (validator.isLength(msg, {min: 3, max: 40}) && validator.isAlpha(msg, 'pt-BR')) {
                valido = true
                dado = msg;
            }
            else mensagem = "Nome inválido, por favor digite um nome com mais de 3 caracteres e menos de 40.";
        }
        else if (id == "solicitacao" || id == 'local') {
            if (validator.isInt(msg)) {
                const perguntaAtual = this.perguntas[this.respostas.length];
                if (parseInt(msg) > 0 && parseInt(msg) <= perguntaAtual.listRespostas.length) {
                    valido = true;
                    dado = perguntaAtual.listRespostas[parseInt(msg) - 1];
                }
                else mensagem = "Opção inválida, por favor digite um número de opção válido.";
            }
            else mensagem = "Opção inválida, por favor digite um número de opção válido.";
        }
        else if (id == "data") {
            //Validar data e posterior a data atual
            let data:string;
            let hora:string;
            if (msg.includes(" ")) {
                data = msg.split(" ")[0].replace("/", "-").replace("/", "-");
                data = data.split("-")[2] + "-" + data.split("-")[1] + "-" + data.split("-")[0];
                hora = msg.split(" ")[1] + ":00";

                msg = data + "T" + hora;

                let date = new Date(msg);

                //Remover 3 horas do horário de Brasília
                date.setHours(date.getHours() - 3);

                let now = new Date();
                now.setHours(now.getHours() - 3);


                if (date > now) {
                    valido = true;
                    dado = data.toLocaleString();
                }
                else mensagem = "Data inválida, por favor digite uma data posterior a data atual.";
                
            }
            else {
                mensagem = "Data inválida, por favor digite uma data no formato dd/mm/aaaa hh:mm, por exemplo 01/01/2021 12:00.";
            }
        }
        else if (id == "motivo") {
            if (validator.isLength(msg, {min: 10, max: 255})) {
                valido = true;
                dado = msg;
            }
            else mensagem = "Motivo inválido, por favor digite um motivo com mais de 10 caracteres e menos de 255.";
        }
        else if (id == "telefone") {
            if (validator.isMobilePhone(msg, 'pt-BR')) {
                valido = true;
                dado = msg;
            }
            else mensagem = "Telefone inválido, por favor digite um telefone válido.";
        }
        return {valido: valido, mensagem: mensagem, dado: dado};
    }

    responder(msg: string): {valido: boolean, mensagem:string} {
        ("Resposta recebida: " + msg);
        if (this.isCompletado || !this.isIniciado) return;

        const perguntaAtual = this.perguntas[this.respostas.length];

        const responseValidacao = this.validarResposta(perguntaAtual.idPergunta, msg);

        if (responseValidacao.valido) {
            this.respostas.push(responseValidacao.dado);
            this.aguardandoResposta = false;
            if (this.respostas.length == this.perguntas.length) {
                this.completar();
            }
        }
        return responseValidacao;

    }
        

    salvarExcel(data: Array<string>): {valido: boolean, mensagem:string} {
        let valido = false;
        let mensagem = "";
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        
        //Read excel file and update with respostas at new row
        workbook.xlsx.readFile('C:/Users/gustavo.alves/Desktop/programs/WhatsAppTypeScript/WhatsAppBotClube/src/util/custom/data.xlsx')
            .then(function() {
                const worksheet = workbook.getWorksheet('Plan1');
                const row = worksheet.getRow(worksheet.rowCount + 1);
                (data);
                row.getCell(1).value = data[0];
                row.getCell(2).value = data[1];
                row.getCell(3).value = data[2];
                row.getCell(4).value = data[3];
                row.getCell(5).value = data[4];
                row.getCell(6).value = data[5];
                workbook.xlsx.writeFile('C:/Users/gustavo.alves/Desktop/programs/WhatsAppTypeScript/WhatsAppBotClube/src/util/custom/data.xlsx');
                valido = true;
                mensagem = "Formulário finalizado, obrigado!";
            })
            .catch(function(error) {
                (error);
                mensagem = "Erro ao salvar o formulário, por favor tente novamente mais tarde.";
            });
        return {valido: valido, mensagem: mensagem};
    }
}

export  {
    FormularioSolicitacao
}

