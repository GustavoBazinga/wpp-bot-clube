import {FormularioSolicitacao} from "./FormularioSolicitacao";
import Formulario from "./Formulario";

export default class Sessao{
    // Atributos
    public id: string;
    //Nome tem dois campos, nome e validado

    public formulario: Formulario = null;
    
    constructor(id: string) {
        this.id = id;
    }

    // Metodos
    public iniciarFormulario(): void{
        this.formulario = new FormularioSolicitacao(this.id);
        this.formulario.iniciar();
    }

    public isFormularioIniciado(): boolean{
        return this.formulario.isIniciado;
    }


    
}