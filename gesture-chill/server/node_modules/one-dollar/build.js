'use strict'

const fs = require('fs')

fs.writeFileSync('index.js', Buffer.concat([
  fs.readFileSync('one-dollar.js'),
  fs.readFileSync('export.js')
]))
