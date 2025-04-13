import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import ObjectBase from '../core/ObjectBase';
import ObjImport from '../interfaces/ObjImport';
import ObjectProps from '../interfaces/ObjectProps';

export default function importObjectFrom( parametros: ObjImport ){
    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    const objectProps:ObjectProps = parametros.objectProps || {};
    
    if( parametros.haveMTL == undefined || parametros.haveMTL == null || parametros.haveMTL == false )
    {
        loader.load(
            parametros.caminho, 

            (object) => {
                parametros.callback( new ObjectBase(object, objectProps) );
            },
            (xhr) => {
                console.log(`Carregando: ${(xhr.loaded / xhr.total) * 100}% concluído`);
            },
            (error) => {
                console.error('Erro ao carregar o arquivo OBJ', error);
            }
        );

    //Se tem um material MTL
    }else if( parametros.haveMTL == true ){

        const caminhoMTL:string = String(parametros.caminho).replace('.obj', '.mtl');

        mtlLoader.load(caminhoMTL, (materials: MTLLoader.MaterialCreator) => {
            materials.preload();

            loader.setMaterials(materials);
            
            loader.load(parametros.caminho, (object) => {
                parametros.callback( new ObjectBase(object, objectProps) );
            });
        });

    }
}
