interface Formulario {
    perguntas: { idPergunta: string; pergunta: string; listRespostas: string[] | null }[];
    respostas: Array<string>;

    isIniciado: boolean;
    isCompletado: boolean;
    aguardandoResposta: boolean;
    excelPath: string;
    iniciar(): void;
    perguntar(client: any): void;
    validarResposta(id:string, msg: string): {valido: boolean, mensagem:string};
    responder(msg: string): {valido: boolean, mensagem:string};

    salvarExcel(data): void;
}


export default Formulario;