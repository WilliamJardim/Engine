import { useEffect, useState } from "react";
import './style.css';
import {globalContext} from '../../engine/main.ts';

export default function DebugTerminal()
{
    const [entradaUsuario, setEntradaUsuario] = useState('');
    const [saidas,         setSaidas]         = useState<string>('');
    const [historico,      setHistorico]      = useState<Array<string>>([]);
    const [indiceComando,  setIndiceComando]  = useState(0);

    useEffect(()=>{
        setSaidas('Terminal de execução de códigos dentro do contexto!');
    }, [])

    function adicionarHistorico( comando:string ): void{
        const historicoAdicionado:string[] = [...historico, comando];
        setHistorico( historicoAdicionado );
    }

    function getHistorico(): string[]{
        return historico;
    }

    function aoEscrever(event:any): void{
        setIndiceComando(0);
        setEntradaUsuario( event.target.value ); // Atualiza o estado com o valor do input
    }

    /**
    * Coloca o comando mais recente novamente como entrada do usuário 
    */
    function voltarComandoMaisRecente( sentido:string ): void{
        if( historico.length > 0 )
        {
            if( sentido == 'ArrowUp' )
            {
                const novoIndiceComando = indiceComando + 1;
                setIndiceComando(novoIndiceComando);

                if( historico.length-novoIndiceComando > 0 )
                {
                    setEntradaUsuario( getHistorico()[historico.length-novoIndiceComando] );
                }
            }

            if( sentido == 'ArrowDown' )
            {
                const novoIndiceComando = indiceComando - 1;
                setIndiceComando(novoIndiceComando);

                if( novoIndiceComando < historico.length )
                {
                    setEntradaUsuario( getHistorico()[novoIndiceComando] );
                }
            }
        }
    }

    /**
    * Controla os eventos de AO PRECIONAR tecla do terminal
    * @param event 
    */
    function onKeyDown(event:any): void{

        globalContext.get('sceneCameraControls').lock(); // Bloqueia o jogo pra não atrapalhar o terminal

        if( event.key === "Enter")
        {
            executarComando()
        }

        if( event.key === "ArrowUp" || event.key === "ArrowDown" )
        {
            voltarComandoMaisRecente( event.key );
        }

    }

    /**
    * Exemplos de comandos que podem ser chamados pelo terminal da Engine
    * 
    * @example
    * help
    * 
    * @example
    * globalContext.get('CaixaRef').setPosition({x: -15,y: 0,z: 0}); 
    * 
    * @example
    * globalContext.get('CaixaRef').getMesh().position.x = globalContext.get('CuboRef').getMesh().position.x
    * globalContext.get('CaixaRef').getMesh().position.y = globalContext.get('CuboRef').getMesh().position.y + 5
    * 
    * @example
    * globalContext.get('CuboRef').getMesh().position.y = globalContext.get('CaixaRef').getMesh().position.y + 10
    * 
    * @example
    * globalContext.get('CuboRef').getMesh().position.y = globalContext.get('ChaoRef').getMesh().position.y + 25
    * 
    * @example
    * globalContext.get('CuboRef').getMesh().position.x += 0.5
    * globalContext.get('CuboRef').getMesh().position.y += 0.5
    * globalContext.get('CuboRef').getMesh().position.y += 2.5
    * 
    * @example
    * globalContext.get('ChaoRef').getPosition().y = -555
    * 
    * @example
    * Engine.get('CaixaRef').destroy()
    */
    function executarComando() {
        let entradaUsuarioAtual = entradaUsuario;

        // Remove espaços desnecessários usando o comando trim do JavaScript
        entradaUsuarioAtual = entradaUsuarioAtual.trim();

        // Converte alguns termos para globalContext
        let termosContextoGlobal = entradaUsuario.split('Engine').join('globalContext'); //Por exemplo, toda vez que houver Engine, ele entende que é o contexto global da Engine e da Cena
        termosContextoGlobal = entradaUsuario.split('E').join('globalContext'); 
        entradaUsuarioAtual = termosContextoGlobal;

        // Salva o comando executado
        adicionarHistorico( entradaUsuarioAtual );

        try {

          if( entradaUsuarioAtual == 'clear' ){
            setSaidas('');
            setEntradaUsuario("");
            return;
          }

          if( entradaUsuarioAtual == 'date' ){
            setSaidas( `${saidas}\n${new Date().toString()}`);
            setEntradaUsuario("");
            return;
          }


          
          if( entradaUsuarioAtual == 'help' ){
            setSaidas( (prev:string) => `
${saidas}
-=-=- Página de ajuda -=-=-
            `);
            setEntradaUsuario("");
            return;
          }



          if( entradaUsuarioAtual == 'history' ){
            setSaidas( `
${saidas}
-=-=- Histórico de comandos -=-=-:

${ historico.map(function( comandoJaExecutado:string, indiceComandoExecutado:number ){
    return `(${indiceComandoExecutado < 10 ? '0' + indiceComandoExecutado : indiceComandoExecutado}) - ${comandoJaExecutado}\n`;
}) }
            `);
            setEntradaUsuario("");
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
                   onKeyDown={onKeyDown}
                   className="entrada"/>

        </div>);
}