var TopDownGame = TopDownGame || {};

TopDownGame.Splash = function(game) {

};

var logo;

TopDownGame.Splash.prototype = {
    create: function(game) {
        logo = game.add.sprite(game.world.centerX,game.world.centerY-176,'logo');
        logo.scale.setTo(1.5,1.5);
        logo.anchor.setTo(0.5,0.5);

        var text = "Click anywhere to begin...";
        var style = { font: "30px Times New Roman", fill: "#fff", align: "center" };
        var t = this.game.add.text(this.game.width/2, this.game.height/2, text, style);
        t.anchor.setTo(0.5,0.5);
    },

    update: function(game) {
        if(this.game.input.activePointer.justPressed()) {
            this.game.state.start('MainMenu');
          }
    },
}