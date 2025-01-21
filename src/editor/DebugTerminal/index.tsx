import { useEffect, useState } from "react";
import './style.css';
import {globalContext} from '../../engine/main.ts';

export default function DebugTerminal()
{
    const [entradaUsuario, setEntradaUsuario] = useState('');
    const [saidas, setSaidas] = useState('');

    useEffect(()=>{
        setSaidas('Terminal de execução de códigos dentro do contexto!');
    }, [])

    function aoEscrever(event:any): void{
        setEntradaUsuario( event.target.value ); // Atualiza o estado com o valor do input
    }

    function executarComando() {
        try {

          // Cria uma função com acesso explícito ao globalContext
          const fn = new Function(
              "globalContext",
              `return ${entradaUsuario};`
          );

          const resultado = fn(globalContext); // Executa com o contexto fornecido
          setSaidas((prev) => `${prev}\n> ${entradaUsuario}\n${resultado || "Comando executado"}`);

        } catch (error:any) {
          setSaidas((prev) => `${prev}\n> ${entradaUsuario}\nErro: ${error.message}`);
        }
        setEntradaUsuario("");
    }

    return (
        <div className="debug-terminal">

            <textarea readOnly value={ saidas } className="saida">
            </textarea>

            <input value={ entradaUsuario } 
                   onChange={aoEscrever} 
                   onKeyDown={(e) => e.key === "Enter" && executarComando()}
                   className="entrada"/>

        </div>);
}