import { FORMERR } from 'dns';
import { format } from 'path';
import validator from 'validator';
import { Client } from 'whatsapp-web.js';

class Form {

    private form: Object;
    private number: string;
    private questions: Array<Object> = new Array<Object>();
    public currentQuestion: Object = null;
    //Responses is a array of objects, each object has a question and a response
    private responses: Array<Object> = new Array<Object>();
    public waitingResponse: boolean = false;

    constructor(form: Object, number: string) {
        this.form = form;
        this.number = number;
        this.questions = form['questions'];
    }

    public interact(client: Client, msg: string): Object {
        let response = {};
        if (this.waitingResponse) {
            response = this.answer(client, msg);
        }
        
        if (typeof this.currentQuestion == 'undefined') {
            this.save();
            this.waitingResponse = false;
            client.sendMessage(this.number, "Formulário finalizado!");
            response['end'] = true
            return response;
        }
        this.ask(client);
        return response
    }

    private ask(client: Client, msg: string = "") {
        if (this.currentQuestion == null) {
            this.currentQuestion = this.questions[0];
        }
        if (this.currentQuestion != null) {
            this.waitingResponse = true;
            let text;
            const freeOptionIndex = this.currentQuestion['options'].findIndex((option: any) => option.option === 'Livre');
            if (freeOptionIndex == -1) {
                text = this.currentQuestion['question'] + "\n" + "Digite o número da opção desejada";
                for (let i = 0; i < this.currentQuestion['options'].length; i++) {
                    text += "\n" + (i+1) + " - " + this.currentQuestion['options'][i]['option'];
                }
            } else text = this.currentQuestion['question'];

            text += "\n\n" + "Digite # para voltar a pergunta anterior";
                
            client.sendMessage(this.number, text);
            
        }
    }

    private answer(client: Client, msg: string) {
        let response = null;
        if (msg == '#'){
            this.responses.pop();
            this.currentQuestion = this.questions.find((question: any) => question.id === this.responses[this.responses.length - 1]['next_question_id']);
            return response;
        }
        if (this.currentQuestion != null) {
            let validation = this.validate(msg);
            if (validation['valid']) {
                let question = this.currentQuestion
                delete question['options']
                response = {
                    question: question,
                    answer: validation['answer']
                }

                console.log(response)
                
                this.currentQuestion = this.questions.find((question: any) => question.id === validation['next_question_id']);
                
                this.responses.push(response);
            } else {
                client.sendMessage(this.number, validation['message']);
            }
        }
        return response;
    }

    private validate(msg: string): Object {
        let response: Object = {}
        let type = this.currentQuestion['type'];
        let valid = false;
        let message = "";
        let answer = null;
        switch (type) {
            case "text":
                //Check valid text
                if (validator.isAlpha(msg, 'pt-BR', { ignore: " " }) && validator.isLength(msg, { min: 3, max: 100 })) valid = true;
                else message = "A resposta deve ter entre 3 e 100 caracteres";
                break;
            case "telephone":
                //Check valid telephone
                if (validator.isMobilePhone(msg, 'pt-BR')) valid = true;
                else message = "O número de telefone não é válido";
                break;
            case "email":
                //Check valid email
                if (validator.isEmail(msg)) valid = true;
                else message = "O email não é válido";
                break;
            case "longtext":
                //Check valid long text
                if (validator.isLength(msg, { min: 10, max: 1000 })) valid = true;
                else message = "A resposta deve ter entre 10 e 1000 caracteres";
                break;
            case "time":
                //Check valid time
                if (validator.isTime(msg)) valid = true;
                else message = "O horário não é válido";
                break;
            case "date":
                //Check valid date
                //Reverse date
                if (Form.isDateValid(msg)) valid = true;
                else message = "Essa data é inválida"
                break;
            case "number":
                //Check valid number
                if (validator.isNumeric(msg)) valid = true;
                else message = "O número não é válido";
                break;
            case "after":
                //Check valid date
                if (validator.isAfter(msg)) valid = true;
                else message = "A data não pode ser anterior a hoje";
                break;
            case "before":
                //Check valid date
                if (validator.isBefore(msg)) valid = true;
                else message = "A data não pode ser posterior a hoje";
                break;
            case "select":
                //Check valid select
                let options = this.currentQuestion['options'];
                //Check if the option is inside the options length
                if (validator.isNumeric(msg) && parseInt(msg) < options.length){ 
                    valid = true;
                    answer = options[parseInt(msg) - 1];
                }
                else message = "A opção não é válida";
                break
            case "none":
                valid = true;
            default:
                message = "Tipo de resposta não suportado";
                break;
        }
        response['valid'] = valid;
        response['message'] = message;
        response['options'] = this.currentQuestion['options'];
        //Check if has option "Livre" on response
        
        answer ? response['answer'] = answer : response['answer'] = msg;
        const freeOptionIndex = response['options'].findIndex((option: any) => option.option === 'Livre');
        let nextQuestionId = freeOptionIndex !== -1 ? response['options'][freeOptionIndex]['next_question_id'] : null;

        //Check is next question is null and if is, check next_question_id on answer
        if (nextQuestionId == null) {
            nextQuestionId = response['answer']['next_question_id'];
        }

        response['next_question_id'] = nextQuestionId;

        return response;
    }

    private save(){
        console.log( JSON.stringify(
            {
                form_id: this.form['id'],
                responses: this.responses
            },
            null,
            2
        ));
        //If response is null, call API to save response
        fetch(`http://192.168.100.20/api/form/response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                form_id: this.form['id'],
                responses: this.responses
            })
        })
            // .then(response => response.json())
            .then(data => {
                console.log(data);
            })
    }

    private static isDateValid(date: string): boolean {
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!regex.test(date)) {
            return false;
        }

        const [day, month, year] = date.split('/');
        const numericDay = parseInt(day, 10);
        const numericMonth = parseInt(month, 10);
        const numericYear = parseInt(year, 10);console.log(numericDay, numericMonth, numericYear);

        if ((numericMonth === 4 || numericMonth === 6 || numericMonth === 9 || numericMonth === 11) && numericDay === 31) {
            return false;
        }

        if (numericMonth === 2) {
            if (numericDay > 29) {
                return false;
            } else if (numericDay === 29 && !((numericYear % 4 === 0 && numericYear % 100 !== 0) || (numericYear % 400 === 0))) {
                return false;
            }
        }

        return true;
    }

}
export default Form;