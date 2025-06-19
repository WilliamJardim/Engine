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
import { OBJShaders } from '../Shaders/OBJ.js';
import { 
    CriarMatrix4x4,
    DefinirTranslacao,
    DefinirEscala,
    RotacionarX,
    RotacionarY,
    RotacionarZ
} from '../math.js';

export class OBJMesh extends VisualMesh 
{
    constructor(renderer, propriedadesMesh) 
    {
        super(renderer, propriedadesMesh);

        this.tipo           = 'OBJ';
        this.mtlText        = propriedadesMesh.mtlText;
        this.objText        = propriedadesMesh.objText;
        this.vertices       = [];
        this.uvs            = [];
        this.normals        = [];
        this.positions      = [];
        this.indices        = [];
        this.colors         = [];
        this.bufferPosicao  = null;
        this.bufferCor      = null;
        this.bufferIndices  = null;

        this.setProgram(renderer.getOBJProgram());

        this.materials      = {};
        this.objects        = {};
        this.activeObject   = null;
        this.activeMaterial = null;

        this._parseMTL(this.mtlText);
        this._parseOBJ(this.objText);
        this.criar();
    }

    _parseMTL(mtlText) 
    {
        const lines = mtlText.split('\n');
        let current = null;

        for (let i = 0; i < lines.length; i++) 
        {
            let line = lines[i].trim();
            if (line.length === 0)
            { 
                continue;
            }

            if (line.indexOf('newmtl') === 0) {
                const tokens = line.split(/\s+/);
                current = tokens[1];
                this.materials[current] = { name: current, Kd: [1, 1, 1], map_Kd: null };

            } else if (current !== null) {
                if (line.indexOf('Kd') === 0) {
                    const tokens = line.split(/\s+/);
                    this.materials[current].Kd = [
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        parseFloat(tokens[3])
                    ];
                } else if (line.indexOf('map_Kd') === 0) {
                    const tokens       = line.split(/\s+/);
                    const textureFile  = tokens[1];
                    const gl           = this.getRenderer().gl;
                    const textureWebGL = carregarTextura(gl, textureFile);
                    this.materials[current].map_Kd = textureWebGL;
                }
            }
        }
    }

    _parseOBJ(objText) 
    {
        const lines = objText.split('\n');

        for (let i = 0; i < lines.length; i++)
        {
            let line = lines[i].trim();
            if (line.length === 0 || line.charAt(0) === '#')
            {
                continue;
            }

            const parts = line.split(/\s+/);
            const prefix = parts[0];

            if (prefix === 'v') {
                const v = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
                this.vertices.push(v);

            } else if (prefix === 'vt') {
                const vt = [parseFloat(parts[1]), parseFloat(parts[2])];
                this.uvs.push(vt);

            } else if (prefix === 'vn') {
                const vn = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
                this.normals.push(vn);

            } else if (prefix === 'f') {
                if (this.activeObject === null) this.activeObject = 'default';
                if (!this.objects[this.activeObject]) this.objects[this.activeObject] = [];

                const face = [];
                for (let j = 1; j < parts.length; j++)
                {
                    const comp = parts[j].split('/');
                    face.push({
                        vi: parseInt(comp[0], 10) - 1,
                        ti: comp[1] ? parseInt(comp[1], 10) - 1 : -1,
                        ni: comp[2] ? parseInt(comp[2], 10) - 1 : -1
                    });
                }

                this.objects[this.activeObject].push({
                    face: face,
                    material: this.activeMaterial
                });

            } else if (prefix === 'usemtl') {
                this.activeMaterial = parts[1];

            } else if (prefix === 'o') {
                this.activeObject = parts[1];
            }
        }

        const objectKeys = Object.keys(this.objects);
        const keyToIndex = {};
        let currentIndex = 0;

        for (let i = 0; i < objectKeys.length; i++) 
        {
            const name = objectKeys[i];
            const faces = this.objects[name];

            for (let j = 0; j < faces.length; j++) 
            {
                const face = faces[j];
                const faceIndices = [];

                for (let k = 0; k < face.face.length; k++) 
                {
                    const v = face.face[k];
                    const key = v.vi + '/' + v.ti + '/' + v.ni;

                    if (keyToIndex[key] === undefined) {
                        keyToIndex[key] = currentIndex++;

                        this.colors.push(...(this.materials[face.material]?.Kd || [1, 1, 1]), 1);

                        const pos = this.vertices[v.vi] || [0, 0, 0];
                        this.positions.push(pos[0], pos[1], pos[2]);

                        if (v.ti >= 0) {
                            const uv = this.uvs[v.ti];
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(uv[0], uv[1]);
                        } else {
                            this.uvArray = this.uvArray || [];
                            this.uvArray.push(0, 0);
                        }
                    }

                    faceIndices.push(keyToIndex[key]);
                }

                for (let k = 1; k < faceIndices.length - 1; k++) 
                {
                    this.indices.push(faceIndices[0], faceIndices[k], faceIndices[k + 1]);
                }
            }
        }
    }

    getPositions() 
    {
        return this.positions;
    }

    getColors() 
    {
        return this.colors;
    }

    getIndices() 
    {
        return this.indices;
    }

    getUVs() 
    {
        return this.uvArray || [];
    }

    getInformacoesPrograma() 
    {
        const renderer           = this.getRenderer();
        const gl                 = renderer.gl;
        const programUsado       = this.getProgram();

        return {
            atributosObjeto: {
                posicao : gl.getAttribLocation(programUsado, OBJShaders.vertexExtraInfo.variavelPosicaoCubo),
                cor     : gl.getAttribLocation(programUsado, OBJShaders.vertexExtraInfo.variavelCorCubo),
                uv      : gl.getAttribLocation(programUsado, OBJShaders.vertexExtraInfo.variavelUV)
            },
            atributosVisualizacaoObjeto: {
                matrixVisualizacao: gl.getUniformLocation(programUsado, OBJShaders.vertexExtraInfo.variavelMatrixVisualizacao),
                modeloObjetoVisual: gl.getUniformLocation(programUsado, OBJShaders.vertexExtraInfo.variavelModeloObjeto)
            }
        };
    }

    createBuffers() 
    {
        const gl = this.getRenderer().gl;

        if ( this.bufferPosicao == null ) 
        {
            this.bufferPosicao = createBuffer(gl, this.getPositions(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if ( this.bufferCor == null )
        {
            this.bufferCor     = createBuffer(gl, this.getColors(),    gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }
        
        if ( this.bufferIndices == null )
        { 
            this.bufferIndices = createBuffer(gl, this.getIndices(),   gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        }

        if( this.bufferUV == null )
        {
            this.bufferUV = createBuffer(gl, this.getUVs(), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        }
    }

    desenhar() 
    {
        const renderer            = this.getRenderer();
        const gl                  = renderer.gl;
        const programUsado        = this.getProgram();
        const isTransparente      = this.isTransparente();
        const indices             = this.getIndices();
        const informacoesPrograma = this.getInformacoesPrograma();

        // Atributos visuais 
        const meshConfig = this.meshConfig;
        const position   = meshConfig.position;
        const rotation   = meshConfig.rotation;
        const scale      = meshConfig.scale;

        let modeloObjetoVisual = CriarMatrix4x4();

        modeloObjetoVisual     = DefinirTranslacao(modeloObjetoVisual, [position.x, position.y, position.z]);

        modeloObjetoVisual     = RotacionarX(modeloObjetoVisual, rotation.x);
        modeloObjetoVisual     = RotacionarY(modeloObjetoVisual, rotation.y);
        modeloObjetoVisual     = RotacionarZ(modeloObjetoVisual, rotation.z);

        modeloObjetoVisual     = DefinirEscala(modeloObjetoVisual, [scale.x, scale.y, scale.z]);

        this.createBuffers();

        if ( isTransparente )
        {
            gl.depthMask(false);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosicao);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.posicao, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.posicao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCor);
        gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.cor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.cor);

        if (this.bufferUV && informacoesPrograma.atributosObjeto.uv !== -1) 
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
            gl.vertexAttribPointer(informacoesPrograma.atributosObjeto.uv, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(informacoesPrograma.atributosObjeto.uv);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);

        gl.useProgram(programUsado);
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.matrixVisualizacao, false, renderer.getMatrixVisualizacao());
        gl.uniformMatrix4fv(informacoesPrograma.atributosVisualizacaoObjeto.modeloObjetoVisual, false, modeloObjetoVisual);

        const material = this.materials[this.activeMaterial];
        const usarTextura = material && material.map_Kd;
        
        gl.uniform1i(gl.getUniformLocation(programUsado, "uUsarTextura"), usarTextura ? 1 : 0);

        if ( usarTextura ) 
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, material.map_Kd);
            gl.uniform1i(gl.getUniformLocation(programUsado, "uSampler"), 0);
        }

        if ( material && material.map_Kd ) 
        {
            const textura = material.map_Kd;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textura);
            
            const localDoSampler = gl.getUniformLocation(programUsado, "uSampler"); 
            gl.uniform1i(localDoSampler, 0); // TEXTURE0
        }

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        if ( isTransparente )
        {
            gl.depthMask(true);
        }
    }

    criar() 
    {
        this.desenhar();
    }
}
