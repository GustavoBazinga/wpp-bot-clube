/* import {FormularioSolicitacao} from "./FormularioSolicitacao"; */
import Formulario from "./Formulario";

export default class Sessao{
    // Atributos
    public id: string;
    public started: boolean = false;
    //Nome tem dois campos, nome e validado
    public conversa: Array<string> = new Array<string>();



    public formulario: Formulario = null;
    
    constructor(id: string) {
        this.id = id;

    }

    // Metodos
    public iniciarFormulario(type:string, number:string, client: any): void{
        fetch(`http://localhost:3001/form/${type}`)
            .then(res => res.json())
            .then(json => {
                this.formulario = new Formulario(json, number);
                this.formulario.perguntar(client)
            })
    }
    
}