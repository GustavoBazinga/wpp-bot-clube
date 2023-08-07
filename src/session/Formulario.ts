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
            obj['first'] = question['first'];
            obj['question'] = question['question'];
            obj['options'] = question['options'];
            return obj;
        });
    }

    perguntar(client: any, first: boolean = false){
        
        const pergunta = this.localizarProximaPergunta();
        this.perguntaAtual = pergunta;
        const options = pergunta['options'];
        const question = pergunta['question'];
        const id = pergunta['id'];

        let msg = question;



        console.log(pergunta);
        console.log(options);
        console.log(question);
        console.log(id);

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

    responder(resposta: string){


        //TODO: Check if the answer is valid


        //TODO: Check which is the next question
        if (Formulario.perguntaLivre(this.perguntaAtual)){
            this.proximaPergunta = this.perguntaAtual['options'][0]['nextQuestionId'];
        }
        //TODO: Check which is the next question
        // else{}

        console.log("========");
        console.log(this.proximaPergunta);
        console.log("========");
        
    
        //TODO: Save the answer
        this.respostas.push(resposta);

        
    }

    private localizarProximaPergunta(){
        let response;
        if (this.respostas.length == 0){
            response = this.perguntas.find((question: any) => question['first'] == 1);
        }
        else{
            response = this.perguntas.find((question: any) => question['id'] == this.proximaPergunta);
        }
        return response;
    }

    static perguntaLivre(pergunta: any){
        //Check if one of the options is "Livre"
        return pergunta['options'].some((option: any) => option['option'] == "Livre");
    }

}


export default Formulario;