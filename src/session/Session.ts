/* import {FormularioSolicitacao} from "./FormularioSolicitacao"; */
import { Client } from "whatsapp-web.js";
import Form from "./Form";

export default class Session {
    // Atributos
    public id: string;
    public started: boolean = false;
    //Nome tem dois campos, nome e validado
    public chat: Array<string> = new Array<string>();

    public form: Form = null;
    
    constructor(id: string) {
        this.id = id;
    }

    public startChat(client: Client): void {
        let opcoes = ""
        fetch(`http://192.168.100.20/api/form/inicio`)
            .then(res => res.json())
            .then(json => {
                let index = 1;
                for(let i = 0; i < json.length; i++){
                    opcoes += `${index} - ${json[i]["title"]}\n`;
                    index++;
                }
                //Remove last \n
                opcoes = opcoes.slice(0, -1);
                client.sendMessage(this.id, `Olá, eu sou o bot do CFCSN. Para começar, digite a opção desejada:\n${opcoes}`);
            });    
    }

    public async initForm(client: Client, name:string = "inicio"): Promise<void> {
        //Fetch form from api call
        fetch(`http://192.168.100.20/api/form/byIndex/${name}`)
            .then(res => res.json())
            .then(json => {
                if (json["error"] != null) {
                    client.sendMessage(this.id, "Opção inválida!");
                } else {
                    this.form = new Form(json, this.id);
                    this.form.interact(client, "");
                }
            }
        );
    }
}