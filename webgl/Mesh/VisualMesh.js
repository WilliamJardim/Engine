/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export class VisualMesh
{
    constructor( renderer, meshConfig )
    {
        this.renderer   = renderer;
        this.meshConfig = meshConfig;

        this.programUsado = null; // Vai ser um ponteiro, eu vou definir em cada tipo de Mesh

        // Os shaders da renderização dele
        this.vertexScript   = '';
        
        this.fragmentScript = ''; 

        // Atributos visuais
        this.tipo          = meshConfig.tipo || 'Nenhum';
        this.position      = meshConfig.position;
        this.scale         = meshConfig.scale;
        this.rotation      = meshConfig.rotation;
        this.invisivel     = meshConfig.invisivel; 
        this.transparencia = meshConfig.transparencia;

        // Luzes do objeto
        this.alwaysUpdateLights       = meshConfig.alwaysUpdateLights || true; //Se a todo momento vai atualizar luzes ou não
        this.brilhoObjeto             = meshConfig.brilho   || 16;
        this.ambientObjeto            = meshConfig.ambient  || 0.2; // Um acrescimento a luz ambiente
        this.diffuseObjeto            = meshConfig.diffuse  || 0.2;
        this.specularObjeto           = meshConfig.specular || 0.2;
        this.corLuzObjeto             = meshConfig.corLuzObjeto || [0, 0, 0];

        // Por padrão sempre vai usar cores
        this.useColors = true;
    }

    /**
    * Responsavel por retornar quais luzes o objeto está recebendo 
    * @returns { posicao, cor, intensidade }
    getLuzes()
    {
        return [
            //Sao 4 luzes, então, o Array precisa ser 4x4(4 Arrays de Array de 3 elementos: XYZ)
            [
                [0,0,0], // POSICAO 
                [255,255,255], // COR
                [0.1,0.1,0.1]  // INTENSIDADE
            ],
            [
                [100,0,0], // POSICAO 
                [255,255,255], // COR
                [0.1,0.1,0.1]  // INTENSIDADE
            ],
            [
                [100,0,0], // POSICAO 
                [255,255,255], // COR
                [0.1,0.1,0.1]  // INTENSIDADE
            ],
            [
                [100,0,0], // POSICAO 
                [255,255,255], // COR
                [0.1,0.1,0.1]  // INTENSIDADE
            ],
        ];
    }*/

    /**
    * Converte a minha estrutura de luz para luzes que o shader vai entender
    getLuzesConvertidas()
    {
        let luzes            = this.getLuzes();
        let arrayPosicoes    = [];
        let arrayCores       = [];
        let arrayIntensidade = [];

        // Para cada uma das 4 luzes
        for( let i = 0 ; i < 4 ; i++ ) 
        {
            const luzAtual = luzes[i];
            const posicaoAtual      = luzAtual[ 0 ];
            const corAtual          = luzAtual[ 1 ];
            const intensidadeAtual  = luzAtual[ 2 ];

            arrayPosicoes.push( posicaoAtual[0] );
            arrayPosicoes.push( posicaoAtual[1] );
            arrayPosicoes.push( posicaoAtual[2] );

            arrayCores.push( corAtual[0] );
            arrayCores.push( corAtual[1] );
            arrayCores.push( corAtual[2] );

            arrayIntensidade.push( intensidadeAtual[0] );
            arrayIntensidade.push( intensidadeAtual[1] );
            arrayIntensidade.push( intensidadeAtual[2] );
        }
    
        return {
            posicoes: new Float32Array(arrayPosicoes),
            cores: new Float32Array(arrayCores),
            intensidades: new Float32Array(arrayIntensidade)
        }
    }*/

    /**
    * Código base para aplicar iluminação, usado em todos os objetos
    */
    atualizarIluminacao(gl, informacoesPrograma )
    {
        /**
        * Obtem o ambiente atualizado como a soma dos valores do objeto com os globais da cena
        */
        this.ambient  = this.ambientObjeto  + this.renderer.ambient;
        this.diffuse  = this.diffuseObjeto  + this.renderer.diffuse;
        this.specular = this.specularObjeto + this.renderer.specular;
        this.brilho   = this.brilhoObjeto   + this.renderer.brilho;

        // Pega a cor da luz
        this.corLuz    = [0, 0, 0];
        this.corLuz[0] = this.corLuzObjeto[0] + this.renderer.corAmbient[0];
        this.corLuz[1] = this.corLuzObjeto[1] + this.renderer.corAmbient[1];
        this.corLuz[2] = this.corLuzObjeto[2] + this.renderer.corAmbient[2];

        /**
        * Aplica os valores 
        */
        const brilhoShader         = informacoesPrograma.atributosObjeto.brilho;
        const ambientShader        = informacoesPrograma.atributosObjeto.ambient;
        const diffuseShader        = informacoesPrograma.atributosObjeto.diffuse;
        const specularShader       = informacoesPrograma.atributosObjeto.specular;
        const corLuzShader         = informacoesPrograma.atributosObjeto.corLuz;

        // Atualiza as configurações gerais 
        gl.uniform1f(brilhoShader,   this.brilho);
        gl.uniform1f(ambientShader,  this.ambient);
        gl.uniform1f(diffuseShader,  this.diffuse);
        gl.uniform1f(specularShader, this.specular);
        gl.uniform3fv(corLuzShader,  new Float32Array(this.corLuz) );
    }
    
    /**
    * Define a iluminação do objeto como um todo 
    */
    setIntireIlumination( iluminationDefinition={} )
    {
        this.brilhoObjeto   = iluminationDefinition.brilhoObjeto;
        this.ambientObjeto  = iluminationDefinition.ambientObjeto;
        this.diffuseObjeto  = iluminationDefinition.diffuseObjeto;
        this.specularObjeto = iluminationDefinition.specularObjeto;

        // Pega a cor da luz
        this.corLuz    = [0, 0, 0];
        this.corLuz[0] = (iluminationDefinition.corLuzObjeto[0] || 0) + this.renderer.corAmbient[0];
        this.corLuz[1] = (iluminationDefinition.corLuzObjeto[1] || 0) + this.renderer.corAmbient[1];
        this.corLuz[2] = (iluminationDefinition.corLuzObjeto[2] || 0) + this.renderer.corAmbient[2];
    }

    /*
    atualizarIluminacao(gl, informacoesPrograma )
    {
        // Configurações gerais da luz no objeto
        const brilho         = informacoesPrograma.atributosObjeto.brilho;
        const ambient        = informacoesPrograma.atributosObjeto.ambient;
        const diffuse        = informacoesPrograma.atributosObjeto.diffuse;
        const specular       = informacoesPrograma.atributosObjeto.specular;

        // Posição e detalhes das luzes
        const posicaoLuz     = informacoesPrograma.atributosObjeto.posicaoLuz; // um ARRAY
        const corLuz         = informacoesPrograma.atributosObjeto.corLuz; // um ARRAY
        const intensidadeLuz = informacoesPrograma.atributosObjeto.intensidadeLuz; // um ARRAY

        // Atualiza as configurações gerais 
        gl.uniform1f(brilho,   this.brilho);
        gl.uniform1f(ambient,  this.ambient);
        gl.uniform1f(diffuse,  this.diffuse);
        gl.uniform1f(specular, this.specular);

        // Obtem as luzes que objeto está recebendo
        const luzesCena = this.getLuzesConvertidas();

        // Atualiza as luzes no shaders do objeto
        gl.uniform3fv(posicaoLuz,     luzesCena.posicoes );
        gl.uniform3fv(corLuz,         luzesCena.cores );
        gl.uniform3fv(intensidadeLuz, luzesCena.intensidades);
    }*/

    /**
    * Código base para aplicar iluminação, usado em todos os objetos
    */
    aplicarIluminacao( gl, informacoesPrograma )
    {
        // Se o objeto sempre for atualizar luzes
        if( this.alwaysUpdateLights == true )
        {
            this.atualizarIluminacao(gl, informacoesPrograma);
        }
    }

    getRotation()
    {
        return this.rotation;
    }

    /**
    * Soma uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    addRotationAround(rotation)
    {
        this.rotation.x += rotation.x;
        this.rotation.y += rotation.y;
        this.rotation.z += rotation.z;
    }

    addRotationAroundX(rotationX)
    {
        this.rotation.x += rotationX;
    }

    addRotationAroundY(rotationY)
    {
        this.rotation.y += rotationY;
    }

    addRotationAroundZ(rotationZ)
    {
        this.rotation.z += rotationZ;
    }

    /**
    * Define uma rotação ao redor de cada eixo: X, Y, Z, respectivamente.
    */
    setRotationAround(rotation)
    {
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }

    setRotationAroundX(rotationX)
    {
        this.rotation.x = rotationX;
    }

    setRotationAroundY(rotationY)
    {
        this.rotation.y = rotationY;
    }

    setRotationAroundZ(rotationZ)
    {
        this.rotation.z = rotationZ;
    }


    /**
    * Soma uma rotação EM DIREÇÂO de cada eixo: X, Y, Z, respectivamente.
    * OU seja, em direção do eixo X,
    * 
    * Respeitando a direção de movimento da posição, ou seja, 
    * Ao mover em +X, ele anda pra direita, então por esse método ao rotacionar em direção a X, ele vai inclinar pra direita tambem
    */
    addRotationTowards(rotation)
    {
        this.rotation.x += (rotation.z * -1);
        this.rotation.y += rotation.y;
        this.rotation.z += (rotation.x * -1);
    }

    addRotationTowardsX(rotationX)
    {
        this.rotation.z += (rotationX * -1);
    }

    addRotationTowardsY(rotationY)
    {
        this.rotation.y += rotationY;
    }

    addRotationTowardsZ(rotationZ)
    {
        this.rotation.x += (rotationZ * -1);
    }

    /**
    * Define uma rotação EM DIREÇÂO de cada eixo: X, Y, Z, respectivamente.
    * OU seja, em direção do eixo X,
    * 
    * Respeitando a direção de movimento da posição, ou seja, 
    * Ao mover em +X, ele anda pra direita, então por esse método ao rotacionar em direção a X, ele vai inclinar pra direita tambem
    */
    setRotationTowards(rotation)
    {
        this.rotation.x = (rotation.z * -1);
        this.rotation.y = rotation.y;
        this.rotation.z = (rotation.x * -1);
    }

    setRotationTowardsX(rotationX)
    {
        this.rotation.z = (rotationX * -1);
    }

    setRotationTowardsY(rotationY)
    {
        this.rotation.y = rotationY;
    }

    setRotationTowardsZ(rotationZ)
    {
        this.rotation.x = (rotationZ * -1);
    }


    getPosition()
    {
        return this.position;
    }

    addPosition(position)
    {
        this.position.x += position.x;
        this.position.y += position.y;
        this.position.z += position.z;
    }

    addPositionX(positionX)
    {
        this.position.x += positionX;
    }

    addPositionY(positionY)
    {
        this.position.y += positionY;
    }

    addPositionZ(positionZ)
    {
        this.position.z += positionZ;
    }


    setPosition(position)
    {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    setPositionX(positionX)
    {
        this.position.x = positionX;
    }

    setPositionY(positionY)
    {
        this.position.y = positionY;
    }

    setPositionZ(positionZ)
    {
        this.position.z = positionZ;
    }


    getScale()
    {
        return this.scale;
    }

    addScale(scale)
    {
        this.scale.x += scale.x;
        this.scale.y += scale.y;
        this.scale.z += scale.z;
    }

    addScaleX(scaleX)
    {
        this.scale.x += scaleX;
    }

    addScaleY(scaleY)
    {
        this.scale.y += scaleY;
    }

    addScaleZ(scaleZ)
    {
        this.scale.z += scaleZ;
    }


    setScale(scale)
    {
        this.scale.x = scale.x;
        this.scale.y = scale.y;
        this.scale.z = scale.z;
    }

    setScaleX(scaleX)
    {
        this.scale.x = scaleX;
    }

    setScaleY(scaleY)
    {
        this.scale.y = scaleY;
    }

    setScaleZ(scaleZ)
    {
        this.scale.z = scaleZ;
    }


    isTransparente()
    {
        return this.transparencia < 1;
    }

    isOpaco()
    {
        return this.transparencia >= 1;
    }

    getTransparencia()
    {
        return this.transparencia;
    }

    setTransparencia( nivelOpacidade )
    {
        this.transparencia = nivelOpacidade;
    }

    setInvisibilidade( novaInvisibilidade=false )
    {
        this.invisivel = novaInvisibilidade;
    }

    ocultar()
    {
        this.invisivel = true;
    }

    aparecer()
    {
        this.invisivel = false;
    }

    isInvisivel()
    {
        return this.invisivel == true;
    }

    isVisivel()
    {
        return this.invisivel == false;
    }

    /**
    * Obtem a instancia do renderizador
    */
    getRenderer()
    {
        return this.renderer;
    }

    /**
    * Obtem os atributos desse objeto 
    */
    getAtributos()
    {
        return this.meshConfig;
    }

    /**
    * Função que desenha o objeto 
    * Se implementa ela em cada objeto
    */
    desenhar()
    {
        
    }

    /**
    * Se implementa ela em cada objeto
    * Cria os buffers que vão ser usados na renderização
    */
    createBuffers()
    {
        
    }

    // Muda o valor do ponteiro "this.programUsado"
    setProgram( programUsar )
    {
        this.programUsado = programUsar;
    }

    getProgram()
    {
        return this.programUsado;
    }

    getVertex()
    {
        return this.vertexScript;
    }

    getFragment()
    {
        return this.fragmentScript;
    }
}