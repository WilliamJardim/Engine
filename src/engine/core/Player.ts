/**
* AUTHOR: William Alves Jardim
* LICENSE: Creative Commons BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)
* 
* Desenvolvido por William Alves Jardim como parte de um projeto pessoal.
* Protegido por direitos autorais e licenciado sob Creative Commons BY-NC-ND 4.0.
* 
* Veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.
*/
import ObjectEventLayer from "../interfaces/ObjectEventBlock";
import ObjectPosition from "../interfaces/ObjectPosition";
import ObjectProps from "../interfaces/ObjectProps";
import createCube from "../utils/createCube";
import Camera from "./Camera";
import ObjectBase from "./ObjectBase";
import Scene from "./Scene";

/**
* My Player class
*/
export default class Player extends ObjectBase{
    public tipo:string = 'Player';
    public name:string;
    public objEvents:ObjectEventLayer;
    public id:string;
    public objProps:ObjectProps;
    public scene:Scene|null;
    public initialSpawn:ObjectPosition;
    public playerCamera:Camera|null;
    public cameraHeight:number = 8;

    constructor(objProps:ObjectProps){
        const mesh = createCube(objProps);

        super( mesh.getMesh(), objProps );

        this.objProps    = objProps || {} as ObjectProps;
        this.id          = (this.objProps.name||'imaginario') + String(new Date().getTime());
        this.name        = this.objProps.name;
        this.scene       = null;
        this.objEvents   = new ObjectEventLayer(this.objProps.events || []);

        this.initialSpawn = { x: 20, y: -42, z: 50 };

        // Define a posição inicial do jogador
        this.setPosition( this.initialSpawn );

        this.playerCamera = null;

    }

    public updateCamera(): void
    {
        /**
        * A camera do jogador acompanha a posição do jogador 
        */
        if( this.playerCamera != null )
        {
            this.playerCamera.setPosition({
                x: this.getPosition().x,
                y: this.getPosition().y! + 0.1 + this.cameraHeight,
                z: this.getPosition().z   
            });
        }

        //TODO: Jogador deve ser um cubo invisivel
    }

    //@override
    public updateObject( firstRender: boolean, renderizadorPronto: boolean, frameDelta:number, frameNumber: number ): void
    {
        if( renderizadorPronto == true )
        {
            /**
            * Reseta algumas coisas antes do loop 
            */
            this.pre_loop_reset();

            /**
            * Se é a primeira renderização, cria a camera 
            */
            if( this.scene != undefined && this.playerCamera == null )
            {
                this.playerCamera = new Camera();
                this.playerCamera.setAsMain();
                this.scene.cameras.push( this.playerCamera );
            }

            /**
            * Atualiza a camera do jogador 
            */
            this.updateCamera();

            /**
            * Principal: Fisica, Movimentação e Eventos 
            */
            this.updatePhysics( frameDelta );
            
            /**
            * Igualmente importante, atualiza quais objetos estão colidindo/e os que estão proximos com quais objetos 
            */
            this.updateCollisionState( frameDelta );

            /**
            * Atualiza os movimentos do objeto 
            */
            this.updateMovement( frameDelta );
            

            /**
            * Atualiza os eventos do objeto 
            */
            this.updateEvents( frameDelta );

            /**
            * Atualiza os "attachments" ou "objeto anexados/grudados" ao objeto atual
            */
            this.updateAttachments( frameDelta );
        }
    }
}