Se voce quiser ter um método que tem logica implementada dentro de uma classe abstrata ou base,
voce ainda precisa deixar o método como virtual
ai no objeto que herda essa classe voce pode usar o override na frente do método, pra poder indicar que ele vai sobrescrever o da base
Ou simplismente criar, mesmo sem o override

EU POSSO CHAMAR QUALQUER METODO DA CLASSE QUE EU HERDEI, POIS ELE HERDOU OS METODOS
MESMO QUE O METODO NAO SEJA VIRTUAL
OU SEJA, METODOS NÂO-VIRTUAIS QUE JA FORAM IMPLEMENTADOS NA CLASSE BASE PODEM SER CHAMADOS NORMALMENTE

E MESMO ESSES METODOS NÂO SENDO VIRTUAIS EU POSSO CHAMAR, E ELES PODEM CHAMAR OUTROS METODOS DO OBJETO NO CONTEXTO DELE, E INCLUSIVE ALTERAR ATRIBUTOS DO OBJETO

porém, se voce estiver lidendo com verifiações de ponteiros, de falhar, nesse caso. 