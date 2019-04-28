var TopDownGame = TopDownGame || {};

TopDownGame.Controls = function(game) {

};

var controls;
var controlsText;

TopDownGame.Controls.prototype = {
    create: function(game) {
        controls = game.add.sprite(game.world.centerX,game.world.centerY+64,'controlsScreen');
        controls.scale.setTo(0.5,0.5);
        controls.anchor.setTo(0.5,0.5);

        controlsText = game.add.sprite(game.world.centerX+208,game.world.centerY-224,'controlsText');
        controlsText.anchor.setTo(0.5,0.5);

        this.createButton(game,"controlsBack",game.world.centerX-224,game.world.centerY-224,100,75,
            function(){
                this.state.start('MainMenu');
            });

    },

    update: function(game) {

    },

    createButton: function(game,string,x,y,w,h,callback) {
        var button = game.add.button(x,y,string,callback,this,1,1,0);
        button.anchor.setTo(0.5,0.5);
        button.width = w;
        button.height = h;
    }
}