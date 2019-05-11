var TopDownGame = TopDownGame || {};

class NPC {
  constructor(sprite, roomX, roomY, rootCutscene) {
    this.sprite = sprite;
    this.roomX = roomX;
    this.roomY = roomY;
    this.rootCutscene = rootCutscene;
    this.originalFrame = null;
  }

  setOriginalFrame() {
    this.sprite.frame = this.originalFrame ? this.originalFrame : this.sprite.frame;
  }

  interact(player, direction) {
    this.originalFrame = this.sprite.frame;
    var pX = Math.floor(player.x / 32);
    var pY = Math.floor(player.y / 32);
    var x = Math.floor(this.sprite.x / 32);
    var y = Math.floor(this.sprite.y / 32);
    if(x + 1 == pX && y == pY && direction == 'right') {
      this.rootCutscene.startCutscene();
      this.sprite.frame = 3;
      return this.rootCutscene;
    } else if (x - 1 == pX && y == pY && direction == 'left') {
      this.rootCutscene.startCutscene();
      this.sprite.frame = 1;
      return this.rootCutscene;
    } else if (x == pX && y + 1 == pY && direction == 'top') {
      this.rootCutscene.startCutscene();
      this.sprite.frame = 0;
      return this.rootCutscene;
    } else if (x == pX && y - 1 == pY && direction == 'bottom') {
      this.rootCutscene.startCutscene();
      this.sprite.frame = 2;
      return this.rootCutscene;
    } else {
      return null;
    }
  }
}

//title screen
TopDownGame.Overworld = function(){};

TopDownGame.Overworld.prototype = {
  create: function() {
    // LOAD UP MAPPING FOR REALTIME DYNAMIC MAP GENERATION
    this.currentRoom = new Room(null, null, null, null, 'f1', 0, 0);
    var r2 = new Room(null, null, this.currentRoom, null, 'f2', 1, 0);
    this.currentRoom.roomRight = r2;
    var r3 = new Room(null, r2, null, null, 'f3', 1, -1);
    r2.roomUp = r3;
    var r4 = new Room(r2, null, null, null, 'f4', 1, 1);
    r2.roomDown = r4;
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
    this.numRooms = 4;
    this.rooms = [this.currentRoom, r2, r3, r4];

    // SET UP ALL MAPS
    for(var i = 0; i < this.numRooms; i++) {
      var map = this.game.add.tilemap('f' + (i+1).toString());
      var newRoom = new Room(null, null, null, null, 'f' + (i+1).toString());
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
    this.map = this.mapList[0];
    this.swapList = [];
    this.currentSwapList = [];
    this.aboveList = [];
    this.currentAboveList = [];

    // TEST
    // this.music = this.game.add.audio('music');
    // this.game.sound.setDecodedCallback(this.music, function() {
    //   this.music.loopFull(0.5);
    //   this.music.volume = 0.15;
    // }.bind(this), this);
    // SET UP DOORS

    //LOAD PATHFINDING TILES AND NODES
    for(var i = 0; i < this.numRooms; i++) {
      //LOAD PATHFINDING NODES
      var nodes = [];
      var tiles = [];
      var newObjArr = [];
      var swapArr = [];
      //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
      this.mapList[i].addTilesetImage('floor1tiles', 'gameTiles');
      this.mapList[i].addTilesetImage('objects', 'objectTiles');
      this.mapList[i].addTilesetImage('overworldTiles', 'gameTiles2');
      this.mapList[i].addTilesetImage('backSpriteSheet', 'objectTiles2');
      this.mapList[i].addTilesetImage('f2objs', 'objectTiles3');
      this.mapList[i].addTilesetImage('f2tiles', 'gameTiles3');

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
      Array.prototype.forEach.call(this.mapList[i].layers[3].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.index != -1) {
            swapArr.push(tile);
          }
        });
      });
      var aboveArr = [];
      Array.prototype.forEach.call(this.mapList[i].layers[4].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.index != -1) {
            aboveArr.push(tile);
          }
        })
      });
      this.swapList.push(swapArr);
      this.aboveList.push(aboveArr);
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

    
    // CREATE NPCs
    this.npcs = [];
    var jing = new NPC(this.game.add.sprite(368, 528, 'npc1'), 0, 0, new Cutscene('Jing', 'BAPANADA', 'jingPortrait', this.game, false, null, ));
    var rachel = new NPC(this.game.add.sprite(592, 384, 'npc2'), 1, 1, new Cutscene('Rachel', 'Lorem Ipsum', 'rachelPortrait', this.game, false, null));
    jing.sprite.frame = 2;
    rachel.sprite.frame = 3;
    this.npcs.push(jing, rachel);

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('floor1tiles', 'gameTiles');
    this.map.addTilesetImage('objects', 'objectTiles');
    this.map.addTilesetImage('overworldTiles', 'gameTiles2');
    this.map.addTilesetImage('backSpriteSheet', 'objectTiles2');
    this.map.addTilesetImage('f2objs', 'objectTiles3');
    this.map.addTilesetImage('f2tiles', 'gameTiles3');

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

    //create player and UI
    this.player = this.game.add.sprite(368, 320, 'player');
    this.game.world.bringToTop(this.npcs[0].sprite);
    this.game.physics.arcade.enable(this.player);
    this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);

    for(var i = 0; i < this.npcs.length; i++) {
      this.game.physics.arcade.enable(this.npcs[i].sprite);
      this.npcs[i].sprite.body.immovable = true;
      this.npcs[i].sprite.body.moves = false;
      if(i != 0) {
        this.npcs[i].sprite.body.enable = false;
      }
    }
    
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
    
    // var c2 = new Cutscene('James', "I'm super weak.", 'playerPortrait', this.game, false, null);
    // this.rootCutscene = new Cutscene('James', "Hey, I'm actually inside our game!", 'playerPortrait', this.game, false, c2);
    // CUTSCENE RENDER
    //this.rootCutscene.startCutscene();

    // LOAD AUDIO
    this.walkSound = this.game.add.audio('recording');

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
    this.player.frame = 0;
    this.player.body.setSize(24,16,20,48);
    for(var i = 0; i < this.npcs.length; i++) {
      this.npcs[i].sprite.body.setSize(24, 16, 20, 48);
    }
    this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.graphics = this.game.add.graphics();

    //GENERATE MAP
    console.log(this.map);
    this.lose = false;

    // INTERACT
    this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.space.onDown.add(function() {
      for(var i = 0; i < this.npcs.length; i++) {
        this.npcs[i].interact(this.player);
      }
    }.bind(this));

    // DEBUG TOGGLE
    this.toggle = false;
    this.t = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.t.onDown.add(function() {
      this.toggle = !this.toggle;
      if(!this.toggle) {
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

    // DRAW INITIAL UI

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
                  if ((this.currentRoom.y > 4 || this.currentRoom.y < -4) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
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
                  if ((this.currentRoom.y > 4 || this.currentRoom.y < -4) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
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
                  if ((this.currentRoom.x > 4 || this.currentRoom.x < -4) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.x))) {
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
                  if ((this.currentRoom.x > 4 || this.currentRoom.x < -4) || Math.random(0, 10) > Math.pow(1.7, Math.abs(this.currentRoom.x))) {
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
          this.map = this.mapList[parseInt(this.currentRoom.tileMap[1]) - 1];
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
            this.map.addTilesetImage('overworldTiles', 'gameTiles2');
            this.map.addTilesetImage('backSpriteSheet', 'objectTiles2');
            this.map.addTilesetImage('f2objs', 'objectTiles3');
            this.map.addTilesetImage('f2tiles', 'gameTiles3');

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

            for(var i = 0; i < this.npcs.length; i++) {
              if(this.npcs[i].roomX == this.currentRoom.x && this.npcs[i].roomY == this.currentRoom.y) {
                this.npcs[i].sprite.body.enable = true;
                this.game.world.bringToTop(this.npcs[i].sprite);
              } else {
                this.npcs[i].sprite.body.enable = false;
              }
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
            //this.game.world.bringToTop(this.aboveObjectLayer);
            //this.game.world.bringToTop(this.aboveLayer);
            var temp = this.rootCutscene;
            while(temp) {
              if(temp.active) {
                temp.bringToTop();
                break;
              }
              temp = temp.next;
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

      // REORDER PLAYER, ENEMIES, AND ABOVEOBJECT TILES BASED ON Y VALUES
      var reorder = [this.player];
      for(var i = 0; i < this.enemies.length; i++) {
        if(this.enemies[i].visible) {
          reorder.push(this.enemies[i].sprite);
        }
      }
      for(var i = 0; i < this.npcs.length; i++) {
        if(this.currentRoom.x == this.npcs[i].roomX && this.currentRoom.y == this.npcs[i].roomY) {
          reorder.push(this.npcs[i].sprite);
        }
      }
      if(true) {
        var newSwapList = [];
        for(var i = 0; i < this.currentSwapList.length; i++) {
          this.currentSwapList[i].destroy();
        }
        var newAboveList = [];
        for(var i = 0; i < this.currentAboveList.length; i++) {
          this.currentAboveList[i].destroy();
        }
        this.currentSwapList = [];
        this.currentAboveList = [];
        this.map.layers = this.map.layers.slice(0,5);
        var prevIndex = 0;
        for(var i = 0; i < this.swapList[this.mapList.indexOf(this.map)].length; i++) {
          prevIndex = i;
          newSwapList.push(this.map.createBlankLayer(i.toString(), 25, 25, 32, 32));
          var tileToPlace = this.swapList[this.mapList.indexOf(this.map)][i];
          this.map.putTile(tileToPlace, tileToPlace.x, tileToPlace.y, newSwapList[i]);
          reorder.push({y: (this.swapList[this.mapList.indexOf(this.map)][i].y * 32), layer: newSwapList[i]});
        }
        for(var i = 0; i < this.aboveList[this.mapList.indexOf(this.map)].length; i++) {
          newAboveList.push(this.map.createBlankLayer((i + prevIndex + 1).toString(), 25, 25, 32, 32));
          var tileToPlace = this.aboveList[this.mapList.indexOf(this.map)][i];
          this.map.putTile(tileToPlace, tileToPlace.x, tileToPlace.y, newAboveList[i]);
          reorder.push({y: (this.aboveList[this.mapList.indexOf(this.map)][i].y * 32), layer: newAboveList[i]});
        }
        this.currentAboveList = newAboveList;
        this.currentSwapList = newSwapList;
      }

      reorder.sort(function(a, b) {
        return (a.y - b.y);
      });
      for(var i = 0; i < reorder.length; i++) {
        if(reorder[i].layer) {
          this.game.world.bringToTop(reorder[i].layer);
        } else {
          this.game.world.bringToTop(reorder[i]);
        }
      }
      this.game.world.bringToTop(this.aboveObjectLayer);
      this.game.world.bringToTop(this.aboveLayer);
      var tempC = this.rootCutscene;
      while(tempC && !tempC.active) {
        tempC = tempC.next;
      }
      if(tempC) {
        tempC.bringToTop();
      }
    }.bind(this), 5);   
  },
  loadLevel(level) {
    clearInterval(this.playerLoop);
    clearInterval(this.timer);
    this.music.destroy();
    Array.prototype.forEach.call(this.enemies, enemy => {
      clearInterval(enemy.interval);
    });
    this.game.state.start(level, true, false);
    this.direction = 'bottom';
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.wallLayer);
    this.game.physics.arcade.collide(this.player, this.objectLayer);
    for(var i = 0; i < this.npcs.length; i++) {
      this.game.physics.arcade.collide(this.player, this.npcs[i].sprite);
    }
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
      if(this.shift.isDown) {
        this.player.animations.play('topleftrun');
        this.player.body.velocity.y = -(this.playerSpeed * 2);
        this.player.body.velocity.x = -(this.playerSpeed * 2);
      } else {
        this.player.animations.play('topleft');
        this.player.body.velocity.y = -(this.playerSpeed);
        this.player.body.velocity.x = -(this.playerSpeed);
      }
      this.direction = 'topleft';
    } else if (this.cursors.up.isDown && this.cursors.right.isDown) {
      if(this.shift.isDown) {
        this.player.animations.play('toprightrun');
        this.player.body.velocity.y = -(this.playerSpeed * 2);
        this.player.body.velocity.x = this.playerSpeed * 2;
      } else {
        this.player.animations.play('topright');
        this.player.body.velocity.y = -(this.playerSpeed);
        this.player.body.velocity.x = this.playerSpeed;
      }
      this.direction = 'topright';
    } else if (this.cursors.up.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('toprun');
          this.player.body.velocity.y = -(this.playerSpeed * 2);
          this.player.body.velocity.x = 0;
        } else {
          this.player.animations.play('top');
          this.player.body.velocity.y = -(this.playerSpeed);
          this.player.body.velocity.x = 0;
        }
        this.direction = 'top'
    } else if (this.cursors.down.isDown && this.cursors.left.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('bottomleftrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = -(this.playerSpeed * 2);
        } else {
          this.player.animations.play('bottomleft');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = -(this.playerSpeed);
        }
        this.direction = 'bottomleft';
    } else if (this.cursors.down.isDown && this.cursors.right.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('bottomrightrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = this.playerSpeed * 2;
        } else {
          this.player.animations.play('bottomright');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = this.playerSpeed;
        }
        this.direction = 'bottomright';
    } else if (this.cursors.down.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('bottomrun');
          this.player.body.velocity.y = this.playerSpeed * 2;
          this.player.body.velocity.x = 0;
        } else {
          this.player.animations.play('bottom');
          this.player.body.velocity.y = this.playerSpeed;
          this.player.body.velocity.x = 0;
        }
        this.direction = 'bottom';
    } else if (this.cursors.right.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('rightrun');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = this.playerSpeed * 2;
        } else {
          this.player.animations.play('right');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = this.playerSpeed;
        }
        this.direction = 'right';
    } else if (this.cursors.left.isDown) {
        if(this.shift.isDown) {
          this.player.animations.play('leftrun');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = -(this.playerSpeed * 2);
        } else {
          this.player.animations.play('left');
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x = -(this.playerSpeed);
        }
        this.direction = 'left';
    } else {
      switch(this.direction) {
        case 'bottom':
          this.player.frame = 0;
          break;
        case 'bottomleft':
          this.player.frame = 16;
          break;
        case 'bottomright':
          this.player.frame = 64;
          break;
        case 'top':
          this.player.frame = 40;
          break;
        case 'topleft':
          this.player.frame = 32;
          break;
        case 'topright':
          this.player.frame = 48;
          break;
        case 'left':
          this.player.frame = 24;
          break;
        case 'right':
          this.player.frame = 56;
          break;
      }
      this.player.body.velocity.y = 0;
      this.player.body.velocity.x = 0;
    }
  },
};