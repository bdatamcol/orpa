const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Check if we're in production mode
const dev = process.env.NODE_ENV !== 'production';

// Initialize the Next.js app
const app = next({ dev });
const handle = app.getRequestHandler();

// Prepare the Next.js app
app.prepare().then(() => {
  // Create the HTTP server
  createServer((req, res) => {
    // Parse the URL
    const parsedUrl = parse(req.url, true);
    
    // Let Next.js handle the request
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});