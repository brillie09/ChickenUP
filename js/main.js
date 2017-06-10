//ver2 dùng arcade physics
var game;
var gameOptions = {
    gameWidth: 800,
    gameHeight: 1300,
    floorStart: 1 / 8 * 5,
    floorGap: 250,
    playerGravity: 4500,
    playerSpeed: 450,
    climbSpeed: 450,
    playerJump: 900,
    temp: 0,
    temp2: 0
}
window.onload = function() {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    game.state.add("PreloadGame", preloadGame);
    game.state.add("PlayGame", playGame);
    game.state.start("PreloadGame");
}

var preloadGame = function(game){}
preloadGame.prototype = {
    preload: function(){
        game.stage.backgroundColor = 0xFFFFFF;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        game.load.image("ground", 'Assets/OriginalSprites/ground.png');
        game.load.image("hero", 'Assets/OriginalSprites/hero.png');
        game.load.image("ladder", 'Assets/OriginalSprites/ladder.png');
        /*game.load.image('ground', 'assets/OriginalSprites/platform.png');
        game.load.spritesheet('dude', 'assets/OriginalSprites/dude.png', 32, 48);
        game.load.image("ladder", 'assets/OriginalSprites/ladder.png');*/
    },
    create: function(){
        game.state.start("PlayGame");
    }
}
var playGame = function(game){}
playGame.prototype = {
    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.canJump = true;
        this.isClimbing = false;
        this.defineGroups();
        this.drawLevel();
        this.defineTweens();
        game.input.onTap.add(this.handleTap, this);
    },
    drawLevel: function(){
        this.currentFloor = 0;
        this.currentLadder = 0;
        this.highestFloorY = game.height * gameOptions.floorStart;
        this.floorArray = [];
        this.ladderArray = [];
        while(this.highestFloorY > - 3 * gameOptions.floorGap){
                this.addFloor();
                if(this.currentFloor > 0){
                    this.addLadder();
                }
                this.highestFloorY -= gameOptions.floorGap;
                this.currentFloor ++;
        }
        this.currentFloor = 0;
        this.addHero();
    },
    addFloor: function(){
        var floor = game.add.sprite((game.width / 2)*(this.currentFloor % 2), this.highestFloorY, "ground");
        this.floorGroup.add(floor);
        game.physics.enable(floor, Phaser.Physics.ARCADE);
        floor.body.immovable = true;
        floor.body.checkCollision.down = false;
        this.floorArray.push(floor);
    },
    addLadder: function(){
        var ladder = game.add.sprite((game.width / 2)*(this.currentFloor % 2) + 100, this.highestFloorY, "ladder");
        this.ladderGroup.add(ladder);
        ladder.anchor.set(0.5, 0);
        game.physics.enable(ladder, Phaser.Physics.ARCADE);
        ladder.body.immovable = true;
        this.ladderArray.push(ladder);
    },
    addHero: function(){
        this.hero = game.add.sprite(10 , game.height * gameOptions.floorStart - 50, "hero");
        this.gameGroup.add(this.hero)
        this.hero.anchor.set(0.5, 0);
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        this.hero.body.collideWorldBounds = true;
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.hero.body.velocity.x = gameOptions.playerSpeed;
        this.hero.body.onWorldBounds = new Phaser.Signal();
        this.hero.body.onWorldBounds.add(function(sprite, up, down, left, right){
            if(left){
                this.hero.body.velocity.x = gameOptions.playerSpeed;
                this.hero.scale.x = 1;
            }
            if(right){
                this.hero.body.velocity.x = -gameOptions.playerSpeed;
                this.hero.scale.x = -1;
            }
        }, this)
    },
    defineTweens: function(){
        this.scrollTween = game.add.tween(this.gameGroup).to({
            y: gameOptions.floorGap
        }, 800, Phaser.Easing.Cubic.Out);
        this.scrollTween.onComplete.add(function(){
                this.gameGroup.y = 0;
                this.floorGroup.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
                this.ladderGroup.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
                this.hero.y += gameOptions.floorGap;
        }, this)
        this.fadeTween = game.add.tween(this.floorArray[0]).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.Out);
        this.fadeTween.onComplete.add(function(floor){
                floor.y = this.highestFloorY;
                floor.alpha =1;
        }, this);
    },
    defineGroups: function(){
        this.gameGroup = game.add.group();
        this.floorGroup = game.add.group();
        this.ladderGroup = game.add.group();
        this.gameGroup.add(this.floorGroup);
        this.gameGroup.add(this.ladderGroup);
    },
    handleTap: function(pointer, doubleTap){
        if(this.canJump && !this.isClimbing){
            this.hero.body.velocity.y = -gameOptions.playerJump;
            this.canJump = false;
        }
    },
    update: function(){
        this.checkFloorCollision();
        this.checkLadderCollision();
        this.heroOnLadder();
    },
    checkFloorCollision: function(){
        game.physics.arcade.collide(this.hero, this.floorArray, function(){
            this.canJump = true;
        }, null, this);
    },
    checkLadderCollision: function(){
        game.physics.arcade.overlap(this.hero, this.ladderArray, function(player, ladder){
            if(!this.isClimbing && Math.abs(player.x - ladder.x) < 10){
                this.hero.body.velocity.x = 0;
                this.hero.body.velocity.y = - gameOptions.climbSpeed;
                this.hero.body.gravity.y = 0;
                this.isClimbing = true;
                this.fadeTween.target =  this.floorArray[this.currentFloor];
                this.currentFloor = (this.currentFloor + 1) % this.floorArray.length;
                this.fadeTween.start();
                this.scrollTween.start();
            }
        }, null, this);
    },
    heroOnLadder: function(){
        if(this.isClimbing && this.hero.y <= this.floorArray[this.currentFloor].y - 40){
            this.hero.body.gravity.y = gameOptions.playerGravity;
            this.hero.body.velocity.x = gameOptions.playerSpeed * this.hero.scale.x;
            this.hero.body.velocity.y = 0;
            this.isClimbing = false;
            this.fadeTween.target =  this.ladderArray[this.currentLadder];
            this.fadeTween.start();
            this.currentLadder = (this.currentLadder + 1) % this.ladderArray.length;
        }
    }
}


//ver1 dùng p2 physics
/*
// before camera render (mostly for debug)
var render = function(){}


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
  Nakama.game.physics.p2.gravity.y = 300;

  //background
  Nakama.game.add.sprite(0, 0, 'sky');

  //player
  player = Nakama.game.add.sprite(32, Nakama.game.world.height - 50, 'dude');
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
  var test = Nakama.game.add.sprite(400, 50, 'ground');
  //ledge.scale.setTo(1.5, 1);
  test.anchor.setTo(0.5, 0.5);
  test.rotation = 10;
  Nakama.game.physics.p2.enable(test);
  test.body.static = true;
  test.body.setMaterial(platformMaterial);

  //collide
  var worldPlayerCM = Nakama.game.physics.p2.createContactMaterial(spriteMaterial, worldMaterial, { friction: 0.0 });
  var platformWorldCM = Nakama.game.physics.p2.createContactMaterial(worldMaterial, platformMaterial, { friction: 0.0 });
  var playerPlatformCM = Nakama.game.physics.p2.createContactMaterial(spriteMaterial, platformMaterial, { friction: 0.0 });

}

// update game state each frame
var update = function(){

}



// before camera render (mostly for debug)
var render = function(){}
*/
