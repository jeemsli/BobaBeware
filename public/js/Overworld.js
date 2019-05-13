var TopDownGame = TopDownGame || {};

let FLAGS = {
  //PLAYER INTRODUCTIONS
  flag_one: 0,
  flag_two: 0,
  flag_three: 0,
  //FINISHED INTRODUCTIONS
  flag_four: 0,
  flag_five: 0,
  tutorial_one: 0,
  OVERWORLD_STATE: 0
  //TUTORIAL ONE, Player cannot get the fruit on the first go
  
};

class NPC {
  constructor(sprite, roomX, roomY, rootCutscene, reset) {
    this.sprite = sprite;
    this.roomX = roomX;
    this.roomY = roomY;
    this.rootCutscene = rootCutscene;
    this.originalFrame = null;
    this.reset = reset;
    this.interactFrame = null;
  }

  setOriginalFrame() {
    this.sprite.frame = this.originalFrame ? this.originalFrame : this.sprite.frame;
    this.reset();
  }

  interact(player, direction) {
    if(!paused) {
      this.originalFrame = this.sprite.frame;
      var pX = Math.floor(player.x / 32);
      var pY = Math.floor(player.y / 32);
      var x = Math.floor(this.sprite.x / 32);
      var y = Math.floor(this.sprite.y / 32);
      if(x + 1 == pX && y == pY && direction == 'left') {
        this.sprite.frame = 1;
        this.interactFrame = 1;
        this.rootCutscene.startCutscene();
        return this.rootCutscene;
      } else if (x - 1 == pX && y == pY && direction == 'right') {
        this.sprite.frame = 3;
        this.interactFrame = 3;
        this.rootCutscene.startCutscene();
        return this.rootCutscene;
      } else if (x == pX && y + 1 == pY && direction == 'top') {
        this.sprite.frame = 0;
        this.interactFrame = 0;
        this.rootCutscene.startCutscene();
        return this.rootCutscene;
      } else if (x == pX && y - 1 == pY && direction == 'bottom') {
        this.sprite.frame = 2;
        this.interactFrame = 2;
        this.rootCutscene.startCutscene();
        return this.rootCutscene;
      } else {
        return null;
      }
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
    var r5 = new Room(null, null, r2, null, 'f5', 2, 0);
    r2.roomRight = r5;
    if(FLAGS.tutorial_one == 1) {
      this.currentRoom = r5;
    }
    this.currentDoors = [];
    this.mapList = [];
    this.tileList = [];
    this.nodeList = [];
    this.objs = [];
    this.graphics = this.game.add.graphics();
    this.graphics.beginFill(0x000000);
    this.graphics.drawRect(0, 0, 800, 800);
    this.graphics.endFill();
    // ROOMS THAT ARE CHOSEN IF YOU WENT THROUGH A DOOR IN
    // SOME DIRECTION, ex: choose a down door, go into an
    // up room.
    this.downRooms = [];
    this.upRooms = [];
    this.leftRooms = [];
    this.rightRooms = [];
    this.deadEnds = [];
    this.numRooms = 5;
    this.rooms = [this.currentRoom, r2, r3, r4, r5];

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
    if(FLAGS.tutorial_one == 1) {
      this.map = this.mapList[4];
    }
    this.swapList = [];
    this.currentSwapList = [];
    this.aboveList = [];
    this.currentAboveList = [];

    // TEST
    this.music = this.game.add.audio('music');
    this.game.sound.setDecodedCallback(this.music, function() {
      this.music.loopFull(0.5);
      this.music.volume = 0.2;
    }.bind(this), this);
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
      this.mapList[i].addTilesetImage('mainSpriteSheet', 'gameTiles4');

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

    this.proximity2 = [false, false, false, false, false, false];
    this.barrel = this.game.add.sprite(672, 576, 'barrel');
    this.game.physics.arcade.enable(this.barrel);
    this.barrel.body.immovable = true;
    this.barrel.body.moves = false;
    this.hatches = [];
    for(var i = 0; i < 6; i++) {
      if(i <= FLAGS.OVERWORLD_STATE) {
        this.hatches.push(this.game.add.sprite(224 + (i * 96), 256, 'openShaft'));
      } else {
        this.hatches.push(this.game.add.sprite(224 + (i * 96), 256, 'closedShaft'));
      }
    }
    
    // CREATE NPCs
    this.npcs = [];
    this.areaText = null;
    if(!FLAGS.tutorial_one) {
      var jcs8 = new Cutscene('James', "Sure thing! I'll see you after I introduce myself to everyone.", 'playerPortrait', this.game, false, null);
      var jcs7 = new Cutscene('Jing', "Let's see... Well we aren't that busy, so feel free to introduce yourself to the others.", 'jingPortrait', this.game, false, jcs8);
      var jcs6 = new Cutscene('James', 'Awesome! What should I do first?', 'playerPortrait', this.game, false, jcs7);
      var jcs5 = new Cutscene('Jing', 'Great! Starting today you will be working with me at the front.', 'jingPortrait', this.game, false, jcs6);
      var jcs4 = new Cutscene('Jing', 'Ok you die now.', 'jingPortrait', this.game, false, null, function() {
        this.loadLevel('Gameover');
      }.bind(this));
      var jcs3 = new Prompt('Arrow keys to select, space to confirm.', [{text: 'Who\'s James?', next: jcs4},{text: 'That\'s me!', next: jcs5}], false, this.game, null);
      var jcs2 = new Cutscene('Jing', 'Yup! By any chance are you James, our new hire?', 'jingPortrait', this.game, false, jcs3);
      var jcs1 = new Cutscene('James', 'By any chance, are you Ms. Li?', 'playerPortrait', this.game, false, jcs2);
      var jcs_root = new Cutscene('Jing', "Hi! Welcome to Mckenna's Tea House. May I ask what you are ordering today sir?", 'jingPortrait', this.game, false, jcs1);
      var jing = new NPC(this.game.add.sprite(240, 524, 'npc1'), 0, 0, jcs_root, null);
      jing.reset = function() {
        jing.rootCutscene = new Cutscene('Jing', 'The others are in the back. Say hi to them for me will you!','jingPortrait',this.game, false, null, jing.setOriginalFrame.bind(jing));
      }.bind(this);
      var rcs8 = new Cutscene('Rachel', "Well anyways~ The crowds out there can get a bit rowdy so feel free to ask me for help.", 'rachelPortrait', this.game, false, null);
      var rcs7 = new Cutscene('Rachel', "Ok...", 'rachelPortrait', this.game, false, rcs8);
      var rcs6 = new Cutscene('Rachel', "I think you and I will get along perfectly.", 'rachelPortrait', this.game, false, rcs8);
      var rcs5 = new Cutscene('Rachel', "Disgusti... I mean to each his own I suppose~", 'rachelPortrait', this.game, false, rcs8);
      var rcs4 = new Prompt('ABGs huh...', [{text:'I <3 ABGs.', next: rcs5}, {text:'Ew no.', next:rcs6},{text:'YEET', next:rcs7}], false, this.game, null);
      var rcs3 = new Cutscene('Rachel', 'By the way~ What do you think of ABGs?', 'rachelPortrait', this.game, false, rcs4);
      var rcs2 = new Cutscene('Rachel', "The name's Rachel~ I'm usually managing stock but I've got cleaning duty today.", 'rachelPortrait', this.game, false, rcs3);
      var rcs1 = new Cutscene('James', "Hi. And you are?", 'playerPortrait', this.game, false, rcs2);
      var rcs_root = new Cutscene('Rachel', 'Hey there~ You must be James.', 'rachelPortrait', this.game, false, rcs1);
      var rachel = new NPC(this.game.add.sprite(592, 384, 'npc2'), 1, 1, rcs_root, null);
      rachel.reset = function() {
        rachel.rootCutscene = new Cutscene('Rachel', "Sorry I'm busy right now~ We can talk later~", 'rachelPortrait', this.game, false, null, rachel.setOriginalFrame.bind(rachel));
      }.bind(this);
      var racs9 = new Cutscene('Ralph', "Anyways, if you need me to talk to Jing you let me know first alright.", 'ralphPortrait', this.game, false, null);
      var racs8 = new Cutscene('Ralph', "Listen... just don't do anything stupid and we're good, okay?", 'ralphPortrait', this.game, false, racs9);
      var racs7 = new Cutscene('Ralph', "Don't do what I say, and...", 'ralphPortrait', this.game, false, racs8);
      var racs6 = new Cutscene('Ralph', "Do what I say, and I'll put in a good word for you.", 'ralphPortrait', this.game, false, racs7);
      var racs5 = new Cutscene('Ralph', "Now listen here, I'm the boss around these parts.", 'ralphPortrait', this.game, false, racs6);
      var racs4 = new Cutscene('Ralph', "Yea I'll just ignore what you said.", 'ralphPortrait', this.game, false, racs5, function(){nick.sprite.frame = 1; ralph.sprite.frame = ralph.interactFrame}.bind(this));
      var racs3 = new Cutscene('Nick', "Come on man, go easy on the little guy.", 'nickPortrait', this.game, false, racs4, function(){ralph.sprite.frame = 1;}.bind(this));
      var racs2 = new Cutscene('Ralph', "Now introductions aside, I want you to know about a few things here.", 'ralphPortrait', this.game, false, racs3, function(){nick.sprite.frame = 3}.bind(this));
      var racs1 = new Cutscene('Ralph', "As the most senior employee, I manage the others with the exception of the owner Ms. Li.", 'ralphPortrait', this.game, false, racs2);
      var racs_root = new Cutscene('Ralph', "The name's Ralph, but Jing probably told you about me.", 'ralphPortrait', this.game, false, racs1);
      var ralph = new NPC(this.game.add.sprite(496, 280, 'npc4'), 1, -1, racs_root, null);
      ralph.reset = function() {
        ralph.rootCutscene = new Cutscene('Ralph', "Listen, don't get in my way. I'm trying to impress Jing.", 'ralphPortrait', this.game, false, null, ralph.setOriginalFrame.bind(ralph));
      }.bind(this);
      var ncs12 = new Cutscene('Nick', "Now then, if you need anything from the stock, come see me. Just don't tell Rachel.", 'nickPortrait', this.game, false, null);
      var ncs11 = new Cutscene('Nick', "Yikes.", 'nickPortrait', this.game, false, ncs12);
      var ncs10 = new Cutscene('Nick', "Now that's what I like to hear!", 'nickPortrait', this.game, false, ncs12);
      var ncs9 = new Prompt("I'd say...", [{text:"I can't get enough!", next:ncs10},{text:'I go to Starbucks.',next:ncs11}], false, this.game, null);
      var ncs8 = new Cutscene('Nick', "Got a question for you, how much do you like bubble tea?", 'nickPortrait', this.game, false, ncs9);
      var ncs7 = new Cutscene('Nick', 'Alright then. Nice to meet you too Jay.', 'nickPortrait', this.game, false, ncs8);
      var ncs6 = new Cutscene('James', 'Nice to meet you. Feel free to call me James, or Jay.', 'playerPortrait', this.game, false, ncs7);
      var ncs5 = new Cutscene('Nick', "Sorry man, that was my bad. As you might've heard the name's Nick.", 'nickPortrait', this.game, false, ncs6);
      var ncs4 = new Cutscene('James', "Nah man, it's fine. My nickname used to be Jay in highschool so I'm used to it.", 'playerPortrait', this.game, false, ncs5, function(){ralph.sprite.frame = 2}.bind(this));
      var ncs3 = new Cutscene('Ralph', "Excuse my friend Nick, he doesn't go out much.", 'ralphPortrait', this.game, false, ncs4);
      var ncs2 = new Cutscene('Ralph', 'You idiot.', 'ralphPortrait', this.game, false, ncs3, function(){ralph.sprite.frame = nick.interactFrame}.bind(this));
      var ncs1 = new Cutscene('Ralph', "The guy's name is James.", 'ralphPortrait', this.game, false, ncs2);
      var ncs_root = new Cutscene('Nick', "Hey, you must be Jay!", 'nickPortrait', this.game, false, ncs1, function(){ralph.sprite.frame = 1}.bind(this));
      var nick = new NPC(this.game.add.sprite(528, 280, 'npc3'), 1, -1, ncs_root, null);
      nick.reset = function() {
        nick.rootCutscene = new Cutscene('Nick', "If Jing asks, I wasn't slacking off.", "nickPortrait", this.game, false, null, nick.setOriginalFrame.bind(nick));
      }.bind(this);
      var csl3 = new Cutscene('Jing', "I've kept the stock room blocked off, so meet me there.", 'jingPortrait', this.game, false, null);
      var csl2 = new Cutscene('Jing', "There's a very important ingredient that we need from stock before rush hour.", 'jingPortrait', this.game, false, csl3);
      var csl1 = new Cutscene('Jing', "Great! Now that we're all acquainted, I want you to fetch something for me.", 'jingPortrait', this.game, false, csl2);
      var csl_root = new Cutscene('James', "Hi! I've introduced myself to the others.", 'playerPortrait', this.game, false, csl1);
      var unlock_root = new Cutscene('Jing', "Here, I'll move this out of the way.", 'jingPortrait', this.game, false, null);

      // INTRO SETUP
      jing.sprite.frame = 2;
      rachel.sprite.frame = 3;
      ralph.sprite.frame = 2;
      nick.sprite.frame = 1;
      jcs8.callback = function() {
        jing.setOriginalFrame(); 
        var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
        var tweenB = this.game.add.tween(this.graphics).to({alpha: 0}, 1000, "Quart.easeOut");
        tweenA.chain(tweenB);
        tweenA.start();
        setTimeout(function() {
          jing.sprite.x = 368;
        }.bind(this), 1000);
      }.bind(this);
      csl3.callback = function() {
        jing.sprite.frame = 1;
        var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
        var tweenB = this.game.add.tween(this.graphics).to({alpha: 0}, 1000, "Quart.easeOut");
        tweenA.chain(tweenB);
        tweenA.start();
        setTimeout(function() {
          jing.roomX = 1;
          jing.sprite.x = 624;
          jing.sprite.y = 538;
          jing.sprite.visible = false;
          jing.rootCutscene = unlock_root;
        }.bind(this), 1000);
      }.bind(this);
      unlock_root.callback = function() {
        var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
        var tweenB = this.game.add.tween(this.graphics).to({alpha: 0}, 1000, "Quart.easeOut");
        
        jing.reset = function() {
          jing.rootCutscene = new Cutscene('Jing', "We're counting on you.", 'jingPortrait', this.game, false, null, jing.setOriginalFrame.bind(jing));
        }.bind(this);
        jing.setOriginalFrame();
        tweenA.chain(tweenB);
        tweenA.start();
        setTimeout(function() {
          jing.sprite.x = 624;
          jing.sprite.y = 506;
          jing.sprite.frame = 0;
          FLAGS.flag_four = 1;
          this.barrel.destroy();
        }.bind(this), 1000);
      }.bind(this);
      rcs8.callback = function() {
        rachel.setOriginalFrame();
        FLAGS.flag_one = 1;
        if(FLAGS.flag_two && FLAGS.flag_three) {
          jing.rootCutscene = csl_root;
        }
      }.bind(this);
      racs9.callback = function() {
        ralph.setOriginalFrame();
        FLAGS.flag_two = 1;
        if(FLAGS.flag_one && FLAGS.flag_three) {
          jing.rootCutscene = csl_root;
        }
      }.bind(this);
      ncs12.callback = function() {
        nick.setOriginalFrame();
        FLAGS.flag_three = 1;
        if(FLAGS.flag_two && FLAGS.flag_one) {
          jing.rootCutscene = csl_root;
        }
      }.bind(this);
      this.npcs.push(jing, rachel, nick, ralph);
    } else if (FLAGS.tutorial_one == 1){
      this.barrel.destroy();
      var j13 = new Cutscene('Jing', "Get some sleep, you'll need it for tomorrow...", 'jingPortrait', this.game, false, null, function() {
        paused = true;
        FLAGS.tutorial_one = 2;
        var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
        tweenA.start();
        setTimeout(function() {
          paused = false;
          this.loadLevel('Overworld');
        }.bind(this), 2500);
      }.bind(this));
      var j12 = new Cutscene('Jing', "Sure, but you're not leaving here alive.", 'jingPortrait', this.game, false, null, function() {
        this.loadLevel('Gameover');
      }.bind(this));
      var j11 = new Prompt('Should I tell anyone?', [
        {text:"I'm calling the police, you're crazy!",next:j12, callback: function() {
          this.music.stop();
        }.bind(this)},
        {text:"I won't tell a soul.",next:j13}
      ], false, this.game, null);
      var j10 = new Cutscene('Jing', "And whatever you do. DO NOT TELL ANYONE ABOUT THIS.", 'jingPortrait', this.game,false,j11);
      var j9 = new Cutscene('Jing', "Come back tomorrow, we'll explain everything.", 'jingPortrait', this.game,false, j10);
      var j8 = new Cutscene('Jing', "I'm sure you have many questions, but in the mean time you should get some rest.", 'jingPortrait', this.game, false, j9);
      var j7 = new Cutscene('Nick', "I knew I saw something in you kid.", 'nickPortrait', this.game, false, j8);
      var j6 = new Cutscene('Ralph', "This has gotta be a fluke. A newbie like him survived?", 'ralphPortrait', this.game, false, j7);
      var j5 = new Cutscene('Jing', "You're the first to come back alive for the past 3 decades...", 'jingPortrait', this.game, false, j6);
      var j4 = new Cutscene('Jing', "Sure, but you cannot leave here alive.", 'jingPortrait', this.game, false, null, function(){this.loadLevel('Gameover')}.bind(this));
      var j3 = new Cutscene('Jing', "We've sent countless of new hires to the Basement.", 'jingPortrait', this.game, false, j5);
      var j2 = new Prompt('What the hell is going on...', [
        {text:'Explain everything, now.', next: j3},
        {text:"I quit.", next: j4, callback: function(){this.music.stop()}.bind(this)}
        ], false, this.game, null);
      var j1 = new Cutscene('Jing', "You're the first to make it back in years...", 'jingPortrait', this.game, false, j2);
      var jing = new NPC(this.game.add.sprite(208, 344, 'npc1'), 2, 0, j1, null);
      this.rootCutscene = jing.rootCutscene;
      this.rootCutscene.startCutscene();
      var rachel = new NPC(this.game.add.sprite(592, 384, 'npc2'), 1, 1, null, null);
      var ralph = new NPC(this.game.add.sprite(176, 344, 'npc4'), 2, 0, null, null);
      var nick = new NPC(this.game.add.sprite(240, 344, 'npc3'), 2, 0, null, null);

      // INTRO SETUP
      jing.sprite.frame = 2;
      rachel.sprite.frame = 2;
      ralph.sprite.frame = 2;
      nick.sprite.frame = 2;
      this.npcs.push(jing, rachel, nick, ralph);
    } else if (FLAGS.tutorial_one == 2) {
      // START ACTUAL GAME
      var j14 = new Cutscene('Jing', "If you have any other questions, please ask us.", 'jingPortrait', this.game, false, null, function() {
        var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
        var tweenB = this.game.add.tween(this.graphics).to({alpha: 0}, 1000, "Quart.easeOut");
        tweenA.chain(tweenB);
        tweenA.start();
        setTimeout(function() {
          jing.setOriginalFrame();
          nick.roomX = 1;
          nick.roomY = 1;
          nick.sprite.x = 528;
          nick.sprite.y = 408;
          nick.sprite.frame = 1;
          ralph.sprite.x = 304;
          ralph.sprite.y = 524;
          jing.sprite.x = 240;
          jing.sprite.y = 524;
          rachel.roomX = 1;
          rachel.roomY = -1;
          rachel.sprite.x = 496;
          rachel.sprite.y = 312;
          rachel.sprite.frame = 0;
          FLAGS.tutorial_one = 3;
        }.bind(this), 1000);
      }.bind(this));
      var j13 = new Cutscene('Jing', "I know this is a lot to take in, but we should get back to work.", 'jingPortrait', this.game, false, j14);
      var j12 = new Cutscene('Rachel', "However, the curse prevents us from aging or dying in the dungeon.", 'rachelPortrait', this.game, false, j13);
      var j11 = new Cutscene('Rachel', "There's only one way out. Lifting the curse or death.", 'rachelPortrait', this.game, false, j12);
      var j10 = new Cutscene('Rachel', "We are forced to enter the dungeon at least once a day or else we die.", 'rachelPortrait', this.game, false, j11);
      var j9 = new Cutscene('James', "What's stopping us from leaving in the first place?", 'playerPortrait', this.game, false, j10);
      var j8 = new Cutscene('Jing', "We'll all be free to leave.", 'jingPortrait', this.game,false, j9);
      var j7 = new Cutscene('Jing', "If we collect all the special boba ingredients located in the dungeons.", 'jingPortrait', this.game, false, j8);
      var j6 = new Cutscene('Rachel', "As far as we know, the curse can be lifted.", 'rachelPortrait', this.game, false, j7);
      var j5 = new Cutscene('Ralph', "Watch what you say. We're all cursed so it's better if we work together.", 'ralphPortrait', this.game, false, j6);
      var j4 = new Cutscene('James', "So you tricked me?!", 'playerPortrait', this.game, false, j5);
      var j3 = new Cutscene('Jing', "We're not sure, but once you step inside you are cursed for eternity.", 'jingPortrait', this.game, false, j4);
      var j2 = new Cutscene('James', "Funny. What in the hell was down there?", 'playerPortrait', this.game, false, j3);
      var j1 = new Cutscene('Nick', "Sleep well Jay?", 'nickPortrait', this.game, false, j2);
      var jing = new NPC(this.game.add.sprite(400, 336, 'npc1'), 0, 0, j1, function() {
        var jj10 = new Cutscene('Jing', "All we can do is try our hardest to survive until the promised day.", 'jingPortrait', this.game, false, null);
        var jj9 = new Cutscene('James', "That doesn't sound reassuring.", 'playerPortrait', this.game, false, jj10);
        var jj8 = new Cutscene('Jing', "Unfortunately, no one that I know has been freed from this curse.", 'jingPortrait', this.game, false, jj9);
        var jj7 = new Cutscene('Jing', "Rachel has been here before I was. She never talks about her past.", 'jingPortrait', this.game, false, jj8);
        var jj6 = new Cutscene('Jing', "As far as I know, Nick and Ralph have been here for at least 30.", 'jingPortrait', this.game, false, jj7);
        var jj5 = new Cutscene('James', "That long? What about everyone else?", 'playerPortrait', this.game, false, jj6);
        var jj4 = new Cutscene('Jing', "I'm not exactly sure. 60 years, 70?", 'jingPortrait', this.game, false, jj5);
        var jj3 = new Cutscene('James', "How long have you been here for?", 'playerPortrait', this.game, false, jj4);
        var jj2 = null; //UPGRADE TIMER
        var jj1 = new Prompt('What should I ask her?', [
          {text: "Upgrade Timer", next: jj2},
          {text: "Talk", next: jj3},
          {text: 'Cancel', next: null}
        ])
        jing.rootCutscene = new Cutscene('Jing', "How goes the hunt for the ultimate boba ingredient?", 'jingPortrait', this.game, false, jj1);
      }.bind(this));
      this.rootCutscene = jing.rootCutscene;
      this.rootCutscene.startCutscene();
      var rachel = new NPC(this.game.add.sprite(432, 336, 'npc2'), 0, 0, null, null);
      var ralph = new NPC(this.game.add.sprite(432, 304, 'npc3'), 0, 0, null, null);
      var nick = new NPC(this.game.add.sprite(432, 368, 'npc4'), 0, 0, null, null);
      rachel.sprite.frame = 3;
      nick.sprite.frame = 3;
      ralph.sprite.frame = 3;
      jing.sprite.frame = 3;
      // var boba = new NPC()
      // var npc1 = new NPC()
      // var npc2 = new NPC()
      // var npc3 = new NPC()
      // var npc4 = new NPC()
      // var npc5 = new NPC()
      // var npc6 = new NPC()
      this.npcs.push(jing, rachel, ralph, nick);
    }
    this.barrel.destroy();

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('floor1tiles', 'gameTiles');
    this.map.addTilesetImage('objects', 'objectTiles');
    this.map.addTilesetImage('overworldTiles', 'gameTiles2');
    this.map.addTilesetImage('backSpriteSheet', 'objectTiles2');
    this.map.addTilesetImage('f2objs', 'objectTiles3');
    this.map.addTilesetImage('f2tiles', 'gameTiles3');
    this.map.addTilesetImage('mainSpriteSheet', 'gameTiles4');

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
    if(FLAGS.tutorial_one == 1) {
      this.player.x = 208;
      this.player.y = 276;
    } else if (FLAGS.tutorial_one == 2) {
      this.player.x = 336;
      this.player.y = 336;
    }
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

    //GENERATE MAP
    console.log(this.map);
    this.lose = false;

    // INTERACT
    this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.space.onDown.add(function() {
      for(var i = 0; i < this.npcs.length; i++) {
        var cs = this.npcs[i].interact(this.player, this.direction);
        if(cs) {
          this.player.animations.stop();
          this.rootCutscene = cs;
          break;
        }
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

    // TRANSITION IN
    var tweenA = this.game.add.tween(this.graphics).to({alpha: 0}, 4000, "Quart.easeOut", 200);
    tweenA.start();

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
            this.map.addTilesetImage('mainSpriteSheet', 'gameTiles4');

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
                this.npcs[i].sprite.visible = true;
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

            if(this.barrel.alive) {
              if(this.currentRoom.x == 1 && this.currentRoom.y == 0) {
                this.barrel.body.enable = true;
                this.game.world.bringToTop(this.barrel);
              } else {
                this.barrel.body.enable = false;
              }
            }
            if(this.currentRoom.x == 2 && this.currentRoom.y == 0) {
              for(var i = 0; i < this.hatches.length; i++) {
                this.game.world.bringToTop(this.hatches[i]);
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

      // HATCH ENTER
      if(this.currentRoom.x == 2 && this.currentRoom.y == 0 && !paused) {
        for(var i = 0; i < FLAGS.OVERWORLD_STATE + 1; i++) {
          var hx = Math.floor(this.hatches[i].x / 32);
          var hy = Math.floor(this.hatches[i].y / 32);
          var px = Math.floor(this.player.x / 32) + 1;
          var py = Math.floor(this.player.y / 32) + 2;
          if(hx == px && hy == py) {
            if(!this.proximity2[i]) {
              this.rootCutscene = new Prompt('Do you want to head to Basement I?', [{text:'Yes', next: null, callback: function() {
                paused = true;
                this.music.stop();
                var tweenA = this.game.add.tween(this.graphics).to({alpha: 1}, 1000, "Quart.easeOut");
                this.areaText = this.game.add.text(160, 300, "BASEMENT I", {
                  font: '50px ZCOOLKuaiLe',
                  fill: '#000000',
                  fontWeight: 'bold',
                });
                this.areaText.alpha = 0;
                var grd = this.areaText.context.createLinearGradient(0, 0, 0, this.areaText.height);
                //  Add in 2 color stops
                grd.addColorStop(0, '#601f2e');   
                grd.addColorStop(1, '#b20029');
                //  And apply to the Text
                this.areaText.fill = grd;
                this.areaText.fixedToCamera = true;
                var tweenB = this.game.add.tween(this.areaText).to({alpha: 1}, 1000, "Quart.easeOut");
                tweenA.chain(tweenB);
                tweenA.start();
                setTimeout(function() {
                  paused = false;
                  this.loadLevel('Game');
                }.bind(this), 4000);
              }.bind(this)}, {text: 'No', next: null}], false, this.game, null);
              this.proximity2[i] = true;
              this.rootCutscene.startCutscene();
            }
          } else {
            this.proximity2[i] = false;
          }
        }
      }

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
      if(this.currentRoom.tileMap != 'f1') {
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
      this.game.world.bringToTop(this.graphics);
      if(this.areaText) {
        this.game.world.bringToTop(this.areaText);
      }
    }.bind(this), 5);   

    this.direction = 'bottom';
  },
  loadLevel(level) {
    clearInterval(this.playerLoop);
    clearInterval(this.timer);
    this.music.destroy();
    Array.prototype.forEach.call(this.enemies, enemy => {
      clearInterval(enemy.interval);
    });
    this.game.state.start(level, true, false);
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.wallLayer);
    this.game.physics.arcade.collide(this.player, this.objectLayer);
    if(this.barrel.alive) {
      this.game.physics.arcade.collide(this.player, this.barrel);
    }
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

    if(!paused) {
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