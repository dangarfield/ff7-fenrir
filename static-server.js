const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('node-mime-types')
const fenrirDirectory = path.join(__dirname)
const kujataDataDirectory = path.join(__dirname, '..', 'kujata-data')

const addCors = res => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  res.setHeader('Access-Control-Max-Age', 2592000) // 30 days
  res.setHeader('Access-Control-Allow-Headers', 'content-type') // Might be helpful
}
const server = http.createServer((req, res) => {
  let cacheControlHeader = 'public, max-age=0'
  let sourceDirectory = fenrirDirectory

  if (req.url.startsWith('/kujata-data')) {
    cacheControlHeader = 'public, max-age=604800'
    sourceDirectory = kujataDataDirectory
    req.url = decodeURI(req.url.substring(12).split('?')[0])
    if (
      req.url.startsWith('/data/field/') ||
      req.url.startsWith('/data/battle/') ||
      req.url.startsWith('/metadata/background-layers/')
    ) {
      cacheControlHeader = 'public, max-age=0'
    }
  } else {
    req.url = decodeURI(req.url.split('?')[0])
  }
  if (
    (req.url.startsWith('/metadata') && req.url.endsWith('.png')) ||
    req.url.endsWith('.zip')
  )
    console.log('file', req.url)

  const filePath = path.join(
    sourceDirectory,
    req.url === '/' ? 'index.html' : decodeURI(req.url)
  )

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found\n')
      return
    }

    if (stats.isFile()) {
      res.setHeader('Cache-Control', cacheControlHeader)
      res.setHeader(
        'Content-Type',
        mime.getMIMEType(filePath) || 'application/octet-stream'
      )
      addCors(res)
      fs.createReadStream(filePath).pipe(res)
    } else {
      res.writeHead(403, { 'Content-Type': 'text/plain' })
      res.end('403 Forbidden\n')
    }
  })
})

server.listen(3000, () => {
  console.log('Fenrir and kujata-data running on http://localhost:3000')
})
