var TopDownGame = TopDownGame || {};

TopDownGame.About = function(game) {

};

var aboutScreen;
var aboutText;

TopDownGame.About.prototype = {
    create: function(game) {

        aboutScreen = game.add.sprite(320,320+64,'aboutScreen');
        aboutScreen.scale.setTo(0.5,0.5);
        aboutScreen.anchor.setTo(0.5,0.5);

        aboutText = game.add.sprite(320+208,320-224,'aboutText');
        aboutText.anchor.setTo(0.5,0.5);

        this.createButton(game,"aboutBack",320-224,320-224,100,75,
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