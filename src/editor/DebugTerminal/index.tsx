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

    /**
    * Exemplos de comandos que podem ser chamados pelo terminal da Engine
    * 
    * @example
    * help
    * 
    * @example
    * globalContext.get('CaixaRef').setPosition({x: -15,y: 0,z: 0}); 
    */
    function executarComando() {
        let entradaUsuarioAtual = entradaUsuario;

        //Remove espaços desnecessários usando o comando trim do JavaScript
        entradaUsuarioAtual = entradaUsuarioAtual.trim();

        //Converte alguns termos para globalContext
        let termosContextoGlobal = entradaUsuario.split('Engine').join('globalContext'); //Por exemplo, toda vez que houver Engine, ele entende que é o contexto global da Engine e da Cena
        entradaUsuarioAtual = termosContextoGlobal;

        try {

          if( entradaUsuarioAtual == 'help' ){
            setSaidas((prev) => `
                Página de ajuda
            `);
            return;
          }

          // Cria uma função com acesso explícito ao globalContext
          const fn = new Function(
              "globalContext",
              `return ${entradaUsuarioAtual};`
          );

          const resultado = fn(globalContext); // Executa com o contexto fornecido
          setSaidas((prev) => `${prev}\n> ${entradaUsuarioAtual}\n${resultado || "Comando executado"}`);

        } catch (error:any) {
          setSaidas((prev) => `${prev}\n> ${entradaUsuarioAtual}\nErro: ${error.message}`);
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