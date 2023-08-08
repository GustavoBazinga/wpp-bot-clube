import validator from 'validator';

class Formulario {
    private form: Object;
    private number: string;
    private perguntas: Array<any>;
    private respostas: Array<string>;
    public aguardandoResposta
    private perguntaAtual: number = 0;
    private proximaPergunta: number;

    constructor(form: Object, number: string) {
        this.form = form;
        this.respostas = [];
        this.number = number;
        const questions = form['questions'];
        //Create a object with the questions and the options
        this.perguntas = questions.map((question: any) => {
            const obj: any = {};
            obj['id'] = question['id'];
            obj['question'] = question['question'];
            obj['options'] = question['options'];
            obj['type'] = question['type'];
            return obj;
        });
    }

    perguntar(client){
        
        const pergunta = this.localizarProximaPergunta();
        this.perguntaAtual = pergunta;
        const options = pergunta['options'];

        let msg = pergunta['question'];


        if (!Formulario.perguntaLivre(pergunta)){
            msg += "\nSelecione uma das opções abaixo:";
            msg += "\n";
            options.forEach((option: any, index) => {
                msg += `\n${index+1} - ${option['option']}`;
            });
        }

        //KEEP THIS
        this.aguardandoResposta = true;
        client.sendMessage(this.number, msg);
    }

    responder(resposta: string): {valid: boolean, msg: string, opt: number}{


        //TODO: Check if the answer is valid
        let validacao = this.validarResposta(resposta);

        if (validacao.valid) {

            //TODO: Check which is the next question
            if (Formulario.perguntaLivre(this.perguntaAtual)) {
                this.proximaPergunta = this.perguntaAtual['options'][0]['nextQuestionId'];
            }
            //TODO: Check which is the next question
            else{
                //Find the next question searching by the option
                this.proximaPergunta = this.perguntaAtual['options'].find((option: any) => option == validacao.opt)['nextQuestionId'];
            }

            //TODO: Save the answer
            this.respostas.push(resposta);
        }

        return validacao;

        
    }

    validarResposta(resposta: string): {valid: boolean, msg: string, opt: number} {
        //This method will use validators to check if the answer is valid
        let msg = "";
        let valid = false;
        let opt = null;
        const type = this.perguntaAtual['type'];

        switch (type) {
            case "text":
                if (validator.isLength(resposta, {min: 3, max: 40}) && validator.isAlpha(resposta)){
                    valid = true;
                }
                else msg = "A resposta deve conter apenas letras e ter entre 3 e 40 caracteres";

                break;
            case "telefone":
                if (validator.isMobilePhone(resposta, 'pt-BR')){
                    valid = true;
                }
                else msg = "O número de telefone deve ser válido";
                break;
            case "email":
                if (validator.isEmail(resposta)){
                    valid = true;
                }
                else msg = "O email deve ser válido";
                break;
            case "select":
                let selected = parseInt(resposta);
                if (validator.isInt(resposta) && selected > 0 && selected <= this.perguntaAtual['options'].length){
                    valid = true;
                    opt = this.perguntaAtual['options'][selected-1];
                }
                else msg = "A resposta deve ser um número válido. Digite o número correspondente a opção desejada.";
                break;
            case "longtext":
                if (validator.isLength(resposta, {min: 10, max: 255})){
                    valid = true;
                }
                else msg = "A resposta deve conter entre 10 e 255 caracteres";
                break;
            case "date" || "data":
                if (validator.isDate(resposta)){
                    if (validator.isAfter(resposta, new Date().toString())) {
                        valid = true;
                    }
                    else msg = "A data deve ser posterior a data atual";
                }
                else msg = "A resposta deve ser uma data válida";
        }

        if (valid && opt == null) opt = resposta;

        return {valid: valid, msg: msg, opt: opt};
    }

    private localizarProximaPergunta(){
        let response: any;
        if (this.respostas.length == 0){
            response = this.perguntas[0]
        }
        else{
            response = this.perguntas.find((question: any) => question['id'] == this.proximaPergunta);
        }

        console.log(response);
        return response;
    }

    static perguntaLivre(pergunta: any){
        //Check if one of the options is "Livre"
        return pergunta['options'].some((option: any) => option['option'] == "Livre");
    }

}


export default Formulario;