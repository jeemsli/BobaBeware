var TopDownGame = TopDownGame || {};

TopDownGame.About = function(game) {

};

var aboutScreen;
var aboutText;

TopDownGame.About.prototype = {
    create: function(game) {

        aboutScreen = game.add.sprite(game.world.centerX,game.world.centerY+64,'aboutScreen');
        aboutScreen.scale.setTo(0.5,0.5);
        aboutScreen.anchor.setTo(0.5,0.5);

        aboutText = game.add.sprite(game.world.centerX+208,game.world.centerY-224,'aboutText');
        aboutText.anchor.setTo(0.5,0.5);

        this.createButton(game,"aboutBack",game.world.centerX-224,game.world.centerY-224,100,75,
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