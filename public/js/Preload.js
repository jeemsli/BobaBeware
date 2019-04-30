var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() { 
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);

    //load game assets 
    this.load.spritesheet('play','assets/Menu/playButton.png',250,75,2);
    this.load.spritesheet('levels','assets/Menu/levelsButton.png',250,75,2);
    this.load.spritesheet('controls','assets/Menu/controlsButton.png',250,75,2);
    this.load.spritesheet('about','assets/Menu/aboutButton.png',250,75,2);

    this.load.spritesheet('levelsBack','assets/Levels/levelsBack.png',56,48,2);  
    this.load.image('levelsText','assets/Levels/levelsText.png');
    this.load.image('level1','assets/Levels/level1.png');
  
    this.load.spritesheet('controlsBack','assets/Controls/controlsBack.png',56,48,2);  
    this.load.image('controlsScreen','assets/Controls/controlsScreen.png');
    this.load.image('controlsText','assets/Controls/controlsText.png');

    this.load.spritesheet('aboutBack','assets/About/aboutBack.png',56,48,2);
    this.load.image('aboutScreen','assets/About/aboutScreen.png');
    this.load.image('aboutText','assets/About/aboutText.png');
    this.load.image('barOut', 'assets/UI/barOut.png');
    this.load.spritesheet('barIn', 'assets/UI/barSpriteSheet.png', 160, 64, 3);

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
    this.load.tilemap('23', '../maps/Floor 1/23.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('24', '../maps/Floor 1/24.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('25', '../maps/Floor 1/25.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('26', '../maps/Floor 1/26.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('27', '../maps/Floor 1/27.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('28', '../maps/Floor 1/28.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('29', '../maps/Floor 1/29.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('30', '../maps/Floor 1/30.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('31', '../maps/Floor 1/31.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('32', '../maps/Floor 1/32.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('33', '../maps/Floor 1/33.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('34', '../maps/Floor 1/34.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('35', '../maps/Floor 1/35.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('36', '../maps/Floor 1/36.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('37', '../maps/Floor 1/37.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/Floor 1/Floors/f1spritesheet.png');
    this.load.image('objectTiles', 'assets/Floor 1/Floors/objspritesheet.png');
    this.load.spritesheet('player', 'assets/PlayerSheet/playerspritesheet.png', 64, 64, 72);
    this.load.spritesheet('abg', 'assets/Enemies/ABG/AbgSpriteSheet1.png', 64, 64, 72);
    this.game.load.audio('music', 'assets/audio/music.mp3');
  },
  create: function() {
    this.state.start('Splash');
  }
};