var TopDownGame = TopDownGame || {};

TopDownGame.Splash = function(game) {

};

var logo;
var splash;
var sprite;

TopDownGame.Splash.prototype = {
    create: function(game) {
        logo = game.add.sprite(game.world.centerX,game.world.centerY-176,'logo');
        logo.scale.setTo(1.5,1.5);
        logo.anchor.setTo(0.5,0.5);

        splash = new Phaser.Filter(game, null, game.cache.getShader('background'));

        // sprite = game.add.sprite();
        // sprite.width = 640;
        // sprite.height = 640;

        // sprite.filters = [ splash ];

        // splash = this.game.add.tileSprite(0, 
        //     this.game.height - this.game.cache.getImage('about').height, 
        //     this.game.width, 
        //     this.game.cache.getImage('about').height, 
        //     'about',
        // );

        var style = {font: "40px ThinkNothing", fill: "#eeeeee"};
        var t = this.game.add.text(this.game.world.centerX,this.game.world.centerY,"Click to begin...", style);
        t.anchor.setTo(0.5,0.5);
    },

    update: function(game) {
        if(this.game.input.activePointer.justPressed()) {
            this.game.state.start('MainMenu');
          }
        // splash.tilePosition.x -= 0.5;
        splash.update();
    },
}