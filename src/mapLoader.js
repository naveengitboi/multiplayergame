const tmx = require("tmx-parser");

async function loadMap() {
  const map = await new Promise((resolve, reject) => {
    tmx.parseFile("./src/map.tmx", function(err, loadedMap) {
      if (err) return reject(err);
      resolve(loadedMap);
    });
  });

  const layer = map.layers[0];
  const tiles = layer.tiles;

  const map2D = [];
  for (let row = 0; row < map.width; row++) {
    const tileRow = [];
    for (let col = 0; col < map.height; col++) {
      const tile = tiles[row * map.width + col];
      tileRow.push({ id: tile.id, gid: tile.gid });
    }
    map2D.push(tileRow);
  }
  return map2D;
}

module.exports = loadMap;
