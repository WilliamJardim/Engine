/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import ObjectBase from "../../core/ObjectBase";
import includeString from "./includeString";

//objeto.objProps.classes.some((classe:string)=>{ return objetoAtualCena.objProps.ignoreCollisions.includes( classe ) == true }) == false

// para cada classe do objeto, verifica se o ignoreCollisions do outro objeto inclui a classe da iteração atual.
// ou melhor dizendo: Queremos saber se o ignoreCollisions do outro objeto(o objeto B) inclui alguma classe que o objeto A tenha
export default function objectAHaveSomeClassesIgnoredByObjectB( objeto: ObjectBase, outroObjeto: ObjectBase )
{
    const classesObjetoA         : Array<string> = objeto.objProps.classes;
    const ignoreColisionsObjetoB : Array<string> = outroObjeto.objProps.ignoreCollisions;

    let temAlguma = false;

    for( let i = 0 ; i < classesObjetoA.length ; i++ )
    {
        const classeAtualObjetoA : string = classesObjetoA[i];

        // Se ela está inclusa no ignoreCollisions do outro objeto
        if( includeString( ignoreColisionsObjetoB, classeAtualObjetoA ) )
        {
            temAlguma = true;
            break;
        }
    }

    return temAlguma;
}