import validator from 'validator';

class Formulario {

    private form: Object;
    private number: string;
    private perguntas: Array<any>;
    private respostas: Array<any> = [];
    public aguardandoResposta
    private perguntaAtual: number = 0;
    private proximaPergunta: number;
    public formComplete: boolean = false;

    constructor(form: Object, number: string) {
        this.form = form;
        this.number = number;
        this.respostas = [];
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

        let validacao = this.validarResposta(resposta);

        if (validacao.valid) {
            console.log(validacao.opt)
            if (Formulario.perguntaLivre(this.perguntaAtual)) {
                this.proximaPergunta = this.perguntaAtual['options'][0]['nextQuestionId'];
            }

            else{
                this.proximaPergunta = validacao.opt.option.nextQuestionId;
            }

            this.respostas.push({question: this.perguntaAtual['id'], optionId: validacao.opt['id'], answer: validacao.opt['answer']});
        }

      if (this.respostas.length == this.perguntas.length){
          //Create key on validacao to indicate that the form is complete
          this.formComplete = true;
      }

      console.log(this.respostas)

        return validacao;
        
    }

    validarResposta(resposta: string): {valid: boolean, msg: string, opt: any} {
        //This method will use validators to check if the answer is valid
        let msg = "";
        let valid = false;
        let opt = null;
        let optId: number = null;
        let answer = "";
        const type = this.perguntaAtual['type'];
        console.log("Validando resposta");
        console.log(type);
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
            case "date":
                console.log("Entrou no date");
                let regex = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2])\2))(?:[2-9]\d{3})|(?:29(\/)0?2\3(?:[2-9]\d{1}(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00))|(?:0?[1-9]|1\d|2[0-8])(\/)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:[2-9]\d{3}) (?:[01]\d|2[0-3]):[0-5]\d$/
                if (validator.matches(resposta, regex)){
                    console.log("Entrou no regex");
                    let data = resposta.split(" ")[0].split("/");
                    let hora = resposta.split(" ")[1].split(":");
                    let date = new Date(parseInt(data[2]), parseInt(data[1])-1, parseInt(data[0]), parseInt(hora[0]), parseInt(hora[1]));
                    if (validator.isAfter(date.toString(), new Date().toString())) {
                        console.log("Entrou no isAfter");
                        valid = true;
                    }
                    else {
                        console.log("Entrou no else");
                        msg = "A data deve ser posterior a data atual";
                    }
                }
                else {
                    console.log("Entrou no outro else");
                    msg = "A resposta deve ser uma data válida";
                }
                break;
            default:
                console.log("Entrou no default");
                break;
        }
        if (valid){
            msg = "Resposta válida";
            optId = Formulario.perguntaLivre(this.perguntaAtual) ? null : opt['id'];
            answer = opt == null ? resposta : opt['option'];
        }
        console.log({valid: valid, msg: msg, opt: {id: optId, answer: answer, option: opt}});


        return {valid: valid, msg: msg, opt: {id: optId, answer: answer, option: opt}};
    }

    private localizarProximaPergunta(){
        let response: any;
        if (this.proximaPergunta == null){
            response = this.perguntas[0]
        }
        else{
            response = this.perguntas.find((question: any) => question['id'] == this.proximaPergunta);
        }

        return response;
    }

    salvarRespostas() {
        fetch('http://localhost:3001/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({number: this.number, form:this.form['id'], answers: this.respostas})
        })
            .then(json => console.log(json))
            .catch(err => console.log(err));


    }

    static perguntaLivre(pergunta: any){
        //Check if one of the options is "Livre"
        return pergunta['options'].some((option: any) => option['option'] == "Livre");
    }

}
export default Formulario;