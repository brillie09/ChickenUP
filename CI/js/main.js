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
  Nakama.game.physics.startSystem(Phaser.Physics.P2JS);
  Nakama.game.physics.p2.restitution = 0.5;
  Nakama.game.physics.p2.gravity.y = 1000;

  //background
  Nakama.game.add.sprite(0, 0, 'sky');

  //player
  player = Nakama.game.add.sprite(32, Nakama.game.world.height - 150, 'dude');
  player.enableBody = true;
  Nakama.game.physics.p2.enable(player);
  player.body.fixedRotation = true;
  player.body.damping = 0.5;
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  //cursors
  cursors = Nakama.game.input.keyboard.createCursorKeys();

  //contactMaterials
  var spriteMaterial = Nakama.game.physics.p2.createMaterial('spriteMaterial', player.body);
  var worldMaterial = Nakama.game.physics.p2.createMaterial('worldMaterial');
  var platformMaterial = Nakama.game.physics.p2.createMaterial('worldMaterial');

  Nakama.game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

  //platforms
  platforms = Nakama.game.add.group();

  var ground = platforms.create(400, Nakama.game.world.height, 'ground');
  ground.scale.setTo(2, 2);
  Nakama.game.physics.p2.enable(ground);
  ground.body.static = true;
  ground.body.setMaterial(platformMaterial);
  //createLedge
  for(var i = 0; i < 300; i = i + 96){
    var ledge = platforms.create(400, 484 - i, 'ground');
    ledge.scale.setTo(1.5, 1);
    Nakama.game.physics.p2.enable(ledge);
    ledge.body.static = true;
    ledge.body.setMaterial(platformMaterial);
  }

  /*var ledge = platforms.create(300, 450, 'ground');
  //ledge.body.setMaterial(platformMaterial);
  ledge.body.static = true;
  //ledge.anchor.setTo(0.5, 0.5);
  var ledge = platforms.create(500, 350, 'ground');
  //ledge.body.setMaterial(platformMaterial);
  ledge.body.static = true;
  //ledge.anchor.setTo(0.5, 0.5);
  var ledge = platforms.create(400, 250, 'ground');
  ledge.body.setMaterial(platformMaterial);
  ledge.body.static = true;
  //ledge.anchor.setTo(0.5, 0.5);*/


  //collide
  var worldPlayerCM = Nakama.game.physics.p2.createContactMaterial(spriteMaterial, worldMaterial, { friction: 0.0 });
  var platformsPlayerCM = Nakama.game.physics.p2.createContactMaterial(worldMaterial, platformMaterial, { friction: 0.0 });

}

// update game state each frame
var update = function(){

  //playerMovement
  player.body.setZeroVelocity();
  if(cursors.left.isDown){
    player.body.moveLeft(150);
    player.animations.play('left');
  }
  else if(cursors.right.isDown){
    player.body.moveRight(150);
    player.animations.play('right');
  }
  else {
    player.animations.stop();
    player.frame = 4;
  }
  if(cursors.up.isDown /*&& player.body.touching.down && hitPlatform*/){
    player.body.moveUp(500);
  }
}

// before camera render (mostly for debug)
var render = function(){}


//test đá rơi của a Quang
/*
window.onload = function(){
  game = new Phaser.Game(1280,960,Phaser.AUTO,'',
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
  game.scale.minWidth = 640;
  game.scale.minHeight = 480;
  game.scale.maxWidth = 1280;
  game.scale.maxHeight = 960;
  game.scale.pageAlignHorizontally = true;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

  game.time.advancedTiming = true;

  game.load.image('asteroid2', 'Assets/asteroid2.png');
  game.load.image('background', 'Assets/starfield.jpg');
  game.load.physics('physicsData', 'Assets/sprites.json');
}

var asteroid;
var timeSinceLastFire = 0;
var asGroup = [];
function create() {

    //  Enable p2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);

    game.physics.p2.restitution = 0;

    background = game.add.tileSprite(0, 0, 1280, 960, 'background');

    game.physics.p2.gravity.y = 1000;
    asteroid = game.add.physicsGroup(Phaser.Physics.P2JS);
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  background.tilePosition.y += 1;
  timeSinceLastFire += game.time.physicsElapsed;
  if (cursors.down.isDown && timeSinceLastFire>0.3)
    {
      var ball = asteroid.create(game.rnd.between(320,960), 100, 'asteroid2');
      ball.body.velocity.x = ((game.rnd.between(0, 20)-10)*100);

      ball.body.clearShapes();

      ball.body.loadPolygon('physicsData', 'asteroid2');

      timeSinceLastFire = 0;
      asGroup.push(ball);
      //ball.body.onBeginContact.add(hit, this);
    }
    if(asGroup.length>0 && timeSinceLastFire>0.8){
      for(var i=0; i<asGroup.length; i++){
        if(asGroup[i].body.velocity.x<10
          && asGroup[i].body.velocity.x>-10
          && asGroup[i].body.velocity.x!=10
          && asGroup[i].body.velocity.y<10
          && asGroup[i].body.velocity.y>-10
          && asGroup[i].body.velocity.y!=0){
          asGroup[i].body.setZeroVelocity();
          asGroup[i].body.static=true;
          asGroup[i].body.setZeroRotation();
        }
      }
      timeSinceLastFire = 0;
    }
}

function hit(body, bodyB, shapeA, shapeB, equation) {
  equation[0].bodyB.parent.setZeroVelocity();
  equation[0].bodyB.parent.setZeroRotation();
  equation[0].bodyB.parent.static=true;
}

function render() {
}
*/
