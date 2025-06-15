import { GLAdapterWeb } from '../abstractgraphics/webgl/GLAdapterWeb.js';

export function createGraphicsAdapter(tipo = "webgl", options) 
{
    if (tipo === "webgl") return new GLAdapterWeb(options);

    // No futuro: if (tipo === "opengl") return new OpenGLAdapter(options);
}