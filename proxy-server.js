const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxy.web(req, res, { target: 'http://localhost:8080' });
  } else {
    proxy.web(req, res, { target: 'http://localhost:3000' });
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error');
});

server.listen(9000, () => {
  console.log('Proxy server running on port 9000');
  console.log('Frontend: http://localhost:9000');
  console.log('Backend API: http://localhost:9000/api/*');
});
