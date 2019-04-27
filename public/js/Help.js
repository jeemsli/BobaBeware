var TopDownGame = TopDownGame || {};

TopDownGame.Help = function(game) {

};

var help;

TopDownGame.Help.prototype = {
    create: function(game) {

        help = game.add.sprite(game.world.centerX,game.world.centerY+64,'helpScreen');
        help.scale.setTo(0.5,0.5);
        help.anchor.setTo(0.5,0.5);

        this.createButton(game,"helpBack",game.world.centerX-284,game.world.centerY-224,75,75,
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