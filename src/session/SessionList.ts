import Session from "./Session";

export default class SessionList {
    // Atributos
    private _sessoes: Array<Session> = [];

    // Metodos
    public delSession(sessao: Session): void {
        let index = this._sessoes.indexOf(sessao);
        this._sessoes.splice(index, 1);
        sessao = null;
    }

    private _addSession(sessao: Session): void {
        this._sessoes.push(sessao);
    }

    public checkIfExists(id: string): Session {
        for (let i = 0; i < this._sessoes.length; i++) {
            if (this._sessoes[i].id == id) {
                return this._sessoes[i];
            }
        }
        return null;
    }

    public static checkIfExistsAndCreate(listaSessoes: SessionList, id: string): Session {
        let sessao = listaSessoes.checkIfExists(id);
        if (sessao == null) {
            sessao = new Session(id);
            listaSessoes._addSession(sessao);
            console.log(`Nova sessão criada: ${id}`);
        }
        return sessao;
    }
}