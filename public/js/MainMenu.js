var TopDownGame = TopDownGame || {};

TopDownGame.MainMenu = function(game) {

};

var logo;
var play;
var levelselection;
var controls;
var about;

TopDownGame.MainMenu.prototype = {
    create: function(game) {
        logo = game.add.sprite(game.world.centerX,game.world.centerY-192,'logo');
        logo.anchor.setTo(0.5,0.5);

        game.add.tween(logo).from( { y: -200 }, 2000, Phaser.Easing.Bounce.Out, true);

        play = this.createButton(game,"play",game.world.centerX,game.world.centerY-64,250,75,
            function(){
                this.state.start('Game');
            });

        levelselection = this.createButton(game,"levels",game.world.centerX,game.world.centerY+32,250,75,
            function(){
                this.state.start('Levels');
            });

        controls = this.createButton(game,"controls",game.world.centerX,game.world.centerY+128,250,75,
            function(){
                this.state.start('Controls');
            });

        about = this.createButton(game,"about",game.world.centerX,game.world.centerY+224,250,75,
            function(){
                this.state.start('About');
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