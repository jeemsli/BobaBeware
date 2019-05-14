var TopDownGame = TopDownGame || {};

TopDownGame.Missed = function(game) {

};

var missed;
var text;
var music;

TopDownGame.Missed.prototype = {
    create: function(game) {
        missed = game.add.sprite(320,320-142,'missed');
        missed.scale.setTo(1.5,1.5);
        missed.anchor.setTo(0.5,0.5);

        music = game.add.audio('gameover');
        music.loopFull(0.2);

        var style = {font: "40px ThinkNothing", fill: "#eeeeee"};
        text = this.game.add.text(320,320+160,"Press space to continue...", style);
        text.anchor.setTo(0.5,0.5);
        game.add.tween(text).from( { y: -200 }, 500, Phaser.Easing.Linear.Out, true);

        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space.onDown.add(function() {
            music.destroy();
            this.state.start('Overworld');
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