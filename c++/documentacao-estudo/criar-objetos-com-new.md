William Jardim
28/05/2025

## AO CRIAR OBJETOS EU DEVO USAR NEW OU NAO ?
Para criar objetos não é obrigatório usar "new"

Se vc fizer assim
Ex:

Objeto obj(param1, param2);

Vc já está criando uma instância de um objeto. Porém ela é mais direta e vai ser destruída quando o escopo atual terminar.

Mais se sua variável é um ponteiro, ex Objeto*, então, vc precisa usar o "new"

Ex:

Objeto obj = new Objeto(parâmetros);

O New serve pra quando você precisa que a variável exista além do escopo atual e possa sobreviver fora do escopo atual. Isso é muito útil em Game Engines