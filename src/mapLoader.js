const tmx = require("tmx-parser");

async function loadMap() {
  const map = await new Promise((resolve, reject) => {
    tmx.parseFile("./src/map.tmx", function(err, loadedMap) {
      if (err) return reject(err);
      resolve(loadedMap);
    });
  });

  const layer = map.layers[0];
  const groundTiles = layer.tiles;
  const decalsTiles = map.layers[1].tiles;
  const ground2D = [];
  const decals2D = [];
  for (let row = 0; row < map.width; row++) {
    const groundRow = [];
    const decalsRow = [];
    for (let col = 0; col < map.height; col++) {
      const gTile = groundTiles[row * map.width + col];
      groundRow.push({ id: gTile.id, gid: gTile.gid });
      const dTile = decalsTiles[row * map.width + col];
      if(dTile){
        decalsRow.push({
          id:dTile.id,
          gid: dTile.gid
        })
      }else{
        decalsRow.push(undefined);
      }
    }
    ground2D.push(groundRow);
    decals2D.push(decalsRow);
  }
  return {
    ground2D,
    decals2D
  };
}

module.exports = loadMap;
