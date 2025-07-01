/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import { VisualMesh } from "./VisualMesh.js";
import { createBuffer, carregarTextura } from '../funcoesBase.js';
import { baseShaders } from '../Shaders/Base.js';
import { 
   isDentroRaio
} from '../math.js';

// renderizador.criarObjeto( { tipo: "Light", position: [...renderizador.posicaoCamera] } )
// renderizador.getObjetos()[14].configLuz.ambient = 500

export class Light extends VisualMesh 
{
    constructor(renderer, propriedadesMesh) 
    {
        super(renderer, propriedadesMesh);

        this.tipo = "Light";

        this.objetosProximos = []; // Um array de ponteiros

        // Configurações da luz (serão somadas aos objetos)
        this.configLuz = {
            alcance         : 5,

            brilho          : 0,
            ambient         : 0,
            diffuse         : 0,
            specular        : 0,
            cor             : [0,0,0],
            intensidade     : 0
        };

    }

    setObjetosProximos(objetosProximos)
    {
        this.objetosProximos = objetosProximos;
    }

    // Força este objeto a ser considerado opaco
    isOpaco()
    {
        return true;
    }
    isTransparente()
    {
        return false;
    }

    /**
    * Ilumina os objetos proximos deste ponto de luz
    * 
    * TODO: DIZER QUE PARA OBJETOS OBJ NÂO VAI USAR isDentroRaio, mais sim proximidade CUBICA MESMO
    * TODO: PRECISA TER DOIS CAMINHOS: UM PRA OBJ QUE USA proximidade CUBICA  E OUTRO PRA NÂO OBJ que usa raio
    * TODO: Calcular a força da luz de acordo com a distanca dos objetos/partes deles
    * TODO: Talvez criar uma função queryPartesRaio para padronizar e usar raios tanto para OBJ quanto para não OBJS
    */
    iluminar()
    {
        const essaLuz = this;
        const configLuz = this.configLuz;
        const renderer = this.getRenderer();
        const objetosCena = renderer.getObjetos();

        this.objetosProximos = [];

        for( let i = 0 ; i < objetosCena.length ; i++ )
        {
            const objetoAtual = objetosCena[i];
            const tipoObjeto  = objetoAtual.tipo;
            const isProximo   = true || isDentroRaio( objetoAtual.position, essaLuz.position, configLuz.alcance );

            let novoBrilho      = 0;
            let novoAmbient     = 0;
            let novoDiffuse     = 0;
            let novoSpecular    = 0;
            let novoCor         = [0,0,0];
            let novoIntensidade = 0;

            if( isProximo == true ) {
                // Os objetos que estiverem proximos dessa luz vão receber a iluminação dela
                novoBrilho      = configLuz.brilho;
                novoAmbient     = configLuz.ambient;
                novoDiffuse     = configLuz.diffuse;
                novoSpecular    = configLuz.specular;
                novoCor         = configLuz.cor;
                novoIntensidade = configLuz.intensidade;

                // Atualiza a lista de objetos proximos caso eu queira usar depois
                this.objetosProximos.push( objetoAtual );

            }else{
                // Os que estão distantes, vão receber a iluminação padrão da cena
                novoBrilho      = 0;
                novoAmbient     = 0;
                novoDiffuse     = 0;
                novoSpecular    = 0;
                novoCor         = [0,0,0];
                novoIntensidade = 0;
            }

            if( tipoObjeto == "OBJ" && objetoAtual.childrenIndividualLights == true )
            {
                /*
                const nomePartes = objetoAtual.nomesObjetos;

                // Para cada parte dele
                for( let j = 0 ; j < nomePartes.length ; j++ )
                {
                    const nomeParte       = nomePartes[j];
                    const iluminacaoParte = objetoAtual.iluminationInfo[ nomeParte ];
                    
                    ....
                }
                */
                const minimo = [
                    essaLuz.position.x - configLuz.alcance,
                    essaLuz.position.y - configLuz.alcance,
                    essaLuz.position.z - configLuz.alcance
                ];  

                const maximo = [
                    essaLuz.position.x + configLuz.alcance,
                    essaLuz.position.y + configLuz.alcance,
                    essaLuz.position.z + configLuz.alcance
                ];

                const partesDentroDaZonaLuz = objetoAtual.queryPartesCoordenadas( minimo, maximo, 1 );

                for( let j = 0 ; j < partesDentroDaZonaLuz.length ; j++ )
                {
                    const parte           = partesDentroDaZonaLuz[j];
                    const referenciaParte = parte[0];
                    const nomeParte       = parte[1]; // Só o nome da parte
                    const iluminacaoParte = objetoAtual.iluminationInfo[ nomeParte ];

                    if( novoBrilho == 0      ) { iluminacaoParte.brilhoObjeto          = novoBrilho       } else { iluminacaoParte.brilhoObjeto          += novoBrilho      };
                    if( novoAmbient == 0     ) { iluminacaoParte.ambientObjeto         = novoAmbient      } else { iluminacaoParte.ambientObjeto         += novoAmbient     };
                    if( novoDiffuse == 0     ) { iluminacaoParte.diffuseObjeto         = novoDiffuse      } else { iluminacaoParte.diffuseObjeto         += novoDiffuse     };
                    if( novoSpecular == 0    ) { iluminacaoParte.specularObjeto        = novoSpecular     } else { iluminacaoParte.specularObjeto        += novoSpecular    };
                    if( novoIntensidade == 0 ) { iluminacaoParte.intensidadeLuzObjeto  = novoIntensidade  } else { iluminacaoParte.intensidadeLuzObjeto  += novoIntensidade };

                    if( novoCor[0] == 0 ) { iluminacaoParte.corLuzObjeto[0] = novoCor[0] } else { iluminacaoParte.corLuzObjeto[0] += novoCor[0] };
                    if( novoCor[1] == 1 ) { iluminacaoParte.corLuzObjeto[1] = novoCor[1] } else { iluminacaoParte.corLuzObjeto[1] += novoCor[1] };
                    if( novoCor[2] == 2 ) { iluminacaoParte.corLuzObjeto[2] = novoCor[2] } else { iluminacaoParte.corLuzObjeto[2] += novoCor[2] };
                }

                

            /**
            * Para qualquer outro tipo
            * Se for zero, define como zero
            * Se tiver valor, soma
            * Tenta criar iluminação realista que pode se acumular de outras fontes
            */
            }else{

                if( novoBrilho == 0      ) { objetoAtual.brilhoObjeto         = novoBrilho      } else { objetoAtual.brilhoObjeto         += novoBrilho      };
                if( novoAmbient == 0     ) { objetoAtual.ambientObjeto        = novoAmbient     } else { objetoAtual.ambientObjeto        += novoAmbient     };
                if( novoDiffuse == 0     ) { objetoAtual.diffuseObjeto        = novoDiffuse     } else { objetoAtual.diffuseObjeto        += novoDiffuse     };
                if( novoSpecular == 0    ) { objetoAtual.specularObjeto       = novoSpecular    } else { objetoAtual.specularObjeto       += novoSpecular    };
                if( novoIntensidade == 0 ) { objetoAtual.intensidadeLuzObjeto = novoIntensidade } else { objetoAtual.intensidadeLuzObjeto += novoIntensidade };

                if( novoCor[0] == 0 ) { objetoAtual.corLuzObjeto[0] = novoCor[0] } else { objetoAtual.corLuzObjeto[0] += novoCor[0] };
                if( novoCor[1] == 1 ) { objetoAtual.corLuzObjeto[1] = novoCor[1] } else { objetoAtual.corLuzObjeto[1] += novoCor[1] };
                if( novoCor[2] == 2 ) { objetoAtual.corLuzObjeto[2] = novoCor[2] } else { objetoAtual.corLuzObjeto[2] += novoCor[2] };

                if( isProximo )
                {
                    debugger
                }

            }
        }
    }

    desenhar()
    {
        this.iluminar();
    }
}