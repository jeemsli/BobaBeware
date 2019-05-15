var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game3 = function(){};

TopDownGame.Game3.prototype = {
  create: function() {
    // LOAD UP MAPPING FOR REALTIME DYNAMIC MAP GENERATION
    this.prevInventory = Object.assign({}, inventory.items);
    obtained = false;
    // SET UP VICTORY ITEM
    this.currentRoom = new Room(null, null, null, null, '32', 0, 0);
    this.currentDoors = [];
    this.mapList = [];
    this.tileList = [];
    this.nodeList = [];
    this.objs = [];
    this.graphics = this.game.add.graphics();
    this.proximity = false;
    // ROOMS THAT ARE CHOSEN IF YOU WENT THROUGH A DOOR IN
    // SOME DIRECTION, ex: choose a down door, go into an
    // up room.
    this.downRooms = [];
    this.upRooms = [];
    this.leftRooms = [];
    this.rightRooms = [];
    this.deadEnds = [];
    this.numRooms = 37;
    this.timeLeft = 300;
    this.rooms = [new Room(null, null, null, null, '32', 0, 0)];
    this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, stats.timeLeft);
    this.graphics.fixedToCamera = true;

    this.sgraphics = this.game.add.graphics();
    this.sgraphics.beginFill(0x000000);
    this.sgraphics.drawRect(0, 0, 800, 800);
    this.sgraphics.endFill();
    this.death = false;

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
    this.map = this.mapList[31];
    this.swapList = [];
    this.currentSwapList = [];
    this.aboveList = [];
    this.currentAboveList = [];

    // TEST
    this.music = this.game.add.audio('musicBasement');
    this.game.sound.setDecodedCallback(this.music, function() {
      this.music.loopFull(0.5);
      this.music.volume = 0.15;
    }.bind(this), this);
    this.pickup = this.game.add.audio('pickup');
    this.boba = this.game.add.audio('boba');
    this.boba.volume = 0.2;
    this.eyelash = this.game.add.audio('eyelash');
    this.eyelash.volume = 0.2;
    this.jelly = this.game.add.audio('jelly');
    this.jelly.volume = 0.2;
    this.ice = this.game.add.audio('ice');
    this.ice.volume = 0.2;
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

    //create player and UI
    this.player = this.game.add.sprite(368, 320, 'player');
    this.ladderBottom = this.game.add.sprite(384, 320, 'ladderBottom');
    this.ladderTop = this.game.add.sprite(384, 288, 'ladderTop');
    this.staminaBar = this.game.add.sprite(58, 550, 'barIn');
    this.staminaBarOut = this.game.add.sprite(60, 550, 'barOut');
    this.staminaBar.fixedToCamera = true;
    this.staminaBarOut.fixedToCamera = true;
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.enable(this.ladderBottom);
    this.ladderBottom.body.immovable = true;
    this.ladderBottom.body.moves = false;
    this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);
    this.regen = true;
    this.staminaTimer = null;
    this.projectiles = [];
    
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
    if(!FLAGS.tutorial_one) {
      // DISABLE SPAWNING MAIN FRUIT
      var c14 = new Cutscene('James', "Good luck.", 'playerPortrait', this.game, false, null);
      var c13 = new Cutscene('James', "You will die, but you might come back stronger.", 'playerPortrait', this.game, false, c14);
      var c12 = new Cutscene('James', "If you collect the special ingredient, you must return to beat the level.", 'playerPortrait', this.game, false, c13);
      var c11 = new Cutscene('James', "Returning in time is better than death. You can always retry the level.", 'playerPortrait', this.game, false, c12);
      var c10 = new Cutscene('James', "Beware of enemies who chase you down. One hit is death.", 'playerPortrait', this.game, false, c11);
      var c9 = new Cutscene('James', "All dungeons are randomly generated and vary in size.", 'playerPortrait', this.game, false, c10);
      var c8 = new Cutscene('James', "The goal of the game is to collect the special ingredient for each floor.", 'playerPortrait', this.game, false, c9);
      var c7 = new Cutscene('James', "To use an item, use the number hotkey it corresponds with.", 'playerPortrait', this.game, false, c8);
      var c6 = new Cutscene('James', "You can collect items which is indicated by your inventory on the bottom.", 'playerPortrait', this.game, false, c7);
      var c5 = new Cutscene('James', "Time left is shown underneath the minimap on the upper right corner.", 'playerPortrait', this.game, false, c6);
      var c4 = new Cutscene('James', "You must return to the ladder before time runs out. (Interact with it using space)", 'playerPortrait', this.game, false, c5);
      var c3 = new Cutscene('James', "Running uses stamina which is indicated on the lower left corner.", 'playerPortrait', this.game, false, c4);
      var c2 = new Cutscene('James', "Use the arrow keys to move. Hold shift to run.", 'playerPortrait', this.game, false, c3);
      this.rootCutscene = new Prompt('Do you require a tutorial?', [{text:'Yes', next: c2},{text:'No', next: null}], false, this.game, null);
      // CUTSCENE RENDER
      this.rootCutscene.startCutscene();
    }
    this.tt = null;

    // SET UP INVENTORY AND ITEMS
    this.items = [];

    inventory.sprite1 = this.game.add.sprite(248, 545, 'stickyBoba');
    inventory.sprite1.fixedToCamera = true;
    inventory.sprite2 = this.game.add.sprite(308, 547, 'eyelash');
    inventory.sprite2.fixedToCamera = true;
    inventory.sprite3 = this.game.add.sprite(368, 550, 'jelly');
    inventory.sprite3.fixedToCamera = true;
    inventory.sprite4 = this.game.add.sprite(428, 549, 'ice');
    inventory.sprite4.fixedToCamera = true;
    inventory.border = this.game.add.sprite(232, 545, 'border');
    inventory.border.fixedToCamera = true;
    inventory.text1 = this.game.add.text(248, 545, inventory.items.stickyBoba, {
      font: '12px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '3'
    });
    inventory.text1.fixedToCamera = true;
    inventory.text2 = this.game.add.text(308, 545, inventory.items.eyelash, {
      font: '12px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '3'
    });
    inventory.text2.fixedToCamera = true;
    inventory.text3 = this.game.add.text(368, 545, inventory.items.jelly, {
      font: '12px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '3'
    });
    inventory.text3.fixedToCamera = true;
    inventory.text4 = this.game.add.text(428, 545, inventory.items.ice, {
      font: '12px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '3'
    });
    inventory.text4.fixedToCamera = true;

    this.one = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    this.one.onDown.add(function() {
      if(inventory.items['stickyBoba'] > 0) {
        this.boba.play();
        inventory.useItem('stickyBoba');
        var spr = this.game.add.sprite(this.player.x + 16, this.player.y + 32, 'stickyBoba');
        spr.scale.x = 0.5;
        spr.scale.y = 0.5;
        this.game.physics.arcade.enable(spr);
        switch(this.direction) {
          case 'bottom':
            spr.body.velocity.y = 200;
            break;
          case 'bottomleft':
            spr.body.velocity.y = 200;
            spr.body.velocity.x = -200;
            break;
          case 'bottomright':
            spr.body.velocity.y = 200;
            spr.body.velocity.x = 200;
            break;
          case 'top':
            spr.body.velocity.y = -200;
            break;
          case 'topleft':
            spr.body.velocity.y = -200;
            spr.body.velocity.x = -200;
            break;
          case 'topright':
            spr.body.velocity.y = -200;
            spr.body.velocity.x = 200;
            break;
          case 'left':
            spr.body.velocity.x = -200;
            break;
          case 'right':
            spr.body.velocity.x = 200;
            break;
        }
        this.projectiles.push(spr);
      }
    }.bind(this));
    this.two = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    this.two.onDown.add(function() {
      if(inventory.items['eyelash'] > 0) {
        this.eyelash.play();
        inventory.useItem('eyelash');
      }
    }.bind(this));
    this.three = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);
    this.three.onDown.add(function() {
      if(inventory.items['jelly'] > 0) {
        this.jelly.play();
        inventory.useItem('jelly');
      }
    }.bind(this));
    this.four = this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR);
    this.four.onDown.add(function() {
      if(inventory.items['ice'] > 0) {
        this.ice.play();
        inventory.useItem('ice');
      }
    }.bind(this));

    // LOAD AUDIO
    //this.walkSound = this.game.add.audio('recording');

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
    this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.graphics = this.game.add.graphics();

    //GENERATE MAP
    this.lose = false;

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
    this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, stats.time);
    this.graphics.fixedToCamera = true;
    this.label1 = drawLabel1(this.label1, this.game);
    this.label2 = drawLabel2(this.label2, this.game, "Basement III");

    // TRANSITION IN
    var tweenA = this.game.add.tween(this.sgraphics).to({alpha: 0}, 4000, "Quart.easeOut", 200);
    tweenA.start();

    // GENERATE WHERE WINNING ITEM WILL SPAWN BASED ON GRID
    this.winningX = Math.random() > 0.5 ? Math.round(Math.random() * 3 + 4) : -(Math.round(Math.random() * 3 + 4));
    this.winningY = Math.random() > 0.5 ? Math.round(Math.random() * 3 + 4) : -(Math.round(Math.random() * 3 + 4));

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
                  if ((this.currentRoom.y > 6 || this.currentRoom.y < -6) || Math.random() * 10 < Math.pow(1.7, Math.abs(this.currentRoom.y))) {
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
                  if ((this.currentRoom.y > 6 || this.currentRoom.y < -6) || Math.random() * 10 < Math.pow(1.7, Math.abs(this.currentRoom.y))) {
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
                  if ((this.currentRoom.x > 6 || this.currentRoom.x < -6) || Math.random() * 10 < Math.pow(1.7, Math.abs(this.currentRoom.x))) {
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
                  if ((this.currentRoom.x > 6 || this.currentRoom.x < -6) || Math.random() * 10 < Math.pow(1.7, Math.abs(this.currentRoom.x))) {
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
            if(roomsIndex != this.rooms.length && Math.random() < 0.25 - (this.enemies.length / 50)) {
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
              
              var spawnNumber = [1,1,1,1,1,2,2,3][Math.floor(Math.random() * 8)];
              // CHOOSE TO SPAWN ENEMIES
              for(var i = 0; i < spawnNumber; i++) {
                var tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
                var enemy = this.game.add.sprite((tile.x * 32) - 16, (tile.y * 32) - 48, 'abg');
                this.game.physics.arcade.enable(enemy);
                var bot = new Enemy(enemy, 60, this.currentRoom.x, this.currentRoom.y, this.nodeList[this.mapList.indexOf(this.map)], this.tileList[this.mapList.indexOf(this.map)], this.objs[this.mapList.indexOf(this.map)], this.player, this.currentRoom, this.game);
                bot.addBehavior(BotState.IDLE, new IdleBehavior(bot));
                bot.addBehavior(BotState.ENRAGED, new EnrageBehavior(bot));
                this.enemies.push(bot);
              }
            }

            if(roomsIndex != this.rooms.length && Math.random() < 0.25 - (this.items.length / 10)) {
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

              var spawnNumber = [1,1,1,1,1,1,2,2,3][Math.floor(Math.random() * 9)];
              var tilesTaken = [];
              // CHOOSE TO SPAWN ENEMIES
              for(var i = 0; i < spawnNumber; i++) {
                var tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
                while(tilesTaken.includes(tile)) {
                  tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
                }
                tilesTaken.push(tile);
                var itemType = ['stickyBoba','eyelash','jelly', 'ice'][Math.floor(Math.random() * 4)];
                var item = this.game.add.sprite((tile.x * 32), (tile.y * 32), itemType);
                item.scale.x = 0.666;
                item.scale.y = 0.666;
                var itemObj = new Item(item,itemType,this.currentRoom.x,this.currentRoom.y);
                this.items.push(itemObj);
              }
            }

            if(this.currentRoom.x == this.winningX && this.currentRoom.y == this.winningY && roomsIndex != this.rooms.length) {
              //SPAWN VICTORY ITEM
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

              var tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
              var itemObj = new Item(this.game.add.sprite((tile.x * 32), (tile.y * 32), 'item' + FLAGS.OVERWORLD_STATE), 'boba', this.winningX, this.winningY);
              this.items.push(itemObj);
            }

            this.game.world.bringToTop(this.player);
            if(this.currentRoom.x == 0 && this.currentRoom.y == 0) {
              this.ladderBottom.body.enable = true;
              this.game.world.bringToTop(this.ladderBottom);
              this.game.world.bringToTop(this.ladderTop);
            } else {
              this.ladderBottom.body.enable = false;
            }
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
            this.game.world.bringToTop(this.staminaBar);
            this.game.world.bringToTop(this.staminaBarOut);
            var temp = this.rootCutscene;
            while(temp) {
              if(temp.active) {
                temp.bringToTop();
                break;
              }
              temp = temp.next;
            }
            this.locked = false;
            this.game.world.bringToTop(this.tt);
            this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, stats.timeLeft);
            this.graphics.fixedToCamera = true;
            this.label1 = drawLabel1(this.label1, this.game);
            this.label2 = drawLabel2(this.label2, this.game, "Basement III");
            stats.invincible = 0;

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
      for(var i = 0; i < this.items.length; i++) {
        if(this.items[i].roomX == this.currentRoom.x && this.items[i].roomY == this.currentRoom.y) {
          this.game.world.bringToTop(this.items[i].sprite);
        }
      }
      var reorder = [this.player];
      if(this.currentRoom.x == 0 && this.currentRoom.y == 0) {
        reorder.push(this.ladderTop);
      }
      for(var i = 0; i < this.enemies.length; i++) {
        if(this.enemies[i].visible) {
          reorder.push(this.enemies[i].sprite);
        }
      }
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

      this.game.world.bringToTop(this.staminaBar);
      this.game.world.bringToTop(this.staminaBarOut);
      this.game.world.bringToTop(this.graphics);
      this.game.world.bringToTop(this.label1);
      this.game.world.bringToTop(this.label2);
      this.game.world.bringToTop(this.tt);
      inventory.bringToTop(this.game);
      this.game.world.bringToTop(this.sgraphics);
      var tempC = this.rootCutscene;
      while(tempC && !tempC.active) {
        tempC = tempC.next;
      }
      if(tempC) {
        tempC.bringToTop();
      }
      
      // this.enemies.sort(enemy => enemy.sprite.y);
      // for(var i = 0; i < this.enemies.length; i++) {
      //   if(this.enemies[i].visible) {
      //     if(this.enemies[i].sprite.y < this.player.y && !this.enemies[i].swapped) {
      //       this.game.world.swap(this.player, this.enemies[i].sprite);
      //       this.enemies[i].swapped = true;
      //     } else if (this.enemies[i].sprite.y >= this.player.y && this.enemies[i].swapped) {
      //       this.game.world.swap(this.player, this.enemies[i].sprite);
      //       this.enemies[i].swapped = false;
      //     }
      //   }
      // }

      // var objList = this.objs[this.mapList.indexOf(this.map)];
      // var objSwap = this.objsSwapped[this.mapList.indexOf(this.map)];
      // for(var i = 0; i < objList.length; i++) {
      //   if(objList[i].y < this.player.y && !objSwap[i].swapped) {
      //     this.game.world.swap(this.player, objSwap[i].tile);
      //     objSwap[i].swapped = true;
      //   } else if (objList[i].y >= this.player.y && objSwap[i].swapped) {
      //     this.game.world.swap(this.player, objSwap[i].tile);
      //     objSwap[i].swapped = false;
      //   }
      // }
 
      //CHECK LADDER
      if(this.currentRoom.x == 0 && this.currentRoom.y == 0
        && this.player.x > this.ladderBottom.x - 32
        && this.player.x < this.ladderBottom.x
        && this.player.y > this.ladderBottom.y - 32
        && this.player.y < this.ladderBottom.y - 8) {
          if(!this.proximity) {
            this.rootCutscene = new Prompt("Leave this floor?", 
            [{text: "Yes", next: null, callback: function() {
              if(obtained) {
                FLAGS.OVERWORLD_STATE = 3;
                this.loadLevel('Victory');
              } else {
                this.loadLevel('Missed');
              }
            }.bind(this)}, {text: "No", next: null}]
            , false, this.game, null, this.cursors);
            this.proximity = true;
            this.rootCutscene.startCutscene();
          }
        } else {
          this.proximity = false;
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

      for(var z = 0; z < this.projectiles.length; z++) {
        if (this.projectiles[z].body.velocity.x == 0 && this.projectiles[z].body.velocity.y == 0) {
          this.projectiles[z].destroy();
          this.projectiles.splice(z, 1);
        }
      }

      Array.prototype.forEach.call(this.enemies, enemy => {
        for(var x = 0; x < this.projectiles.length; x++) {
          if(enemy.sprite.x - 16 <= this.projectiles[x].x - 16 && enemy.sprite.x + 16 >= this.projectiles[x].x - 16 && enemy.sprite.y - 16 <= this.projectiles[x].y - 48 && enemy.sprite.y + 16 >= this.projectiles[x].y - 48 && this.currentRoom.x == enemy.roomX && this.currentRoom.y == enemy.roomY) {
            this.projectiles[x].destroy();
            this.projectiles.splice(x, 1);
            enemy.speed = 20;
          }
        }
        if(enemy.sprite.x - 16 <= this.player.x && enemy.sprite.x + 16 >= this.player.x && enemy.sprite.y - 16 <= this.player.y && enemy.sprite.y + 16 >= this.player.y && this.currentRoom.x == enemy.roomX && this.currentRoom.y == enemy.roomY && !stats.invincible) {
          inventory.items = this.prevInventory;
          this.loadLevel('Gameover');
        }
      });

      Array.prototype.forEach.call(this.items, item => {
        var x = Math.floor(this.player.x / 32) + 1;
        var y = Math.floor(this.player.y / 32) + 2;
        if(x == item.tileX && y == item.tileY && this.currentRoom.x == item.roomX && this.currentRoom.y == item.roomY) {
          item.collect();
          if(inventory.getSize() < stats.size) {
            this.pickup.play();
          }
        }
      });

      //STAMINA HANDLER
      if(Math.abs(this.player.body.velocity.x) == stats.speed * 2 || Math.abs(this.player.body.velocity.y) == stats.speed * 2) {
        //PLAYER IS RUNNING
        clearTimeout(this.staminaTimer);
        this.regen = false;
        this.staminaTimer = setTimeout(function() {
          this.regen = true;
        }.bind(this), 1500);
        if(stats.stamina != 0) {
          stats.stamina--;
          if(stats.stamina == 0) {
            clearTimeout(this.staminaTimer);
            this.staminaTimer = setTimeout(function() {
              this.regen = true;
            }.bind(this), 4000);
          }
        }
      }

      if(this.regen && stats.stamina != stats.maxStamina) {
        stats.stamina++;
      }

      //Math.pow(3, -(1 - (this.stamina/1000)));
      this.staminaBar.anchor.setTo(-0.125 * (1 - (stats.stamina / stats.maxStamina)), -0.085 * (1 - (stats.stamina / stats.maxStamina)));
      this.staminaBar.scale.setTo(Math.pow(0.33, 1 - (stats.stamina / stats.maxStamina)), Math.pow(0.85, 1 - (stats.stamina / stats.maxStamina)));

      // SOUND
    }.bind(this), 5);

    // TIMER
    var mm = Math.floor(stats.timeLeft / 60);
    var sc = Math.floor(stats.timeLeft % 60).toString();
    if(sc.length == 1) {
      sc = "0" + sc;
    }
    if(this.tt) {
      this.tt.alpha = 0;
      this.tt.destroy();
    }
    this.tt = this.game.add.text(545, 150, "0" + mm + ":" + sc, {
      font: '18px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '5'
    });
    this.tt.fixedToCamera = true;
    this.timer = setInterval(function() {
      if(!paused) {
        stats.timeLeft--;
        if(stats.timeLeft <= 0) {
          inventory.items = this.prevInventory;
          this.loadLevel('Gameover');
        }
        // TIMER
        var mm = Math.floor(stats.timeLeft / 60);
        var sc = Math.floor(stats.timeLeft % 60).toString();
        if(sc.length == 1) {
          sc = "0" + sc;
        }
        this.tt.text = "0" + mm + ":" + sc;
      }
    }.bind(this), 1000);   
    this.direction = 'bottom';
  },
  loadLevel(level) {
    if(!this.death) {
      this.death = true;
      if(!FLAGS.tutorial_one) {
        paused = true;
        FLAGS.tutorial_one = 1;
        var tweenA = this.game.add.tween(this.sgraphics).to({alpha: 1}, 500, "Quart.easeOut");
        tweenA.start();
        this.rootCutscene = new Cutscene('James', "I'm getting the hell out of here!", 'playerPortrait', this.game, false, null, function() {
          inventory.unload();
          clearInterval(this.playerLoop);
          clearInterval(this.timer);
          this.music.destroy();
          Array.prototype.forEach.call(this.enemies, enemy => {
            clearInterval(enemy.interval);
          });
          paused = false;
          this.game.state.start(level, true, false);
        }.bind(this));
        setTimeout(function() {
          this.rootCutscene.startCutscene();
        }.bind(this), 750);
      } else {
        inventory.unload();
        clearInterval(this.playerLoop);
        clearInterval(this.timer);
        this.music.destroy();
        Array.prototype.forEach.call(this.enemies, enemy => {
          clearInterval(enemy.interval);
        });
        this.game.state.start(level, true, false);
      }
    }
  },
  setProximity(p) {
    this.proximity = p;
  },
  update: function() {
    //collision
    for(var i = 0; i < this.projectiles.length; i++) {
      this.game.physics.arcade.collide(this.projectiles[i], this.wallLayer);
      this.game.physics.arcade.collide(this.projectiles[i], this.objectLayer);
      for(var x = 0; x < this.enemies.length; x++) {
        this.game.physics.arcade.collide(this.projectiles[i], this.enemies[x]);
      }
    }
    this.game.physics.arcade.collide(this.player, this.wallLayer);
    this.game.physics.arcade.collide(this.player, this.objectLayer);
    this.game.physics.arcade.collide(this.player, this.ladderBottom);
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

    if(!paused) {
      if(this.cursors.up.isDown && this.cursors.left.isDown) {
        if(this.shift.isDown && stats.stamina != 0) {
          this.player.animations.play('topleftrun');
          this.player.body.velocity.y = -(stats.speed * 2);
          this.player.body.velocity.x = -(stats.speed * 2);
        } else {
          this.player.animations.play('topleft');
          this.player.body.velocity.y = -(stats.speed);
          this.player.body.velocity.x = -(stats.speed);
        }
        this.direction = 'topleft';
      } else if (this.cursors.up.isDown && this.cursors.right.isDown) {
        if(this.shift.isDown && stats.stamina != 0) {
          this.player.animations.play('toprightrun');
          this.player.body.velocity.y = -(stats.speed * 2);
          this.player.body.velocity.x = stats.speed * 2;
        } else {
          this.player.animations.play('topright');
          this.player.body.velocity.y = -(stats.speed);
          this.player.body.velocity.x = stats.speed;
        }
        this.direction = 'topright';
      } else if (this.cursors.up.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('toprun');
            this.player.body.velocity.y = -(stats.speed * 2);
            this.player.body.velocity.x = 0;
          } else {
            this.player.animations.play('top');
            this.player.body.velocity.y = -(stats.speed);
            this.player.body.velocity.x = 0;
          }
          this.direction = 'top';
      } else if (this.cursors.down.isDown && this.cursors.left.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('bottomleftrun');
            this.player.body.velocity.y = stats.speed * 2;
            this.player.body.velocity.x = -(stats.speed * 2);
          } else {
            this.player.animations.play('bottomleft');
            this.player.body.velocity.y = stats.speed;
            this.player.body.velocity.x = -(stats.speed);
          }
            this.direction = 'bottomleft';
      } else if (this.cursors.down.isDown && this.cursors.right.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('bottomrightrun');
            this.player.body.velocity.y = stats.speed * 2;
            this.player.body.velocity.x = stats.speed * 2;
          } else {
            this.player.animations.play('bottomright');
            this.player.body.velocity.y = stats.speed;
            this.player.body.velocity.x = stats.speed;
          }
          this.direction = 'bottomright';
      } else if (this.cursors.down.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('bottomrun');
            this.player.body.velocity.y = stats.speed * 2;
            this.player.body.velocity.x = 0;
          } else {
            this.player.animations.play('bottom');
            this.player.body.velocity.y = stats.speed;
            this.player.body.velocity.x = 0;
          }
          this.direction = 'bottom';
      } else if (this.cursors.right.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('rightrun');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = stats.speed * 2;
          } else {
            this.player.animations.play('right');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = stats.speed;
          }
          this.direction = 'right';
      } else if (this.cursors.left.isDown) {
          if(this.shift.isDown && stats.stamina != 0) {
            this.player.animations.play('leftrun');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = -(stats.speed * 2);
          } else {
            this.player.animations.play('left');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = -(stats.speed);
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
    } else {
      this.player.animations.stop();
      this.player.frame = 0;
    }
  },
};