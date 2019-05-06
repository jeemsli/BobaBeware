var TopDownGame = TopDownGame || {};

TopDownGame.Splash = function(game) {

};

var logo;
var splash;
var sprite;
var text;

function distanceToPointer(displayObject, pointer) {

    this._dx = displayObject.x - pointer.x;
    this._dy = displayObject.y - pointer.y;
    
    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);

}

function moveToXY(displayObject, x, y, speed) {

    var _angle = Math.atan2(y - displayObject.y, x - displayObject.x);
    
    var x = Math.cos(_angle) * speed;
    var y = Math.sin(_angle) * speed;

    return { x: x, y: y };

}

TopDownGame.Splash.prototype = {
    create: function(game) {
        logo = game.add.sprite(320,320-112,'logo');
        logo.scale.setTo(1.5,1.5);
        logo.anchor.setTo(0.5,0.5);

        // splash = new Phaser.Filter(game, null, game.cache.getShader('background'));

        var style = {font: "40px ThinkNothing", fill: "#eeeeee"};
        text = this.game.add.text(320,320+128,"Click to begin...", style);
        text.anchor.setTo(0.5,0.5);
        game.add.tween(text).from( { y: -200 }, 1000, Phaser.Easing.Linear.Out, true);

        text.setShadow(0, 0, 'rgba(132, 34, 34, 0.95)', 0);
    },

    update: function(game) {
        if(this.game.input.activePointer.justPressed()) {
            this.game.state.start('MainMenu');
          }

        var offset = moveToXY(game.input.activePointer, text.x, text.y, 8);
        text.setShadow(offset.x, offset.y, 'rgba(132, 34, 34, 0.95)', distanceToPointer(text, game.input.activePointer) / 30);
    },
}