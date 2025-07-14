/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
export class Light
{
    public tipo:string;
    public propriedadesLuz:any;
    public position:any;
    public raio:any;
    public brilho:any;
    public ambient:any;
    public diffuse:any;
    public specular:any;
    public cor:any;
    public intensidade:any;
    
    public name:string;
    public id:string;

    constructor( propriedadesLuz:any )
    {
        this.tipo = "Light";
        this.propriedadesLuz = propriedadesLuz;

        this.name        = propriedadesLuz.name || 'luz';
        this.id          = (this.name) + String(new Date().getTime());
        this.position    = propriedadesLuz.position    || [0,0,0];
        this.raio        = propriedadesLuz.raio        || 1; // Raio de alcance da luz
        this.brilho      = propriedadesLuz.brilho      || 16;
        this.ambient     = propriedadesLuz.ambient     || 0.2; 
        this.diffuse     = propriedadesLuz.diffuse     || 0.2;
        this.specular    = propriedadesLuz.specular    || 0.2;
        this.cor         = propriedadesLuz.cor         || [1, 1, 1];
        this.intensidade = propriedadesLuz.intensidade || 0;
    }

    // Converte o objeto para um objeto mais simples, pra poder usar no meu mini renderizador webgl
    getPropriedadesLuz()
    {
        const tipo        = this.tipo;
        const name        = this.name;
        const id          = this.id;
        const position    = this.position;
        const raio        = this.raio;
        const brilho      = this.brilho;
        const ambient     = this.ambient;
        const diffuse     = this.diffuse;
        const specular    = this.specular;
        const cor         = this.cor;
        const intensidade = this.intensidade;

        return {
            tipo        : tipo,
            name        : name,
            id          : id,
            position    : position,
            raio        : raio,
            brilho      : brilho,
            ambient     : ambient,
            diffuse     : diffuse,
            specular    : specular,
            cor         : cor,
            intensidade : intensidade
        }
    }
}