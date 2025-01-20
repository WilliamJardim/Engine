import * as THREE from 'three';
import Scene from '../core/Scene';
import ObjectProps from './ObjectProps';

export default interface ObjImport{
    caminho: string, 
    haveMTL?: boolean|null|undefined,
    callback:Function,
    objectProps?: ObjectProps
}