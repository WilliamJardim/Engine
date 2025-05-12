/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export default class GlobalContext {
    [key: string]: any; // Assinatura de índice para propriedades dinâmicas

    private dados: Record<string, any>;

    constructor(dados?: Record<string, any>) {
        this.dados = dados || {};

        // Cria um Proxy para interceptar o acesso às propriedades
        return new Proxy(this, {
            get: (target, property ) => {
                if (typeof property === "string") {
                    if (property in target) {
                        return (target as any)[property];
                        
                    } else if (property in target.data) {
                        return target.data[property];
                    }
                }
                return undefined;
            }
        });
    }

    set( atributo:string, valor:any ){
        this.dados[ atributo ] = valor;
    }

    get( atributo:string ): any{
        return this.dados[ atributo ];
    }

    avaliable( atributo:string ): any{
        return this.dados[ atributo ];
    }
}