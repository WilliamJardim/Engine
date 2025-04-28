import * as THREE from 'three';
import createCubeMesh from './createCubeMesh';
import ObjectProps from '../../interfaces/ObjectProps';
import createPlaneMesh from './createPlaneMesh';

export default function parseMeshType( objectType:string, objProps: ObjectProps ): THREE.Mesh|THREE.Object3D|THREE.Group|THREE.Group<any>|null{
    let objetoTemplate:THREE.Mesh|THREE.Object3D|THREE.Group|THREE.Group<any>|null = null;

    /**
    * Define o formato(se é cubo, plano, esfera, ou modelo personalizado .obj por exemplo) 
    */
    switch( objectType )
    {
        case 'Cube':
        case 'cube':
            objetoTemplate = createCubeMesh( objProps );
            break;

        case 'Plane':
        case 'plane':
            objetoTemplate = createPlaneMesh( objProps );
            break;
    }

    return objetoTemplate;
}