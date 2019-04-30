var TopDownGame = TopDownGame || {};

class Room {

    constructor(up, down, left, right, map, x, y) {
        this.roomUp = up;
        this.roomDown = down;
        this.roomLeft = left;
        this.roomRight = right;
        this.tileMap = map;
        this.x = x;
        this.y = y;
    }
}

let BotState = {
  IDLE: 1,
  ENRAGED: 2,
  NONE: 0
}

class Enemy {

    constructor(sprite, speed, roomX, roomY, nodes, tiles, objects, player, currentRoom) {
      this.player = player;
      this.currentRoom = currentRoom;
      this.sprite = sprite;
      this.spritePosition = {
        x: Math.floor(this.sprite.body.x / 32),
        y: Math.floor(this.sprite.body.y / 32),
        tile: null      
      }
      this.spritePosition.tile = getTile(this.spritePosition.x, this.spritePosition.y, tiles);
      this.speed = speed;
      this.state = BotState.IDLE;
      this.timeToNextRoom = 0;
      this.rotation = 'down'
      this.roomX = roomX;
      this.roomY = roomY;
      this.nodes = nodes;
      this.tiles = tiles;
      this.swapped = false;
      this.objects = objects;
      this.currentPath = null;
      this.pathGraphics = null;

      this.sprite.animations.add('top', [30,31,32,33,34,35], 8, true);
      this.sprite.animations.add('idle', [0], 8, true);
      this.sprite.animations.add('bottom', [6,7,8,9,10,11], 8, true);
      this.sprite.animations.add('bottomleft', [12,13,14,15], 8, true);
      this.sprite.animations.add('left', [18,19,20,21], 8, true);
      this.sprite.animations.add('topleft', [24,25,26,27], 8, true);
      this.sprite.animations.add('topright', [36,37,38,39], 8, true);
      this.sprite.animations.add('right', [42,43,44,45], 8, true);
      this.sprite.animations.add('bottomright', [48,49,50,51], 8, true);

      this.sprite.animations.add('toprun', [30,31,32,33,34,35], 16, true);
      this.sprite.animations.add('idlerun', [0], 16, true);
      this.sprite.animations.add('bottomrun', [6,7,8,9,10,11], 16, true);
      this.sprite.animations.add('bottomleftrun', [12,13,14,15], 16, true);
      this.sprite.animations.add('leftrun', [18,19,20,21], 16, true);
      this.sprite.animations.add('topleftrun', [24,25,26,27], 16, true);
      this.sprite.animations.add('toprightrun', [36,37,38,39], 16, true);
      this.sprite.animations.add('rightrun', [42,43,44,45], 16, true);
      this.sprite.animations.add('bottomrightrun', [48,49,50,51], 16, true);
      this.sprite.body.setSize(24,16,20,48);
      this.sprite.animations.play('idle');
      this.behaviors = {};
      this.counter = false;
      this.visible = true;

      this.interval = setInterval(function() {
        //this.baseBehavior();
        this.think();
      }.bind(this), 5);
    }

    addBehavior(state, behavior) {
      this.behaviors[state] = behavior;
    }

    setState(initState) {
      this.state = initState;
    }

    setVisible(visibility) {
      this.visible = visibility;
    }

    think() {
      if(this.behaviors[this.state]) {
        this.behaviors[this.state].think();
      }
    }

    baseBehavior() {
      // if(this.currentPath == null) {
      //   if(this.sprite.body.velocity.x > 0) {
      //     if(this.sprite.body.velocity.x < 5) {
      //       this.sprite.body.velocity.x = 0;
      //     } else {
      //       this.sprite.body.velocity.x = this.sprite.body.velocity.x / 3;
      //     }
      //   } else if (this.sprite.body.velocity.x < 0) {
      //       if(this.sprite.body.velocity.x > -5) {
      //         this.sprite.body.velocity.x = 0;
      //       } else {
      //         this.sprite.body.velocity.x = this.sprite.body.velocity.x / 3;
      //       }
      //   }
      //   if(this.sprite.body.velocity.y > 0) {
      //     if(this.sprite.body.velocity.y < 5) {
      //       this.sprite.body.velocity.y = 0;
      //     } else {
      //       this.sprite.body.velocity.y = this.sprite.body.velocity.y / 3;
      //     }
      //   }
      //   else if (this.sprite.body.velocity.y < 0) {
      //       if(this.sprite.body.velocity.y > -5) {
      //         this.sprite.body.velocity.y = 0;
      //       } else {
      //         this.sprite.body.velocity.y = this.sprite.body.velocity.y / 3;
      //       }
      //   }
      // }
    }

    toNewMap(roomX, roomY, newNodes, newTiles, newObjects) {
      this.roomX = roomX;
      this.roomY = roomY;
      this.nodes = newNodes;
      this.newTiles = newTiles;
      this.objects = newObjects;
    }
}

class EnrageBehavior {
  constructor(bot) {
    this.bot = bot;

  }

  think_more() {
    var x = Math.floor(this.bot.player.x / 32);
    var y = Math.floor(this.bot.player.y / 32);
    var x2 = this.bot.spritePosition.x;
    var y2 = this.bot.spritePosition.y;
    if((x > (x2 - 5)) && (x < (x2 + 5)) && (y > (y2 - 5)) && (y < (y2 + 5)) && this.bot.currentRoom.x == this.bot.roomX && this.bot.currentRoom.y == this.bot.roomY) {
      var tile = this.bot.tiles[y + 2][x + 1];
      this.bot.currentPath = findPath({x: x2 + 1, y: y2 + 2, tile: this.bot.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, this.bot.nodes, 25, 25);
      this.bot.setState(BotState.ENRAGED);
    }
  }

  think() {
    if(this.bot.currentPath && this.bot.currentPath.length > 0) {
      var x2 = this.bot.currentPath[0].x;
      var y2 = this.bot.currentPath[0].y;
      
      var x = this.bot.spritePosition.x + 1;
      var y = this.bot.spritePosition.y + 2;
      
      var bodyX = this.bot.sprite.body.x;
      var bodyY = this.bot.sprite.body.y;
      
      if(x2 < x && y2 < y) {
        //TOP LEFT
        if((bodyY / 32) < y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topleftrun');
          }
        }
      } else if (x2 == x && y2 < y) {
        //TOP
        if((bodyY / 32) < y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('toprun');
          }
        }
      } else if (x2 > x && y2 < y) {
        //TOP RIGHT
        if((bodyY / 32) < y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('toprightrun');
          }
        }
      } else if (x2 < x && y2 == y) {
        // LEFT
        if((bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('leftrun');
          }
        }
      } else if (x2 > x && y2 == y) {
        // RIGHT
        if((bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('rightrun');
          }
        }
      } else if (x2 < x && y2 > y) {
        // BOTTOM LEFT
        if((bodyY / 32) > y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomleftrun');
          }
        }
      } else if (x2 == x && y2 > y) {
        // BOTTOM
        if((bodyY / 32) > y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomrun');
          }
        }
      } else {
        // BOTTOM RIGHT
        if((bodyY / 32) > y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomrightrun');
          }
        }
      }
    } else {
      this.bot.setState(BotState.IDLE);
    }
    this.bot.counter = true;
  }
}

class IdleBehavior {
  constructor(bot) {
    this.bot = bot;
  }

  think_more() {
    var x = Math.floor(this.bot.player.x / 32);
    var y = Math.floor(this.bot.player.y / 32);
    var x2 = this.bot.spritePosition.x;
    var y2 = this.bot.spritePosition.y;
    if((x > (x2 - 5)) && (x < (x2 + 5)) && (y > (y2 - 5)) && (y < (y2 + 5)) && this.bot.currentRoom.x == this.bot.roomX && this.bot.currentRoom.y == this.bot.roomY) {
      var tile = this.bot.tiles[y + 2][x + 1];
      this.bot.currentPath = findPath({x: x2 + 1, y: y2 + 2, tile: this.bot.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, this.bot.nodes, 25, 25);
      if(this.bot.currentPath && this.bot.currentPath != []) {
        this.bot.setState(BotState.ENRAGED);
      }
    }
  }

  think() {
    if(this.bot.currentPath && this.bot.currentPath.length > 0) {
      var x2 = this.bot.currentPath[0].x;
      var y2 = this.bot.currentPath[0].y;
      
      var x = this.bot.spritePosition.x + 1;
      var y = this.bot.spritePosition.y + 2;
      
      var bodyX = this.bot.sprite.body.x;
      var bodyY = this.bot.sprite.body.y;
      
      if(x2 < x && y2 < y) {
        //TOP LEFT
        if((bodyY / 32) < y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topleft');
          }
        }
      } else if (x2 == x && y2 < y) {
        //TOP
        if((bodyY / 32) < y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('top');
          }
        }
      } else if (x2 > x && y2 < y) {
        //TOP RIGHT
        if((bodyY / 32) < y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topright');
          }
        }
      } else if (x2 < x && y2 == y) {
        // LEFT
        if((bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('left');
          }
        }
      } else if (x2 > x && y2 == y) {
        // RIGHT
        if((bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('right');
          }
        }
      } else if (x2 < x && y2 > y) {
        // BOTTOM LEFT
        if((bodyY / 32) > y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomleft');
          }
        }
      } else if (x2 == x && y2 > y) {
        // BOTTOM
        if((bodyY / 32) > y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottom');
          }
        }
      } else {
        // BOTTOM RIGHT
        if((bodyY / 32) > y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomright');
          }
        }
      }
    } else {
      //BOT IS CURRENTLY IDLE, LET'S PICK A RANDOM PLACE TO GO
      this.think_more();
      if(!this.bot.currentPath || this.bot.currentPath.length == 0) {
        var move = Math.random() > 0.995 ? true : false;
        if(move) {
          var tiles = [];
          for(var i = this.bot.spritePosition.y - 1; i < this.bot.spritePosition.y + 5; i++) {
            for(var x = this.bot.spritePosition.x - 2; x < this.bot.spritePosition.x + 4; x++) {
              if(i > 0 && x > 0 && !this.bot.tiles[i][x].tile.collideDown) {
                tiles.push(this.bot.tiles[i][x]);
              }
            }
          }
          var objList = this.bot.objects.map(obj => JSON.stringify(obj));
          tiles = tiles.filter(tile => !objList.includes(JSON.stringify({x: tile.x, y: tile.y})));      
          var destTile = tiles[Math.floor(Math.random()*tiles.length)];
          var offPosition = {x:this.bot.spritePosition.x + 1, y:this.bot.spritePosition.y + 2, tile: this.bot.spritePosition.tile};
          this.bot.currentPath = findPath(offPosition, {x: destTile.x, y: destTile.y, tile: destTile}, this.bot.nodes, 25, 25);
        }
      }
    }
    this.bot.counter = true;
  }
}

function findRoom(rooms, x, y) {
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].x == x && rooms[i].y == y) {
      return rooms[i];
    }
  }
  return null;
}

function findMap(room, maps) {
  for(var i = 0; i < maps.length; i++) {
    if(maps[i].key == room.tileMap) {
      return maps[i];
    }
  }
}

function getValidDoors(room, maps) {
  var currentDoors = [];
  var map = findMap(room, maps);
  map.objects['doorLayer'].forEach(function(obj) {
    currentDoors.push(
      obj.properties[0].value
    );
  });
  return currentDoors;
}

function drawPathGraphics(graphics, game, graphics_array) {
  if(graphics) {
    graphics.kill();
  }
  var graphics = game.add.graphics();
  for(var i = 0; i < graphics_array.length; i++) {
    graphics.beginFill(0xFF0000, 0.4);
    graphics.drawRect(graphics_array[i].tile.worldX, graphics_array[i].tile.worldY, 32, 32);
  }
  return graphics;
}

class Node {
  constructor(obj) {
    this.tile = obj.tile;
    this.x = obj.x;
    this.y = obj.y;
    this.g = this.h = 0;
    this.blocked = obj.tile.collideDown;
    this.parent = null;
  }

  getF() {
    return this.g + this.h;
  }

  resetNode() {
    this.g = this.h = 0;
    this.parent = null;
  }
}

function getAdjacent(node, nodes, rows, cols) {
  var adjacentNodes = new Array();

  for(var x = -1; x < 2; x++) {
    for(var y = -1; y < 2; y++) {
      if (x || y) {
        var x2 = node.x + x;
        var y2 = node.y + y;

        if(x2 >= 0 && x2 < cols && y2 >= 0 && y2 < rows) {
          adjacentNodes.push(nodes[y2][x2]);
        }
      }
    }
  }

  return adjacentNodes;
}

function getDistance(start, end) {
  var diffX = Math.abs(start.x - end.x);
  var diffY = Math.abs(start.y - end.y);
  return diffX > diffY ? (10 * (diffX - diffY)) + (14 * diffY) : (10 * (diffY - diffX)) + (14 * diffX);
}

function getPath(start, end) {
  var path = [];
  var current = end;

  while(current != start) {
    path.push(current);
    current = current.parent;
  }
  path.reverse();

  return path;
}

function findPath(start, end, nodes, row, col) {
  var start_node = nodes[start.y][start.x];
  var end_node = nodes[end.y][end.x];

  var open = new Array();
  var closed = new Array();
  open.push(start_node);

  while(open.length > 0) {
    //TRAVERSE
    var current = open[0];
    for(var i = 0; i < open.length; i++) {
      if(open[i].getF() < current.getF() || open[i].getF() == current.getF()) {
        if(open[i].h < current.h) {
          current = open[i];
        }
      }
    }

    //SET NEW COSTS FOR SURROUNDING NODES
    open.splice(open.indexOf(current), 1);
    closed.push(current);

    if (current == end_node) {
      //RETRACE
      return getPath(start_node, end_node);
    }

    var adjacentNodes = getAdjacent(current, nodes, row, col);
    Array.prototype.forEach.call(adjacentNodes, neighbor => {
      if(neighbor.blocked || closed.includes(neighbor)) {
        return;
      }
      var newCost = current.g + getDistance(current, neighbor);
      if (newCost < neighbor.g || !open.includes(neighbor)) {
        neighbor.g = newCost;
        neighbor.h = getDistance(neighbor, end_node);
        neighbor.parent = current;

        if(!open.includes(neighbor)) {
          open.push(neighbor);
        }
      }
    });
  }

  return null;
}

function getTile(x_coords, y_coords, tiles) {
  for(var i = 0; i < tiles.length; i++) {
    for(var x = 0; x < tiles[i].length; x++) {
      if(tiles[i][x].x == x_coords && tiles[i][x].y == y_coords) {
        return tiles[i].tile;
      }
    }
  }
  return null;
}

function drawGraphics(graphics, game, rooms, currentRoom) {
  if(graphics) {
    graphics.kill();
  }
  var graphics = game.add.graphics();
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].x == currentRoom.x && rooms[i].y == currentRoom.y) {
      // DRAW GREEN
      graphics.beginFill(0x41f44d, 0.65);
      graphics.drawRect((rooms[i].x + 5) * 16, (rooms[i].y + 5) * 16, 16, 16);
    } else {
      graphics.beginFill(0x42b0f4, 0.65);
      graphics.drawRect((rooms[i].x + 5) * 16, (rooms[i].y + 5) * 16, 16, 16);
    }
  }
  return graphics;
}

//title screen
TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
  create: function() {
    // LOAD UP MAPPING FOR REALTIME DYNAMIC MAP GENERATION
    this.currentRoom = new Room(null, null, null, null, '2', 0, 0);
    this.currentDoors = [];
    this.mapList = [];
    this.tileList = [];
    this.nodeList = [];
    this.objs = [];
    this.graphics = this.game.add.graphics();
    // ROOMS THAT ARE CHOSEN IF YOU WENT THROUGH A DOOR IN
    // SOME DIRECTION, ex: choose a down door, go into an
    // up room.
    this.downRooms = [];
    this.upRooms = [];
    this.leftRooms = [];
    this.rightRooms = [];
    this.deadEnds = [];
    this.numRooms = 37;
    this.rooms = [new Room(null, null, null, null, '2', 0, 0)];
    this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom);
    this.graphics.fixedToCamera = true;

    // SET UP ALL MAPS
    for(var i = 0; i < this.numRooms; i++) {
      var map = this.game.add.tilemap((i+1).toString());
      var newRoom = new Room(null, null, null, null, (i+1).toString());
      var counter = 0;
      map.objects['doorLayer'].forEach(function(door) {
        if(door.properties[0].value == 'up') {
          this.downRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'down') {
          this.upRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'left') {
          this.rightRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'right') {
          this.leftRooms.push(newRoom);
          counter++;
        }

      }.bind(this));
      if(counter == 1) {
        this.deadEnds.push(newRoom);
      }
      this.mapList.push(map);
    }

    // SET STARTING ROOM
    this.map = this.mapList[1];

    // TEST
    this.music = this.game.add.audio('music');
    this.game.sound.setDecodedCallback(this.music, function() {
      this.music.loopFull(0.5);
      this.music.volume = 0.5;
    }.bind(this), this);
    // SET UP DOORS

    //LOAD PATHFINDING TILES AND NODES
    for(var i = 0; i < this.numRooms; i++) {
      //LOAD PATHFINDING NODES
      var nodes = [];
      var tiles = [];
      var newObjArr = []
      //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
      this.mapList[i].addTilesetImage('floor1tiles', 'gameTiles');
      this.mapList[i].addTilesetImage('objects', 'objectTiles');

      //create layer
      this.backgroundlayer = this.mapList[i].createLayer('backgroundLayer');
      this.wallLayer = this.mapList[i].createLayer('wallLayer');
      this.aboveLayer = this.mapList[i].createLayer('aboveLayer');
      this.objectLayer = this.mapList[i].createLayer('objectLayer');
      this.aboveObjectLayer = this.mapList[i].createLayer('objectAboveLayer');

      //collision on blockedLayer
      this.mapList[i].setCollisionBetween(1, 2000, true, 'wallLayer');
      this.mapList[i].setCollisionBetween(1, 2000, true, 'objectLayer');
      this.mapList[i].setCollisionBetween(1, 2000, true, 'objectAboveLayer');

      //resizes the game world to match the layer dimensions
      this.backgroundlayer.resizeWorld();

      Array.prototype.forEach.call(this.mapList[i].layers[2].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.collideDown) {
            newObjArr.push({x: tile.x, y: tile.y});
          }
        });
      });
      this.objs.push(newObjArr);
      var tempArr = newObjArr.map(obj => JSON.stringify(obj));
      Array.prototype.forEach.call(this.mapList[i].layers[1].data, row => {
        var newArr = [];
        var newArr2 = [];
        Array.prototype.forEach.call(row, tile => {
          if(tempArr.includes(JSON.stringify({x:tile.x,y:tile.y}))) {
            tile.collideDown = true;
          }
          newArr.push(new Node({
            x: tile.x,
            y: tile.y,
            tile: tile
          }));
          newArr2.push({
            x: tile.x,
            y: tile.y,
            tile: tile
          });
        });
        nodes.push(newArr);
        tiles.push(newArr2);
      });
    
      this.nodeList.push(nodes);
      this.tileList.push(tiles);
      this.backgroundlayer.destroy();
      this.wallLayer.destroy();
      this.objectLayer.destroy();
      this.aboveObjectLayer.destroy();
      this.aboveLayer.destroy();
    }

    this.map.objects['doorLayer'].forEach(function(obj) {
      this.currentDoors.push({
        x: Math.floor(obj.x / 32),
        y: Math.floor(obj.y / 32),
        properties: obj.properties
      });
    }.bind(this));

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('floor1tiles', 'gameTiles');
    this.map.addTilesetImage('objects', 'objectTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.wallLayer = this.map.createLayer('wallLayer');
    this.aboveLayer = this.map.createLayer('aboveLayer');
    this.objectLayer = this.map.createLayer('objectLayer');
    this.aboveObjectLayer = this.map.createLayer('objectAboveLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'wallLayer');
    this.map.setCollisionBetween(1, 2000, true, 'objectLayer');
    this.map.setCollisionBetween(1, 2000, true, 'objectAboveLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    //create player
    this.player = this.game.add.sprite(400, 300, 'player');
    this.staminaBar = this.game.add.sprite(40, 580, 'barIn');
    this.staminaBarOut = this.game.add.sprite(40, 580, 'barOut');
    this.staminaBar.fixedToCamera = true;
    this.staminaBarOut.fixedToCamera = true;
    this.staminaBar.scale.y = 0.5;
    this.staminaBarOut.scale.y = 0.5;
    this.game.physics.arcade.enable(this.player);
    this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);
    this.stamina = 1000;
    this.regen = true;
    this.staminaTimer = null;
    
    //create enemy
    this.enemies = [];
    
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);
    this.game.stage.backgroundColor = '#000000';
    this.text = this.game.add.text(20, 20, '', {
      font: '24px courier',
      fill: '#ff0000',
      fontWeight: 'bold'
    });
    this.text.fixedToCamera = true;
    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.playerSpeed = 100;

    //LOAD ANIMATIONS
    this.player.animations.add('top', [40,41,42,43,44,45,46,47], 8, true);
    this.player.animations.add('topleft', [32,33,34,35,36,37,38,39], 8, true);
    this.player.animations.add('left', [24,25,26,27], 8, true);
    this.player.animations.add('bottomleft', [16,17,18,19,20,21,22,23], 8, true);
    this.player.animations.add('bottom', [8,9,10,11,12,13,14,15], 8, true);
    this.player.animations.add('bottomright', [64,65,66,67,68,69,70,71], 8, true);
    this.player.animations.add('right', [56,57,58,59], 8, true);
    this.player.animations.add('topright', [48,49,50,51,52,53,54,55], 8, true);
    this.player.animations.add('idle', [0,1,2,3], 8, true);
    this.player.animations.add('toprun', [40,41,42,43,44,45,46,47], 16, true);
    this.player.animations.add('topleftrun', [32,33,34,35,36,37,38,39], 16, true);
    this.player.animations.add('leftrun', [24,25,26,27], 16, true);
    this.player.animations.add('bottomleftrun', [16,17,18,19,20,21,22,23], 16, true);
    this.player.animations.add('bottomrun', [8,9,10,11,12,13,14,15], 16, true);
    this.player.animations.add('bottomrightrun', [64,65,66,67,68,69,70,71], 16, true);
    this.player.animations.add('rightrun', [56,57,58,59], 16, true);
    this.player.animations.add('toprightrun', [48,49,50,51,52,53,54,55], 16, true);
    this.player.animations.play('idle');
    this.player.body.setSize(24,16,20,48);
    this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.graphics = this.game.add.graphics();

    //GENERATE MAP
    console.log(this.map);
    this.lose = false;

    // DEBUG TOGGLE
    this.toggle = false;
    this.t = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.t.onDown.add(function() {
      this.toggle = !this.toggle;
      if(!this.toggle) {
        if(this.graphics && this.graphics.alive) {
          this.graphics.kill();
          this.graphics = null;
        }
        if(this.enemies) {
          Array.prototype.forEach.call(this.enemies, enemy => {
            if(enemy.pathGraphics) {
              enemy.pathGraphics.kill();
              enemy.pathGraphics = null;
            }
          });
        }
        if(this.text) {
          this.text.destroy();
          this.text = null;
        }
      }
    }.bind(this));

    // MAIN PLAYER LOOP
    this.playerLoop = setInterval(function() {
      // PLAYER ENTER DOOR
      var roomsIndex = this.rooms.length;
      for(var i = 0; i < this.currentDoors.length; i++) {
        if(this.currentDoors[i].x - 1 == Math.floor(this.player.x / 32) && this.currentDoors[i].y - 3 == Math.floor(this.player.y / 32)) {
          var direction = this.currentDoors[i].properties[0].value;
          var rooms = this.rooms;
          switch(direction) {
            case 'up': 
              direction = 'down';
              if(this.currentRoom.roomUp) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomUp;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x && this.rooms[i].y == this.currentRoom.y - 1) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomUp = this.rooms[i];  
                    this.rooms[i].roomDown = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.y > 5 || this.currentRoom.y < -5) || Math.random(0, 20) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.upRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomUp = newRoom;
                    newRoom.roomDown = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y - 1;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.upRooms.length; x++) {
                      if(!this.deadEnds.includes(this.upRooms[x])) {
                        roomlist.push(this.upRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomUp = newRoom;
                    newRoom.roomDown = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y - 1;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'down':
              direction = 'up';
              if(this.currentRoom.roomDown) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomDown;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x && this.rooms[i].y == this.currentRoom.y + 1) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomDown = this.rooms[i];
                    this.rooms[i].roomUp = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.y > 5 || this.currentRoom.y < -5) || Math.random(0, 20) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.downRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomDown = newRoom;
                    newRoom.roomUp = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y + 1;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.downRooms.length; x++) {
                      if(!this.deadEnds.includes(this.downRooms[x])) {
                        roomlist.push(this.downRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomDown = newRoom;
                    newRoom.roomUp = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y + 1;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'left':
              direction = 'right';
              if(this.currentRoom.roomLeft) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomLeft;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x - 1 && this.rooms[i].y == this.currentRoom.y) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomLeft = this.rooms[i];
                    this.rooms[i].roomRight = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.x > 5 || this.currentRoom.x < -5) || Math.random(0, 20) >  Math.pow(1.7, Math.abs(this.currentRoom.x))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.leftRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomLeft = newRoom;
                    newRoom.roomRight = this.currentRoom;
                    newRoom.x = this.currentRoom.x - 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.leftRooms.length; x++) {
                      if(!this.deadEnds.includes(this.leftRooms[x])) {
                        roomlist.push(this.leftRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomLeft = newRoom;
                    newRoom.roomRight = this.currentRoom;
                    newRoom.x = this.currentRoom.x - 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'right':
              direction = 'left';
              if(this.currentRoom.roomRight) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomRight;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x + 1 && this.rooms[i].y == this.currentRoom.y) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomRight = this.rooms[i];
                    this.rooms[i].roomLeft = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.x > 5 || this.currentRoom.x < -5) || Math.random(0, 20) > Math.pow(1.7, Math.abs(this.currentRoom.x))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.rightRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomRight = newRoom;
                    newRoom.roomLeft = this.currentRoom;
                    newRoom.x = this.currentRoom.x + 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.rightRooms.length; x++) {
                      if(!this.deadEnds.includes(this.rightRooms[x])) {
                        roomlist.push(this.rightRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomRight = newRoom;
                    newRoom.roomLeft = this.currentRoom;
                    newRoom.x = this.currentRoom.x + 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
          }
          // SET NEW MAP, CURRENT DOORS, AND LAYERS
          this.oldMap = this.map;
          this.map = this.mapList[parseInt(this.currentRoom.tileMap) - 1];
          this.currentDoors = [];
          this.map.objects['doorLayer'].forEach(function(obj) {
            this.currentDoors.push({
              x: Math.floor(obj.x / 32),
              y: Math.floor(obj.y / 32),
              properties: obj.properties
            });
          }.bind(this));

          var door = this.currentDoors.filter(door => door.properties[0].value == direction);
          if(door.length != 0) {
            var xOffset = 0;
            var yOffset = 0;
            switch(direction) {
              case 'up':
                xOffset = -0.5;
                yOffset = -1;
                break;
              case 'down':
                xOffset = -0.5;
                yOffset = -3.25;
                break;
              case 'left':
                xOffset = 0;
                yOffset = -2;
                break;
              case 'right':
                xOffset = -2;
                yOffset = -2;
                break;
            }
            this.player.x = (door[0].x + xOffset) * 32;
            this.player.y = (door[0].y + yOffset) * 32;

            // SET MAP LAYERS
            this.backgroundlayer.destroy();
            this.wallLayer.destroy();
            this.objectLayer.destroy();
            this.aboveObjectLayer.destroy();
            this.aboveLayer.destroy();
            //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
            this.map.addTilesetImage('floor1tiles', 'gameTiles');
            this.map.addTilesetImage('objects', 'objectTiles');

            //create layer
            this.backgroundlayer = this.map.createLayer('backgroundLayer');
            this.wallLayer = this.map.createLayer('wallLayer');
            this.aboveLayer = this.map.createLayer('aboveLayer');
            this.objectLayer = this.map.createLayer('objectLayer');
            this.aboveObjectLayer = this.map.createLayer('objectAboveLayer');

            //collision on blockedLayer
            this.map.setCollisionBetween(1, 2000, true, 'wallLayer');
            this.map.setCollisionBetween(1, 2000, true, 'objectLayer');
            this.map.setCollisionBetween(1, 2000, true, 'objectAboveLayer');

            //resizes the game world to match the layer dimensions
            this.backgroundlayer.resizeWorld();

            // DETERMINE IF WE SPAWN ENEMIES, WE ONLY SPAWN THEM
            if(roomsIndex != this.rooms.length && Math.random() < 0.2 - (this.enemies.length / 25)) {
              // PLACE SUCH THAT CURRENT PATH CAN GO TO DOOR!
              var tiles = this.tileList[this.mapList.indexOf(this.map)];
              var possibleTiles = [];
              var doorTo = this.currentDoors[0];
              var doorTile = this.tileList[this.mapList.indexOf(this.map)][doorTo.y-1][doorTo.x];
              for(var m = 0; m < tiles.length; m++) {
                for(var n = 0; n < tiles[m].length; n++) {
                  var tile = tiles[m][n];
                  var objl = this.objs[this.mapList.indexOf(this.map)];
                  // ENEMIES CANNOT SPAWN IN OBJECTS
                  for(var x = 0; x < objl.length; x++) {
                    if(objl[x].x == tile.x && objl[x].y == tile.y) {
                      tile = null;
                      break;
                    }
                  }
                  if(!tile) {
                    continue;
                  }
                  for(var x = 0; x < this.currentDoors.length; x++) {
                    if(this.currentDoors[x].x - 3 <= tile.x && this.currentDoors[x].x + 3 >= tile.x
                      && this.currentDoors[x].y - 3 <= tile.y && this.currentDoors[x].y + 3 >= tile.y) {
                        tile = null;
                        break;
                      }
                  }
                  if(!tile || tile.tile.collideDown) {
                    continue;
                  }
                  var cPath = findPath({x:tile.x, y: tile.y, tile: tile.tile}, {x:doorTile.x, y:doorTile.y, tile: doorTile.tile}, this.nodeList[this.mapList.indexOf(this.map)], 25, 25);
                  if(cPath) {
                    possibleTiles.push(tile);
                  }
                }
              }
              this.pathGraphics = null;
              this.pathGraphics = drawPathGraphics(this.pathGraphics, this.game, possibleTiles);
              var tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
              
              var enemy = this.game.add.sprite((tile.x * 32) - 16, (tile.y * 32) - 48, 'abg');
              this.game.physics.arcade.enable(enemy);
              var bot = new Enemy(enemy, 60, this.currentRoom.x, this.currentRoom.y, this.nodeList[this.mapList.indexOf(this.map)], this.tileList[this.mapList.indexOf(this.map)], this.objs[this.mapList.indexOf(this.map)], this.player, this.currentRoom)
              bot.addBehavior(BotState.IDLE, new IdleBehavior(bot));
              bot.addBehavior(BotState.ENRAGED, new EnrageBehavior(bot));
              this.enemies.push(bot);
            }


            this.game.world.bringToTop(this.player);
            for(var i = 0; i < this.enemies.length; i++) {
              if(this.enemies[i].roomX == this.currentRoom.x && this.enemies[i].roomY == this.currentRoom.y) {
                this.enemies[i].setVisible(true);
                this.game.world.bringToTop(this.enemies[i].sprite);
              } else {
                this.enemies[i].setVisible(false);
              }
            }
            this.game.world.bringToTop(this.aboveObjectLayer);
            this.game.world.bringToTop(this.aboveLayer);
            this.game.world.bringToTop(this.staminaBar);
            this.game.world.bringToTop(this.staminaBarOut);
            if(this.toggle) {
              this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom);
              this.graphics.fixedToCamera = true;
            }
            this.locked = false;

            this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);
          } else {
            this.currentRoom = this.rooms[this.currentRoomIndex];
            // switch(direction) {
            //   case 'up':
            //     this.currentRoom.roomDown = null;
            //     this.otherRoom.roomUp = null;
            //     break;
            //   case 'down':
            //     this.currentRoom.roomUp = null;
            //     this.otherRoom.roomDown = null;
            //     break;
            //   case 'right':
            //     this.currentRoom.roomLeft = null;
            //     this.otherRoom.roomRight = null;
            //     break;
            //   case 'left':
            //     this.currentRoom.roomRight = null;
            //     this.otherRoom.roomLeft = null;
            //     break;
            // }

            this.map = this.oldMap;
            this.currentDoors = [];
            this.map.objects['doorLayer'].forEach(function(obj) {
              this.currentDoors.push({
                x: Math.floor(obj.x / 32),
                y: Math.floor(obj.y / 32),
                properties: obj.properties
              });
            }.bind(this));
            this.oldMap = null;
            this.oldRoom = null;
            this.otherRoom = null;
            this.locked = true;
          }
        }
      }

      //REFACTOR
      for(var i = 0; i < this.rooms.length; i++) {
        var current = this.rooms[i];
        var cDoors = getValidDoors(current, this.mapList);
        for(var x = 0; x < cDoors.length; x++) {
          switch(cDoors[x]) {
            case 'up':
              var uRoom = findRoom(this.rooms, current.x, current.y - 1);
              if(uRoom) {
                current.roomUp = uRoom;
                uRoom.roomDown = current;
              }
              break;
            case 'down':
              var dRoom = findRoom(this.rooms, current.x, current.y + 1);
              if(dRoom) {
                current.roomDown = dRoom;
                dRoom.roomUp = current;
              }
              break;
            case 'left':
              var lRoom = findRoom(this.rooms, current.x - 1, current.y);
              if(lRoom) {
                current.roomLeft = lRoom;
                lRoom.roomRight = current;
              }
              break;
            case 'right':
              var rRoom = findRoom(this.rooms, current.x + 1, current.y);
              if(rRoom) {
                current.roomRight = rRoom;
                rRoom.roomLeft = current;
              }
              break;
          }
        }
      }

      // ENEMY DISPLAY   
      Array.prototype.forEach.call(this.enemies, enemy => {
        if(enemy.currentPath && this.toggle && enemy.visible) {
          enemy.pathGraphics = drawPathGraphics(enemy.pathGraphics, this.game, enemy.currentPath);
        }
      });

      this.enemies.sort(enemy => enemy.sprite.y);
      for(var i = 0; i < this.enemies.length; i++) {
        if(this.enemies[i].visible) {
          if(this.enemies[i].sprite.y < this.player.y && !this.enemies[i].swapped) {
            this.game.world.swap(this.player, this.enemies[i].sprite);
            this.enemies[i].swapped = true;
          } else if (this.enemies[i].sprite.y >= this.player.y && this.enemies[i].swapped) {
            this.game.world.swap(this.player, this.enemies[i].sprite);
            this.enemies[i].swapped = false;
          }
        }
      }

      //DEBUG TEXT
      if(this.toggle) {
        if(this.text) {
          this.text.destroy();
        }
        this.text = this.game.add.text(20, 20, '', {
          font: '24px courier',
          fill: '#ff0000',
          fontWeight: 'bold'
        });
        this.text.fixedToCamera = true;
        this.text.text = (Math.floor(this.player.x / 32)+1) + ", " + (Math.floor(this.player.y / 32)+2) + "\n"
        + this.currentRoom.x + ", " + this.currentRoom.y + "\n"
        + this.currentRoom.tileMap + "/" + this.stamina;
        if(this.locked) {
          this.text.text += "\nThe door is locked!";
        }
      }

      Array.prototype.forEach.call(this.enemies, enemy => {
        if(enemy.sprite.x - 16 <= this.player.x && enemy.sprite.x + 16 >= this.player.x && enemy.sprite.y - 16 <= this.player.y && enemy.sprite.y + 16 >= this.player.y && this.currentRoom.x == enemy.roomX && this.currentRoom.y == enemy.roomY) {
          this.loadLevel('MainMenu');
        }
      });

      //STAMINA HANDLER
      if(Math.abs(this.player.body.velocity.x) == this.playerSpeed * 2 || Math.abs(this.player.body.velocity.y) == this.playerSpeed * 2) {
        //PLAYER IS RUNNING
        clearTimeout(this.staminaTimer);
        this.regen = false;
        this.staminaTimer = setTimeout(function() {
          this.regen = true;
        }.bind(this), 2000);
        if(this.stamina != 0) {
          this.stamina--;
          if(this.stamina == 0) {
            clearTimeout(this.staminaTimer);
            this.staminaTimer = setTimeout(function() {
              this.regen = true;
            }.bind(this), 5000);
          }
        }
      }

      if(this.regen && this.stamina != 1000) {
        this.stamina++;
      }
      
      if(this.stamina >= 650) {
        this.staminaBar.frame = 0;
      } else if (this.stamina >= 300) {
        this.staminaBar.frame = 2;
      } else {
        this.staminaBar.frame = 1;
      }
      this.staminaBar.scale.x = this.stamina/1000;
    }.bind(this), 5);
   
  },
  loadLevel(level) {
    clearInterval(this.playerLoop);
    this.music.destroy();
    Array.prototype.forEach.call(this.enemies, enemy => {
      clearInterval(enemy.interval);
    });
    this.game.state.start(level, true, false);
  },
  update: function() {
    if(this.lose) {
      console.log("YOU LOSE");
    }
    //collision
    this.game.physics.arcade.collide(this.player, this.wallLayer);
    this.game.physics.arcade.collide(this.player, this.objectLayer);
    // for(var i = 0; i < this.enemies.length; i++) {
    //   if(this.enemies[i].roomX == this.currentRoom.x && this.enemies[i].roomY == this.currentRoom.y) {
    //     this.game.physics.arcade.collide(this.player, this.enemies[i].sprite);
    //     this.game.physics.arcade.collide(this.enemies[i].sprite, this.wallLayer);
    //     this.game.physics.arcade.collide(this.enemies[i].sprite, this.objectLayer);
    //   }
    // }
    // this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    // this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    var x = this.backgroundlayer.getTileX(this.game.input.activePointer.worldX);
    var y = this.backgroundlayer.getTileY(this.game.input.activePointer.worldY);
    
    if (this.game.input.mousePointer.leftButton.isDown && this.game.sound.context.state === 'suspended') {
      this.game.sound.context.resume();
    }
    //player movement
    
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      if(this.shift.isDown && this.stamina != 0) {
        this.player.animations.play('topleftrun');
        this.player.body.velocity.y = -(this.playerSpeed * 2);
        this.player.body.velocity.x = -(this.playerSpeed * 2);
      } else {
        this.player.animations.play('topleft');
        this.player.body.velocity.y = -(this.playerSpeed);
        this.player.body.velocity.x = -(this.playerSpeed);
      }

    } else if (this.cursors.up.isDown && this.cursors.right.isDown) {
      if(this.shift.isDown && this.stamina != 0) {
        this.player.animations.play('toprightrun');
        this.player.body.velocity.y = -(this.playerSpeed * 2);
        this.player.body.velocity.x = this.playerSpeed * 2;
      } else {
        this.player.animations.play('topright');
        this.player.body.velocity.y = -(this.playerSpeed);
        this.player.body.velocity.x = this.playerSpeed;
      }
    } else if (this.cursors.up.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('toprun');
          this.player.body.velocity.y = -(this.playerSpeed * 2);
          this.player.body.velocity.x = 0;
        } else {
          this.player.animations.play('top');
          this.player.body.velocity.y = -(this.playerSpeed);
          this.player.body.velocity.x = 0;
        }
    } else if (this.cursors.down.isDown && this.cursors.left.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('bottomleftrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = -(this.playerSpeed * 2);
        } else {
          this.player.animations.play('bottomleft');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = -(this.playerSpeed);
        }
    } else if (this.cursors.down.isDown && this.cursors.right.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('bottomrightrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = this.playerSpeed * 2;
        } else {
          this.player.animations.play('bottomright');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = this.playerSpeed;
        }

    } else if (this.cursors.down.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('bottomrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = 0;
        } else {
          this.player.animations.play('bottom');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = 0;
        }

    } else if (this.cursors.right.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('rightrun');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = this.playerSpeed * 2;
        } else {
          this.player.animations.play('right');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = this.playerSpeed;
        }

    } else if (this.cursors.left.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('leftrun');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = -(this.playerSpeed * 2);
        } else {
          this.player.animations.play('left');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = -(this.playerSpeed);
        }
    } else {
      this.player.animations.play('idle');
      this.player.body.velocity.y = 0;
      this.player.body.velocity.x = 0;
    }
  },
};