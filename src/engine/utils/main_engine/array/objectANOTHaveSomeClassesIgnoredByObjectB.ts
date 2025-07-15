/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

import AbstractObjectBase  from "../../../core/AbstractObjectBase";
import ObjectBase          from "../../../core/ObjectBase";
import objectAHaveSomeClassesIgnoredByObjectB from "./objectAHaveSomeClassesIgnoredByObjectB";
import { Ponteiro }        from "../../../types/types-cpp-like";

export default function objectANOTHaveSomeClassesIgnoredByObjectB( objeto: Ponteiro<AbstractObjectBase>, 
                                                                   outroObjeto: Ponteiro<AbstractObjectBase> 
){
    return objectAHaveSomeClassesIgnoredByObjectB( objeto, outroObjeto ) == false;
}