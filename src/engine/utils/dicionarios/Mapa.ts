/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Isso precisaria ser convertido pra C++
* Eu só estou criando essa classe em TypeScript para usar uma estrutura mais compativel com C++ 
*/
export type FoundStatus = 'FOUNDED' | 'NOT_FOUNDED';

export default class Mapa<
                          TIPO_CHAVE extends string, 
                          TIPO_VALOR
                         >
{
    [key: string]: TIPO_VALOR | any;  // <-- permitir o acesso por colchetes SIMPLISMENTE PERMITE FAZER: dicionario["CHAVE"] pra acessar os dados PRO PROXY FUNCIONAR

    public internal_map:Record<TIPO_CHAVE, TIPO_VALOR>;

    constructor( objetoInicializar?: Record<TIPO_CHAVE, TIPO_VALOR> )
    {
        this.internal_map = {} as Record<TIPO_CHAVE, TIPO_VALOR>;

        if(objetoInicializar) 
        {
            for (const key in objetoInicializar) {
                this.internal_map[key as TIPO_CHAVE] = objetoInicializar[key];
            }
        }

        // Retorna um Proxy para permitir acesso direto com colchetes
        // SIMPLISMENTE PERMITE FAZER: dicionario["CHAVE"] pra acessar os dados
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    // Permite acesso direto tipo mapa["chave"]
                    if (prop in target) return (target as any)[prop];
                    return target.internal_map[prop as unknown as TIPO_CHAVE];
                }
                return (target as any)[prop];
            },
            set: (target, prop, value) => {
                if (typeof prop === "string" && !(prop in target)) {
                    target.internal_map[prop as unknown as TIPO_CHAVE] = value;
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            },
            has: (target, prop) => {
                if (typeof prop === "string") {
                    return prop in target.internal_map || prop in target;
                }
                return prop in target;
            }
        });
    }

    /**
    * METODO QUE PRESENTA O STATUS NÂO ENCONTRADO
    */
    NotFounded(): FoundStatus
    {
        return "NOT_FOUNDED";
    }

    /**
    * Procura se um elemento existe neste mapa 
    */
    search( chave:string ): FoundStatus
    {
        let status: FoundStatus = "NOT_FOUNDED";

        if( this.internal_map[chave as unknown as TIPO_CHAVE] != null )
        {
            status = "FOUNDED";
        }

        return status;
    }

    add(chave: TIPO_CHAVE, valor: TIPO_VALOR): void {
        this.internal_map[chave] = valor;
    }

    get(chave: TIPO_CHAVE): TIPO_VALOR | null {
        return this.internal_map[chave] ?? null;
    }
}