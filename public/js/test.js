Array.prototype.forEach.call(this.enemies, enemy => {
    if(enemy.visible) {
      var x = Math.floor(this.player.x / 32);
      var y = Math.floor(this.player.y / 32);
      var x2 = enemy.spritePosition.x;
      var y2 = enemy.spritePosition.y;
      if((x > (x2 - 5)) && (x < (x2 + 5)) && (y > (y2 - 5)) && (y < (y2 + 5))) {
        var tile = this.tileList[this.mapList.indexOf(this.map)][y + 2][x + 1];
        if(enemy.currentPath && enemy.currentPath.length > 0) {
          var temp = enemy.currentPath[0];
          enemy.currentPath = findPath({x: enemy.spritePosition.x + 1, y: enemy.spritePosition.y + 2, tile: enemy.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, enemy.nodes, 25, 25);
          if(temp && enemy.currentPath) {
            enemy.currentPath.unshift(temp);
          }
        } else {
          enemy.currentPath = findPath({x: enemy.spritePosition.x + 1, y: enemy.spritePosition.y + 2, tile: enemy.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, enemy.nodes, 25, 25);
        }
        enemy.state = BotState.ENRAGED;
      }
    }
  });