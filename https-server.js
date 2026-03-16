/**
 * https-server.js
 * Starts a local HTTPS server with a self-signed certificate.
 * Required so mobile browsers allow camera access.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { execSync } = require('child_process');

// ── Generate self-signed cert using Node's built-in forge (if available) ──
// We use the 'selfsigned' package (auto-installed via npx)

const PORT = 8443;
const ROOT = __dirname;

// Helper: serve static files
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json',
    '.woff2':'font/woff2',
    '.woff': 'font/woff',
  }[ext] || 'application/octet-stream';

  if (!fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
}

// ── Install selfsigned if needed and boot ──
let selfsigned;
try {
  selfsigned = require('selfsigned');
} catch (e) {
  console.log('Installing selfsigned package...');
  execSync('npm install selfsigned --no-save', { stdio: 'inherit' });
  selfsigned = require('selfsigned');
}

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems  = selfsigned.generate(attrs, {
  days: 365,
  algorithm: 'sha256',
  extensions: [
    { name: 'subjectAltName', altNames: [
      { type: 2, value: 'localhost' },
      { type: 7, ip: '172.19.115.188' },
    ]}
  ]
});

const server = https.createServer(
  { key: pems.private, cert: pems.cert },
  (req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    const filePath = path.join(ROOT, urlPath);
    serveFile(res, filePath);
  }
);

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n✅ HTTPS server running!\n');
  console.log('   Open on your PHONE (same Wi-Fi):');
  console.log(`   👉  https://172.19.115.188:${PORT}/library.html\n`);
  console.log('   ⚠️  Your browser will show a security warning.');
  console.log('   On Android: tap "Advanced" → "Proceed to site"');
  console.log('   On iPhone:  tap "Show Details" → "visit this website"\n');
  console.log('Press Ctrl+C to stop.\n');
});
