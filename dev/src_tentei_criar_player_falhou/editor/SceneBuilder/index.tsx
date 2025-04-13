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