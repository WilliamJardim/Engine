import * as THREE from 'three';
import Scene from '../core/Scene';

export default interface ObjImport{
    caminho: string, 
    haveMTL?: boolean|null|undefined,
    callback:Function
}