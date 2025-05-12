/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import { useEffect, useState } from "react";
import './style.css';
import {globalContext} from '../../engine/main.ts';
import BuilderEditor from "./BuilderEditor/BuilderEditor.tsx";

export default function SceneBuilder()
{
    useEffect(()=>{
        
    }, [])

    return (
        <div className="scene-builder">
            <BuilderEditor/>
        </div>);
}