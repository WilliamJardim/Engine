# Ideias gerais de ambas as minhas engines:

Nota criada no dia 15 de julho de 2025 [neste commit](https://github.com/WilliamJardim/Engine/commit/c37e7f3c66ff432f3670e72b23b7319e05799844#diff-4ca2f8375fd17fbf1846596e3992cc98d0caf970876b2f6a57fd4e3253f35925)

## Destaques histórico de commits desse arquivo de ideias gerais de ambas as minhas engines: 
Essa nota descreve minhas ideias gerais que eu tive ao longo do tempo para ambas as minhas engines: a engine de renderização e a engine de logica/fisica, cujo os códigos de ambas ficam dentro das pastas `src/engine/core/` e `src/engine/renderer/`.
   
 - Até [este commit](https://github.com/WilliamJardim/Engine/blob/ff94942eb0bb49785b7fb97531c1b8a9f0b0533c/src/docs/) **de 08 de agosto de 2025**, este arquivo ainda estava na pasta `src/docs`(digo "ainda estava" por que pretendo mover a documentação inteira de lugar no próximo commit). 

Criar câmeras, sistema de players

Unir a pasta interfaces
Porém separado em duas subpastas:
    - main_engine
    - render_engine

Unir também a pasta utils
Dessa mesma forma

Anotar essas ideias no IDEIAS antes de começar (AQUI!)

Unir a pasta docs com essas subpastas, pra centralizar as ideias e bugs

Esse é meu arquivo com minhas ideias gerais
As subpastas dentro de docs são minhas ideias especificas


# 24/07/2025 19:05 PM (RESOLVIDO)
Corrigir a confusos de ambiguidade por existir dois tipos de Light

No RenderizadorCena não consegui tipar tudo por causa disso.

Ideia: separar as interfaces
LightRenderizador
LightEnginePrincipal

Pra não ter confusão de tipos


# 28/08/2025 16:25 PM - Script quase conversor de código
Criar um "conversor" de código, que vai tentar converter de TypeScript para C++, uma conversão crua, só pra facilitar a portabilidade futura.
Por exemplo
```typescript
public funcao(): tipo
{

}
```

Vai ficar:
```cpp
public tipo funcao()
{

}
```

Tambem vai converter:
  - import para #include
  - . para ->, 
  - E as classes

