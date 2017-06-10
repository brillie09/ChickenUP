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
    playerSpeed: 450,
    climbSpeed: 450,
    playerJump: 900,
    temp: 0,
    temp2: 0
}
window.onload = function() {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight,{
      render : render
    });
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
        game.load.image("pause", 'Assets/OriginalSprites/pausedmenu.jpg');
        game.load.image("ladder", 'Assets/OriginalSprites/ladder.png');
        game.load.spritesheet('monster', 'Assets/monsters.png');
        game.load.image("banner", 'Assets/OriginalSprites/banner.jpg');
        game.load.image("button", 'Assets/OriginalSprites/button.png');
        game.load.image("background", 'Assets/sky.png');
    },
    create: function(){
      //game.state.start("PlayGame");
      game.physics.startSystem(Phaser.Physics.ARCADE);
      game.keyboard = game.input.keyboard;
      banner = game.add.sprite(500, 525, 'banner');
      banner.anchor.setTo(0.5, 0.5);
      button = game.add.button(500, 725, 'button', start, this, 2, 1, 0);
      button.anchor.setTo(0.5, 0.5);
    },
    update: function(){
      if(game.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        start();
      }
    }
}
function start(){
  button.visible = false;
  game.state.start("PlayGame");
}

var playGame = function(game){}
playGame.prototype = {
    create: function(){
      game.background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
        text = game.add.text(5, 5 , 'Score: 0', { font: "40px Arial", fill: "#000", align: "center" });
        text.anchor.setTo(0, 0);
        game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);
        this.keyboard = game.input.keyboard;
        this.canJump = true;
        this.isClimbing = false;
        this.defineGroups();
        this.drawLevel();
        this.defineTweens();
        //game.input.onTap.add(this.handleTap, this);
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
        this.hero = game.add.sprite(50 , game.height * gameOptions.floorStart - 50, "hero");
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
                this.isMovingRight = true;
                this.hero.scale.x = 1;
            }
            if(right){
                this.hero.body.velocity.x = -gameOptions.playerSpeed;
                this.isMovingRight = false;
                this.hero.scale.x = -1;
            }
            if(down){
              this.gameOver();
            }
        }, this)
    },
    gameOver: function(){
      game.paused = true;
      pause = game.add.sprite(500, 525, 'pause');
      var urScore = counter;
      showscore = game.add.text(500, 100, 'Your score is : ' + urScore, { font: "60px Arial", fill: "#e2041a", align: "center" });
      restart = game.add.text(500, 180, 'Click anywhere to restart', { font: "40px Arial", fill: "#1d71f7", align: "center" });
      showscore.anchor.setTo(0.5,0.5);
      pause.anchor.setTo(0.5, 0.5);
      restart.anchor.setTo(0.5, 0.5);
      game.input.onTap.add(this.startAgain, this);
      counter = 0;
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
    /*handleTap: function(pointer, doubleTap){
        if(this.canJump && !this.isClimbing){
            this.hero.body.velocity.y = -gameOptions.playerJump;
            this.canJump = false;
        }
    },*/
    startAgain: function(pointer, doubleTap){
      game.paused = false;
      game.state.start('PlayGame');
    },
    update: function(){
    game.background.tilePosition.y +=  1;
        this.checkCollision();
        this.checkLadderCollision();
        this.heroOnLadder();
        this.updateMonster();
        this.updateHero();
    },
    updateHero: function(){
      if (!this.isClimbing){
        if(this.keyboard.isDown(Phaser.Keyboard.UP)){
          if(this.canJump){
              this.hero.body.velocity.y = -gameOptions.playerJump;
              this.canJump = false;
          }
        }
        if(this.keyboard.isDown(Phaser.Keyboard.LEFT)){
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed-300 : -gameOptions.playerSpeed-300;
        } else if(this.keyboard.isDown(Phaser.Keyboard.RIGHT)){
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed+300 : -gameOptions.playerSpeed+300;
        } else{
          this.hero.body.velocity.x = this.isMovingRight ? gameOptions.playerSpeed : -gameOptions.playerSpeed;
        }
      }
    },
    updateMonster: function(){
      for(var i = 0; i<this.monsterArray.length;i++){
        if (i %2 == 1){
          if(this.monsterArray[i].position.x<500) this.monsterArray[i].body.velocity.x=game.rnd.between(100,200);
          if(this.monsterArray[i].position.x>960) this.monsterArray[i].body.velocity.x=-game.rnd.between(100,200);
        }else{
          if(this.monsterArray[i].position.x<0) this.monsterArray[i].body.velocity.x=game.rnd.between(100,200);
          if(this.monsterArray[i].position.x>460) this.monsterArray[i].body.velocity.x=-game.rnd.between(100,200);
        }
      }
    },
    checkCollision: function(){
      //monster collision check
      game.physics.arcade.collide(this.monsterArray, this.hero, function(){
          this.gameOver();
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
                /*for (var mons of this.monsterArray)
                  mons.body.velocity.x += (game.rnd.between(0,6)-3)*100;*/
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
        if(this.isClimbing && this.hero.y <= this.floorArray[this.currentFloor].y - 40){
            this.hero.body.gravity.y = gameOptions.playerGravity;
            this.hero.body.velocity.x = gameOptions.playerSpeed * this.hero.scale.x;
            this.hero.body.velocity.y = 0;
            this.isClimbing = false;
            this.currentLadder = (this.currentLadder + 1) % this.ladderArray.length;
        }
    }
}
function updateCounter() {
    counter++;
    text.setText('Score: ' + counter);
}
function render() {
    game.debug.text("Time until event: " + game.time.events.duration.toFixed(0), 32, 32);
    game.debug.text("Next tick: " + game.time.events.next.toFixed(0), 32, 64);
}
