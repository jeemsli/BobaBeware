var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() {
    // // show loading screen
    // this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    // this.preloadBar.anchor.setTo(0.5);
 
    // this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.load.image('logo','assets/Menu/BobaBeware.png');
    this.load.image('play','assets/Menu/play.png');
    this.load.image('level','assets/Menu/level.png');
    this.load.image('controls','assets/Menu/controls.png');
    this.load.image('help','assets/Menu/help.png');

    this.load.image('levelsBack','assets/Levels/levelsBack.png');
    this.load.image('level1','assets/Levels/level1.png');

    this.load.image('controlBack','assets/Controls/controlBack.png');    
    this.load.image('controlScreen','assets/Controls/controlScreen.png');

    this.load.image('helpBack','assets/Help/helpBack.png');
    this.load.image('helpScreen','assets/Help/helpScreen.png');

    this.load.tilemap('1', '../maps/Floor 1/1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('2', '../maps/Floor 1/2.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('3', '../maps/Floor 1/3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('4', '../maps/Floor 1/4.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('5', '../maps/Floor 1/5.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('6', '../maps/Floor 1/6.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('7', '../maps/Floor 1/7.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('8', '../maps/Floor 1/8.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('9', '../maps/Floor 1/9.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('10', '../maps/Floor 1/10.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('11', '../maps/Floor 1/11.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('12', '../maps/Floor 1/12.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('13', '../maps/Floor 1/13.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('14', '../maps/Floor 1/14.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('15', '../maps/Floor 1/15.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('16', '../maps/Floor 1/16.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('17', '../maps/Floor 1/17.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('18', '../maps/Floor 1/18.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('19', '../maps/Floor 1/19.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('20', '../maps/Floor 1/20.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('21', '../maps/Floor 1/21.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('22', '../maps/Floor 1/22.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/Floor 1/Floors/f1spritesheet.png');
    this.load.image('objectTiles', 'assets/Floor 1/Floors/objspritesheet.png');
    this.load.spritesheet('player', 'assets/PlayerSheet/playerspritesheet.png', 64, 64, 72);
    this.load.spritesheet('abg', 'assets/Enemies/ABG/AbgSpriteSheet.png', 64, 64, 72);
    this.game.load.audio('music', 'assets/audio/music.mp3');
  },
  create: function() {
    this.state.start('MainMenu');
  }
};