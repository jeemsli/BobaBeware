var TopDownGame = TopDownGame || {};
 
TopDownGame.game = new Phaser.Game(640, 640, Phaser.AUTO, '');
 
TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('Game1', TopDownGame.Game);
TopDownGame.game.state.add('Splash', TopDownGame.Splash);
TopDownGame.game.state.add('MainMenu', TopDownGame.MainMenu);
TopDownGame.game.state.add('Levels', TopDownGame.Levels);
TopDownGame.game.state.add('Controls', TopDownGame.Controls);
TopDownGame.game.state.add('About', TopDownGame.About);
TopDownGame.game.state.add('Victory', TopDownGame.Victory);
TopDownGame.game.state.add('Missed', TopDownGame.Missed);
TopDownGame.game.state.add('Gameover', TopDownGame.GameOver);
TopDownGame.game.state.add('Game2', TopDownGame.Game2);
TopDownGame.game.state.add('Game3', TopDownGame.Game3);
TopDownGame.game.state.add('Game4', TopDownGame.Game4);
TopDownGame.game.state.add('Game5', TopDownGame.Game5);
TopDownGame.game.state.add('Game6', TopDownGame.Game6);

TopDownGame.game.state.add('Overworld', TopDownGame.Overworld);
 
TopDownGame.game.state.start('Boot');