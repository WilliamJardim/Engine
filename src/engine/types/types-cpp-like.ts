/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/

/**
* Inspirado na semântica da linguagem C++ (ISO/IEC 14882)
* Lista com os principais tipos nativos do C++ para facilitar entendimento e compatibilidade de C++ 
*/

// Tipos inteiros
export type int = number;
export type short = number;
export type long = number;

// Tipos de ponto flutuante
export type float = number;
export type double = number;

// Tipo booleano
export type bool = boolean;

// Tipo caractere
export type char = string; // deve conter apenas 1 caractere

// Ponteiro genérico
export type Ptr<T> = T | null;
export type Ponteiro<T> = T | null;

/**
* Em C++ 11 é possivel declarar um tipo para Ptr assim:
* 
*   template <typename T>
*   using Ptr = T*; 
*
* No C++ mais antigo assim:
* 
*   template <typename T>
*   typedef T* Ptr;
*/