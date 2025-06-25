import http from 'http';
import { readFile, stat } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const PORT = 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = __dirname;

const server = http.createServer(async (requisicao, resposta) => {

  const caminhoArquivo = join(ROOT, decodeURIComponent(requisicao.url === '/' ? '/index.html' : requisicao.url));

  if( caminhoArquivo.indexOf('..') != -1 )
  {
      console.log('bloqueado', requisicao.url);
      resposta.writeHead(403);
      resposta.end('Forbidden');
      return;
  }

  console.log('Requisitando', caminhoArquivo, existsSync(caminhoArquivo));

  try {
    const statusArquivo    = await stat(caminhoArquivo);
    const extensaoArquivo  = extname(caminhoArquivo).toLowerCase();

    if ( statusArquivo.isDirectory() == true ) 
    {
      console.log('diretório bloqueado', requisicao.url);
      resposta.writeHead(403);
      resposta.end('Forbidden');
      return;
    }
    
    const tiposArquivos = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    // Faz o stream do arquivo solicitado
    resposta.writeHead(200, { 
                              'Content-Type': tiposArquivos[extensaoArquivo] || 'application/octet-stream' 
                            });

    createReadStream(caminhoArquivo).pipe(resposta);

  } catch( excecao ) {
    resposta.writeHead(404);
    resposta.end('404 Not Found');
  }

});

server.listen(PORT, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${PORT}/`);
});
