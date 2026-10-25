const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

const rootDir = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath;
  if (reqPath.startsWith('/projects-demo/')) {
    const rel = reqPath.replace('/projects-demo/', '');
    filePath = path.join(rootDir, '..', rel);
  } else {
    filePath = path.join(rootDir, reqPath);
  }

  const serveFile = (targetFile, stats) => {
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats ? stats.size : fs.statSync(targetFile).size;

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        fs.createReadStream(targetFile, { start, end }).pipe(res);
      }
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        fs.createReadStream(targetFile).pipe(res);
      }
    }
  };

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      const idxFile = path.join(filePath, 'index.html');
      fs.stat(idxFile, (errIdx, statsIdx) => {
        if (!errIdx && statsIdx.isFile()) {
          serveFile(idxFile, statsIdx);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Index Not Found');
        }
      });
      return;
    }

    if (stats.isFile()) {
      serveFile(filePath, stats);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Portofolio Hyouka berjalan di http://localhost:${PORT}`);
});
