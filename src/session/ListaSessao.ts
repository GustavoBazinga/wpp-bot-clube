import Sessao from "./Sessao";

export default class ListaSessao {
    // Atributos
    private _sessoes: Array<Sessao> = [];

    // Metodos
    public removeSessao(sessao: Sessao): void {
        let index = this._sessoes.indexOf(sessao);
        this._sessoes.splice(index, 1);
        sessao = null;
    }

    private _adicionaSessao(sessao: Sessao): void {
        this._sessoes.push(sessao);
    }

    public checarSessaoExiste(id: string): Sessao {
        for (let i = 0; i < this._sessoes.length; i++) {
            if (this._sessoes[i].id == id) {
                return this._sessoes[i];
            }
        }
        return null;
    }

    public static checarSessaoExisteECriar(listaSessoes: ListaSessao, id: string): Sessao {
        let sessao = listaSessoes.checarSessaoExiste(id);
        if (sessao == null) {
            sessao = new Sessao(id);
            listaSessoes._adicionaSessao(sessao);
        }
        return sessao;
    }
}