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

        // Por padrão sempre vai usar cores
        this.useColors = true;
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