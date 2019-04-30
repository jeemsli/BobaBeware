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
        var centerX = 320;
        var centerY = 320;
        logo = game.add.sprite(centerX,centerY-192,'logo');
        logo.anchor.setTo(0.5,0.5);

        game.add.tween(logo).from( { y: -200 }, 2000, Phaser.Easing.Elastic.Out, true);

        play = this.createButton(game,"play",centerX,centerY-64,250,75,
            function(){
                this.state.start('Game', true, false);
            });

        levelselection = this.createButton(game,"levels",centerX,centerY+32,250,75,
            function(){
                this.state.start('Levels');
            });

        controls = this.createButton(game,"controls",centerX,centerY+128,250,75,
            function(){
                this.state.start('Controls');
            });

        about = this.createButton(game,"about",centerX,centerY+224,250,75,
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