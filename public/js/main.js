var TopDownGame = TopDownGame || {};
 
TopDownGame.game = new Phaser.Game(640, 640, Phaser.AUTO, '');
 
TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('Game', TopDownGame.Game);
TopDownGame.game.state.add('Splash', TopDownGame.Splash);
TopDownGame.game.state.add('MainMenu', TopDownGame.MainMenu);
TopDownGame.game.state.add('Levels', TopDownGame.Levels);
TopDownGame.game.state.add('Controls', TopDownGame.Controls);
TopDownGame.game.state.add('About', TopDownGame.About);
<<<<<<< HEAD
TopDownGame.game.state.add('Victory', TopDownGame.Victory);
TopDownGame.game.state.add('GameOver', TopDownGame.GameOver);
=======
TopDownGame.game.state.add('Death', TopDownGame.Death);
TopDownGame.game.state.add('Overworld', TopDownGame.Overworld);
>>>>>>> 87d59c32fed0eb31740d4e6db380fec1c2a09dac
 
TopDownGame.game.state.start('Boot');