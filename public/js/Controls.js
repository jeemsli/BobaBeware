var TopDownGame = TopDownGame || {};

TopDownGame.Controls = function(game) {

};

var controls;

TopDownGame.Controls.prototype = {
    create: function(game) {

        controls = game.add.sprite(game.world.centerX,game.world.centerY+64,'controlScreen');
        controls.scale.setTo(0.5,0.5);
        controls.anchor.setTo(0.5,0.5);

        this.createButton(game,"controlBack",game.world.centerX-284,game.world.centerY-224,75,75,
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