var TopDownGame = TopDownGame || {};

TopDownGame.Levels = function(game) {

};

var levelsText;

TopDownGame.Levels.prototype = {
    create: function(game) {
        levelsText = game.add.sprite(game.world.centerX+192,game.world.centerY-224,'levelsText');
        levelsText.anchor.setTo(0.5,0.5);

        this.createButton(game,"levelsBack",game.world.centerX-224,game.world.centerY-224,100,75,
            function(){
                this.state.start('MainMenu');
            });

        this.createButton(game,"level1",game.world.centerX-192,game.world.centerY-96,200,125,
            function(){
                this.state.start('Game');
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