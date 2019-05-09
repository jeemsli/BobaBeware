var TopDownGame = TopDownGame || {};

TopDownGame.Controls = function(game) {

};

var controls;
var controlsText;

TopDownGame.Controls.prototype = {
    create: function(game) {
        controls = game.add.sprite(320,320+64,'controlsScreen');
        controls.scale.setTo(0.5,0.5);
        controls.anchor.setTo(0.5,0.5);

        controlsText = game.add.sprite(320+208,320-224,'controlsText');
        controlsText.anchor.setTo(0.5,0.5);

        this.createButton(game,"controlsBack",320-224,320-224,100,75,
            function(){
                this.state.start('MainMenu');
            });

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