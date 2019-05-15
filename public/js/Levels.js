var TopDownGame = TopDownGame || {};

TopDownGame.Levels = function(game) {

};

var levelsText;

TopDownGame.Levels.prototype = {
    create: function(game) {
        levelsText = game.add.sprite(320+192,320-224,'levelsText');
        levelsText.anchor.setTo(0.5,0.5);

        this.createButton(game,"levelsBack",320-224,320-224,100,75,
            function(){
                this.state.start('MainMenu', true, false);
            });

        this.createButton(game,"level1",320-144,320-96,200,125,
            function(){
                this.state.start('Game1', true, false);
            });

        this.createButton(game,"level2",320-144,320+48,200,125,
            function(){
                this.state.start('Game2', true, false);
            });

        this.createButton(game,"level3",320-144,320+192,200,125,
            function(){
                this.state.start('Game3', true, false);
            });

        this.createButton(game,"level4",320+144,320-96,200,125,
            function(){
                this.state.start('Game4', true, false);
            });

        this.createButton(game,"level5",320+144,320+48,200,125,
            function(){
                this.state.start('Game5', true, false);
            });

        this.createButton(game,"level6",320+144,320+192,200,125,
            function(){
                this.state.start('Game6', true, false);
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