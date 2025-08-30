**Nota escrita 06/08/2025 17:49 PM**, por William Alves Jardim, adicionada [neste commit](https://github.com/WilliamJardim/Engine/commit/5eacd51d883d16d602e5db84ca7278b9d2ad838d), explicando a estrutura de classes da minha Engine de renderização(que está atualmente na subpasta `src/engine/renderer/`), que eu planejei e construí especificamente para esse projeto, ao longo do desenvolvimento dele.

Criei essa nota para descrever em detalhes a estrutura de classes de minha Engine de renderização, para fins de documentação, aprendizado e posterior consulta por mim caso um dia eu queria migrar meu código pra C++. 

Essa é a estrutura que eu planejei para meu código TypeScript ser **100% portável para C++**, fazendo uso de conceitos presentes na linguagem C++ dentro do TypeScript, como **polimorfismo, herança, ponteiros, structs e metodos virtuais.**
Eu planejei isso e fui construindo essa estrutura gradualmente, ao longo do desenvolvimento desse projeto.

A estrutura atual da minha Engine de renderização é a seguinte, abaixo, em ordem sequencial:

# Estrutura atual Engine renderização:

Funções globais que chamam o WebGL ou Open GL.

Declaração antecipada do `Renderer.ts`, apenas com os atributos.

## `VisualMesh.ts`:
Só atributos genéricos que qualquer objeto vai usar. E um ponteiro para o `Renderer.ts`, porém 100% abstrato sem chamar nada dele aqui 
Também métodos abstratos que requerem implantação em cada classe que derivar dela, pois usa muito polimorfismo. O `VisualMesh` é só uma classe base, que vai ser usada como herança na definição das classes que vou falar no tópico `Objetos` um pouco mais abaixo.

## `Renderer.ts`:
Usa ponteiros para `VisualMesh`, acessando e manipulando atributos diretamente. Inclusive chamando métodos das instâncias de ponteiro `VisualMesh`. Porém até aqui não declarei os objetos que usam ela. Ainda é só abstrato, chamadas, parâmetros, e expectativas de retorno. E só.

## `Objetos`:
Abaixo do `Renderer/Renderer.ts` eu declaro todos os tipos de objetos como cubos(`CuboMesh`, `TexturedFacesCubeMesh`, etc), triângulos(`Triangulo3DMesh`, `Triangulo2DMesh`), modelo 3d(tipo `OBJMesh`), cada um com seus métodos implementados, recebendo o que o `Renderer.ts` envia como parâmetro(caso o método use parametros) e devolvendo o que o `Renderer.ts` espera receber(ou não enviando nada, quando é um método que não devolve nada e só manipula o própio objeto).
O `Renderer.ts` não conhece eles individualmente, mas apenas como ponteiros do tipo `VisualMesh`, por causa do polimorfismo. O que reduz complexidade e aumenta a generalização e flexibilidade, pois eu posso implementar os métodos de uma forma diferente para cada objeto.

## `IntegradorCamadas.ts`:
Faz a ligação entre todos esses meus componentes acima, integrando todos eles para trabalharem em conjunto, inclusive outros que não citei, como o `InputListener.ts` que cuida da parte de teclado e mouse para detecção de teclas e movimento do mouse. O `IntegradorCamadas.ts` cria uma instancia de um `Renderer.ts` para ser usado na renderização, e também cria uma instancia de um `InputListener.ts`, e também, cria uma instancia de um `Scene`, e varios outros atributos que eu uso para fazer o controle da criação de objetos, luzes, etc. O arquivo `src/engine/IntegradorCamadas.ts` possui a implantação completa do meu `IntegradorCamadas` que mencionei aqui nesse tópico, inclusive com comentários detalhados que explicam como suas funções funciona, deixando mais claro como funciona essa integração de todos esses componentes juntos.

Dentro de outra classe: `IntegradorCamadas.ts`, Eu adiciono os `Objetos` depois quando todas as intancias estão criadas, dando push no Array de objetos(o array `objetos`) do `Renderer.ts`(ao chamar o método `criarObjeto`), pois o polimorfismo permite isso. Ele vai enxergar as instâncias de `Objeto` como sendo instâncias de `VisualMesh`.

**Eu desenvolvi essa estrutura de classes ao longo do desenvolvimento deste projeto, com intuito de ser 100% compativel para uma migração em C++, por seguir os conceitos de polimorfismo, herança, ponteiros, structs e metodos virtuais.**

*NOTA: Eu não citei cameras, luzes, pois não achei necessario. A estrutura base é essa.*