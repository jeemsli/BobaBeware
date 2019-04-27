var TopDownGame = TopDownGame || {};
 
TopDownGame.game = new Phaser.Game(640, 640, Phaser.AUTO, '');
 
TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('Game', TopDownGame.Game);
TopDownGame.game.state.add('MainMenu', TopDownGame.MainMenu);
TopDownGame.game.state.add('Levels', TopDownGame.Levels);
TopDownGame.game.state.add('Controls', TopDownGame.Controls);
TopDownGame.game.state.add('Help', TopDownGame.Help);
 
TopDownGame.game.state.start('Boot');