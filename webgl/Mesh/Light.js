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

// renderizador.criarObjeto( { tipo: "Light", position: {x: renderizador.posicaoCamera[0], y: renderizador.posicaoCamera[1], z: renderizador.posicaoCamera[2] }, ambient: 10, raio: 1 , cor: [0,255,0]} )

export class Light
{
    constructor(renderer, propriedadesMesh) 
    {
        this.renderer   = renderer;
        this.meshConfig = propriedadesMesh;

        this.tipo = "Light";
        this.position    = propriedadesMesh.position;
        this.raio        = propriedadesMesh.raio        || 1; // Raio de alcance da luz
        this.brilho      = propriedadesMesh.brilho      || 16;
        this.ambient     = propriedadesMesh.ambient     || 0.2; 
        this.diffuse     = propriedadesMesh.diffuse     || 0.2;
        this.specular    = propriedadesMesh.specular    || 0.2;
        this.cor         = propriedadesMesh.cor         || [0, 0, 0];
        this.intensidade = propriedadesMesh.intensidade || 0;
    }
}