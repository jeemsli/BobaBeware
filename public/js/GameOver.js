var TopDownGame = TopDownGame || {};

TopDownGame.GameOver = function(game) {

};

var gameOver;
var text;
var music;

TopDownGame.GameOver.prototype = {
    create: function(game) {
        gameOver = game.add.sprite(320,320-112,'gameOver');
        gameOver.scale.setTo(1.5,1.5);
        gameOver.anchor.setTo(0.5,0.5);

        music = game.add.audio('gameover');
        music.loopFull(0.2);

        var style = {font: "40px ThinkNothing", fill: "#eeeeee"};
        text = this.game.add.text(320,320+160,"Press space to continue...", style);
        text.anchor.setTo(0.5,0.5);
        game.add.tween(text).from( { y: -200 }, 500, Phaser.Easing.Linear.Out, true);

        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space.onDown.add(function() {
            music.destroy();
            this.state.start('MainMenu');
        }.bind(this));
    },

    update: function(game) {

    },

    createButton: function(game,string,x,y,w,h,callback) {
        var button = game.add.button(x,y,string,callback,this,2,1,0);
        button.anchor.setTo(0.5,0.5);
        button.width = w;
        button.height = h;
        return button;
    }
}