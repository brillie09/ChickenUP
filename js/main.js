//ver2 dùng arcade physics
var text =0;
var counter =0;
var game;
var gameOptions = {
    gameWidth: 1000,
    gameHeight: 1050,
    floorStart: 1 / 8 * 5,
    floorGap: 250,
    playerGravity: 4500,
    playerSpeed: 420,
    climbSpeed: 450,
    playerJump: 900,
}
window.onload = function() {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight,{
      render : render
    });
    game.state.add("PreloadGame", preloadGame);
    game.state.add("PlayGame", playGame);
    game.state.add("GameOver", gameOver);
    game.state.start("PreloadGame");
}

var preloadGame = function(game){}
preloadGame.prototype = {
    preload: function(){
        game.stage.backgroundColor = 0xabe7ff;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        game.load.image("ground", 'Assets/ground.png');
        //game.load.image("hero", 'Assets/OriginalSprites/hero.png');
        game.load.image("gover", 'Assets/gameover.jpg');
        game.load.image("ladder", 'Assets/ladder.png');
        game.load.image('monster', 'Assets/monsters.png');
        game.load.image("button", 'Assets/playbutton.png');
        game.load.image("howplay", 'Assets/howplay.png');
        game.load.image("background", 'Assets/sky.png');
        game.load.spritesheet("hero", 'Assets/chicken.png',40,58);
    },
    create: function(){
      background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
      game.physics.startSystem(Phaser.Physics.ARCADE);
      game.keyboard = game.input.keyboard;
      button = game.add.button(500, 350, 'button', this.start, this, 2, 1, 0);
      button.anchor.setTo(0.5, 0.5);
      howplay = game.add.button(500, 700, 'howplay', this.howtoplay, this, 2, 1, 0);
      howplay.anchor.setTo(0.5,0.5)
    },
    update: function(){
      if(game.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        this.start();
      }
    },
    start: function(){
      button.visible = false;
      game.state.start("PlayGame");
    }
}
var gameOver = function(game){}
gameOver.prototype = {
  create: function(){
    gover = game.add.sprite(0, 400, 'gover');
    showscore = game.add.text(500, 300, 'SCORE: ' + counter, { font: "60px Arial", fill: "#ffffff", align: "center" });
    if(localStorage.getItem('highscore')<counter)
    localStorage.setItem('highscore',counter);
    hscore = game.add.text(500,400, 'HIGH SCORE: ' + localStorage.getItem('highscore'), { font: "60px Arial", fill: "#ffffff", align: "center" });
    showscore.anchor.setTo(0.5,0.5);
    hscore.anchor.setTo(0.5,0.5);
    counter = 0;
  },
  update: function(){
    if (game.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) game.state.start("PlayGame");
  }
}
var playGame = function(game){}
playGame.prototype = {
    create: function(){
      game.background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
      text = game.add.text(5, 5 , 'Score: 0', { font: "40px Arial", fill: "#000", align: "center" });
      text.anchor.setTo(0, 0);
      this.canJump = true;
      this.isClimbing = false;
      this.defineGroups();
      this.drawLevel();
      this.defineTweens();
    },
    drawLevel: function(){
        this.currentFloor = 0;
        this.currentLadder = 0;
        this.currentMonster = 0;
        this.highestFloorY = game.height * gameOptions.floorStart;
        this.floorArray = [];
        this.ladderArray = [];
        this.monsterArray = [];
        this.isMovingRight = true;
        while(this.highestFloorY > - 3 * gameOptions.floorGap){
                this.addFloor();
                if(this.currentFloor >= 0){
                  this.addLadder(this.highestFloorY);
                  this.addMonster();
                }
                this.highestFloorY -= gameOptions.floorGap;
                this.currentFloor ++;
        }
        this.currentFloor = 0;
        this.addHero();
    },
    addMonster: function(){
      var monster = game.add.sprite((game.width / 2)*(this.currentFloor % 2), this.highestFloorY-40, 'monster');
      this.monsterGroup.add(monster);
      game.physics.enable(monster, Phaser.Physics.ARCADE);
      this.monsterArray.push(monster);
      monster.body.velocity.x = game.rnd.between(100,200);
    },
    addFloor: function(){
        var floor = game.add.sprite((game.width / 2)*((this.currentFloor % 2)*2), this.highestFloorY, "ground");
        floor.scale.x = (this.currentFloor % 2 == 0) ? 1 : -1 ;
        this.floorGroup.add(floor);
        game.physics.enable(floor, Phaser.Physics.ARCADE);
        floor.body.immovable = true;
        floor.body.checkCollision.down = false;
        this.floorArray.push(floor);
    },
    addLadder: function(y){
        var ladderPos = this.currentFloor % 2 == 0 ? ((game.width / 2) - 100) : ((game.width / 2) + 100)
        var ladder = game.add.sprite(ladderPos, y, "ladder");
        this.ladderGroup.add(ladder);
        ladder.anchor.set(0.5, 0);
        game.physics.enable(ladder, Phaser.Physics.ARCADE);
        ladder.body.immovable = true;
        this.ladderArray.push(ladder);
    },
    addHero: function(){
        this.hero = game.add.sprite(50 , game.height * gameOptions.floorStart - 58, "hero");
        this.hero.animations.add('run', [0,1,2,3], 10, true);
        this.hero.animations.play('run');
        this.gameGroup.add(this.hero)
        this.hero.anchor.set(0.5, 0);
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        this.hero.body.collideWorldBounds = true;
        this.hero.body.bounce.y = 0.3;
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.hero.body.velocity.x = gameOptions.playerSpeed;
        this.hero.body.onWorldBounds = new Phaser.Signal();
        this.hero.body.onWorldBounds.add(function(sprite, up, down, left, right){
            if(left){
                this.hero.body.velocity.x = gameOptions.playerSpeed;
                this.isMovingRight = true;
                this.hero.scale.x = 1;
            }
            if(right){
                this.hero.body.velocity.x = -gameOptions.playerSpeed;
                this.isMovingRight = false;
                this.hero.scale.x = -1;
            }
            if(down){
              game.state.start('GameOver');
            }
        }, this)
    },

    defineGroups: function(){
        this.gameGroup = game.add.group();
        this.floorGroup = game.add.group();
        this.ladderGroup = game.add.group();
        this.monsterGroup = game.add.group();
        this.gameGroup.add(this.floorGroup);
        this.gameGroup.add(this.ladderGroup);
        this.gameGroup.add(this.monsterGroup);
    },
    update: function(){
        game.background.tilePosition.y += 0.2;
        this.checkCollision();
        this.checkLadderCollision();
        this.heroOnLadder();
        this.updateMonster();
        this.updateHero();
    },
    updateHero: function(){
      if (!this.isClimbing){
        if(game.keyboard.isDown(Phaser.Keyboard.UP)){
          if(this.canJump){
              this.hero.body.velocity.y = -gameOptions.playerJump;
              this.canJump = false;
          }
        }
        if(game.keyboard.isDown(Phaser.Keyboard.LEFT)){
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed-300 : -gameOptions.playerSpeed-200;
        } else if(game.keyboard.isDown(Phaser.Keyboard.RIGHT)){
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed+200 : -gameOptions.playerSpeed+300;
        } else{
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed : -gameOptions.playerSpeed;
        }
      }
    },
    updateMonster: function(){
      for(var i = 0; i<this.monsterArray.length;i++){
        if (i %2 == 1){
          if(this.monsterArray[i].position.x<550) this.monsterArray[i].body.velocity.x=game.rnd.between(100,200);
          if(this.monsterArray[i].position.x>910) this.monsterArray[i].body.velocity.x=-game.rnd.between(100,200);
        }else{
          if(this.monsterArray[i].position.x<50) this.monsterArray[i].body.velocity.x=game.rnd.between(100,200);
          if(this.monsterArray[i].position.x>410) this.monsterArray[i].body.velocity.x=-game.rnd.between(100,200);
        }
      }
    },
    checkCollision: function(){
      //monster collision check
      game.physics.arcade.collide(this.monsterArray, this.hero, function(){
        game.state.start('GameOver');
      }, null, this);
      //floor collision check
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
                this.fadeLadder.target =  this.ladderArray[this.currentLadder];
                this.fadeLadder.start();
                this.fadeMonster.target =  this.monsterArray[this.currentMonster];
                this.fadeMonster.start();
                this.currentMonster = (this.currentMonster+1) % this.monsterArray.length;
            }
        }, null, this);
    },
    defineTweens: function(){
        this.scrollTween = game.add.tween(this.gameGroup).to({
            y: gameOptions.floorGap
        }, 800, Phaser.Easing.Cubic.Out);
        this.scrollTween.onComplete.add(function(){
                this.gameGroup.y = 0;
                this.monsterGroup.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
                this.floorGroup.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
                this.ladderGroup.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
                this.hero.y += gameOptions.floorGap;
                counter++;
                text.setText('Score: ' + counter);
        }, this)
        this.fadeTween = game.add.tween(this.floorArray[0]).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.Out);
        this.fadeTween.onComplete.add(function(floor){
                floor.y = this.highestFloorY;
                floor.alpha =1;
        }, this);

        this.fadeLadder = game.add.tween(this.ladderArray[0]).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.Out);
        this.fadeLadder.onComplete.add(function(ladder){
                ladder.y = this.highestFloorY;
                ladder.alpha =1;
        }, this);

        this.fadeMonster = game.add.tween(this.monsterArray[0]).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.Out);
        this.fadeMonster.onComplete.add(function(monster){
                monster.y = this.highestFloorY-40;
                monster.alpha =1;
        }, this);

    },
    heroOnLadder: function(){
        if(this.isClimbing && this.hero.y <= this.floorArray[this.currentFloor].y - 58){
            this.hero.body.gravity.y = gameOptions.playerGravity;
            this.hero.body.velocity.x = gameOptions.playerSpeed * this.hero.scale.x;
            this.hero.body.velocity.y = 0;
            this.isClimbing = false;
            this.currentLadder = (this.currentLadder + 1) % this.ladderArray.length;
        }
    }
}
function render() {
}
