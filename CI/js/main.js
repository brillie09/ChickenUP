var Nakama = {};
Nakama.configs = {};

window.onload = function(){
  Nakama.game = new Phaser.Game(800, 600, Phaser.AUTO,'',
    {
      preload: preload,
      create: create,
      update: update,
      render: render
    }, false, false
  );
}

// preparations before game starts
var preload = function(){
  Nakama.game.scale.minWidth = 400;
  Nakama.game.scale.minHeight = 300;
  Nakama.game.scale.maxWidth = 800;
  Nakama.game.scale.maxHeight = 600;
  Nakama.game.scale.pageAlignHorizontally = true;
  Nakama.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

  Nakama.game.time.advancedTiming = true;

  Nakama.game.load.atlasJSONHash('assets', 'Assets/assets.png', 'Assets/assets.json');
  Nakama.game.load.image('sky', 'assets/OriginalSprites/sky.png');
  Nakama.game.load.image('ground', 'assets/OriginalSprites/platform.png');
  Nakama.game.load.spritesheet('dude', 'assets/OriginalSprites/dude.png', 32, 48);
}

// initialize the game
var create = function(){
  Nakama.game.physics.startSystem(Phaser.Physics.ARCADE);

  //background
  Nakama.game.add.sprite(0, 0, 'sky');

  //platforms
  platforms = Nakama.game.add.group();
  platforms.enableBody = true;

  var ground = platforms.create(0, Nakama.game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;
  var ledge = platforms.create(300, 450, 'ground');
  ledge.body.immovable = true;
  ledge.anchor.setTo(0.5, 0.5);
  var ledge = platforms.create(500, 350, 'ground');
  ledge.body.immovable = true;
  ledge.anchor.setTo(0.5, 0.5);
  var ledge = platforms.create(400, 250, 'ground');
  ledge.body.immovable = true;
  ledge.anchor.setTo(0.5, 0.5);

  //player
  player = Nakama.game.add.sprite(32, Nakama.game.world.height - 150, 'dude');
  Nakama.game.physics.arcade.enable(player);
  player.body.bounce.y = 0.1;
  player.body.gravity.y = 1000;
  player.body.collideWorldBounds = true;
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  //cursors
  cursors = Nakama.game.input.keyboard.createCursorKeys();
}

// update game state each frame
var update = function(){
  //collider
  var hitPlatform = Nakama.game.physics.arcade.collide(player, platforms);

  //playerMovement
  player.body.velocity.x = 0;
  if(cursors.left.isDown){
    player.body.velocity.x = -150;
    player.animations.play('left');
  }
  else if(cursors.right.isDown){
    player.body.velocity.x = 150;
    player.animations.play('right');
  }
  else {
    player.animations.stop();
    player.frame = 4;
  }
  if(cursors.up.isDown && player.body.touching.down && hitPlatform){
    player.body.velocity.y = -500;
  }
}

// before camera render (mostly for debug)
var render = function(){}
