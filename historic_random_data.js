const fs = require('fs')

function generateNewRandomPoint(pair_id){
  const data = fs.readFileSync(`./dummy/${pair_id}.json`)
  const random = Math.random()
  return data.at(-1) + (random > .5 ? random*-1 : random)
}

module.exports = {
  generateNewRandomPoint
}