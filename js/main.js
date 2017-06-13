//ver3
var text =0;
var counter =0;
var savedData;
var game;
var gameOptions = {
    gameWidth: 1000,
    gameHeight: 1050,
    floorStart: 1 / 8 * 5,
    floorGap: 250,
    playerGravity: 4500,
    playerSpeed: 420,
    monsterSpeed: 120,
    monster_2Speed: 110,
    climbSpeed: 450,
    playerJump: 900,
    timeAddMonster: 2,
    localStorageName: "ChickenUP"
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
        game.load.image("gover", 'Assets/gameover.png');
        game.load.image("restart", 'Assets/restart.png');
        game.load.image("ladder", 'Assets/ladder.png');
        game.load.spritesheet('monster', 'Assets/monsters.png', 42, 38, 4);
        game.load.spritesheet("button1", 'Assets/playbutton.png', 350, 151, 2);
        game.load.spritesheet("button2", 'Assets/button.png', 230, 110, 2);
        game.load.image("instruct", 'Assets/instruct.png');
        game.load.image("background", 'Assets/sky.png');
        game.load.image("title", 'Assets/title.png');
        game.load.spritesheet("hero", 'Assets/chicken.png',40,58);
        game.load.audio('menusong', ['Assets/soundfx/menusong.mp3', 'Assets/soundfx/menusong.ogg'])
        game.load.audio('jump', ['Assets/soundfx/jump.mp3', 'Assets/soundfx/jump.ogg']);
        game.load.audio('ost', ['Assets/soundfx/ost.mp3', 'Assets/soundfx/ost.ogg']);
        game.load.audio('dead', ['Assets/soundfx/dead.mp3', 'Assets/soundfx/dead.ogg']);

    },
    create: function(){
      game.physics.startSystem(Phaser.Physics.ARCADE);
      music = game.add.audio('menusong');
      jumpfx = game.add.audio('jump');
      ostfx = game.add.audio('ost');
      deadfx = game.add.audio('dead');
      music.play();

      background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
      game.keyboard = game.input.keyboard;
      title = game.add.sprite(500, 520, 'title');
      title.anchor.setTo(0.5, 0.5);
      game.keyboard = game.input.keyboard;
      button = game.add.button(660, 450, 'button2', this.start, this, 1, 0, 1);
      button.anchor.setTo(0.5, 0.5);
      game.add.tween(button.scale).to( { x: 1.1, y: 1.1 }, 250, "Sine.easeInOut", true, 0, -1, true);
      game.add.sprite(0,880,'instruct');
    },
    update: function(){
      background.tilePosition.y += 1;
      if(game.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        button.frame = 1;
        this.start();
      }
      /*if(!music.isPlaying){
        music.restart();
      }*/
    },
    start: function(){
      button.setFrames(4, 3, 5);
      music.destroy();
      game.state.start("PlayGame");
    }
}
var gameOver = function(game){}
gameOver.prototype = {
  create: function(){
    deadfx.play();
    jumpfx.stop();
    ostfx.stop();
    background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
    gover = game.add.sprite(0, 250, 'gover');
    again = game.add.sprite(0, 700, 'restart');
    showscore = game.add.text(500, 450, 'SCORE\n' + counter, { font: "50px Arial", fill: "#ffffff", stroke: "#0000000", strokeThickness: 6, align: "center" });
    showscore.anchor.setTo(0.5,0.5);
    showscore.setShadow(2, 2, "#5C5C5C", 2, true, false);
    /*if(localStorage.getItem('highscore')<counter)
    localStorage.setItem('highscore',counter);
    if(localStorage.getItem('highscore')==null)
    localStorage.setItem('highscore',0);*/
    if(counter > savedData.counter){
      savedData.counter = counter;
    }
    highScoreText = game.add.text(500,600, 'BEST\n' + savedData.counter.toString(), { font: "50px Arial", fill: "#ffffff", stroke: "#0000000", strokeThickness: 6, align: "center" });
    highScoreText.anchor.setTo(0.5,0.5);
    highScoreText.setShadow(2, 2, "#5C5C5C", 2, true, false);

    /*highscore = game.add.text(500,600, 'BEST\n' + localStorage.getItem('highscore'), { font: "50px Arial", fill: "#ffffff", stroke: "#0000000", strokeThickness: 6, align: "center" });
    highscore.setShadow(2, 2, "#5C5C5C", 2, true, false);
    highscore.anchor.setTo(0.5,0.5);*/
    counter = 0;
  },
  update: function(){
    background.tilePosition.y += 1;
    if (game.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) game.state.start("PlayGame");
  }
}
var playGame = function(game){}
playGame.prototype = {
    create: function(){
      savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {counter : 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
      ostfx.play();
      game.background = game.add.tileSprite(0, 0, 1000, 1050, 'background');
      this.canJump = true;
      this.isClimbing = false;
      this.defineGroups();
      this.drawLevel();
      text = game.add.text(500, 225 , '0', { font: "70px Arial", fill: "#FFFFFF", stroke: "#0000000", strokeThickness: 6, align: "center" });
      text.setShadow(2, 2, "#5C5C5C", 2, true, false);
      text.anchor.setTo(0.5, 0.5);
      this.defineTweens();
    },
    drawLevel: function(){
        this.currentFloor = 0;
        this.currentLadder = 0;
        this.currentMonster = 0;
        this.currentMonster_2 = 0;
        this.highestFloorY = game.height * gameOptions.floorStart;
        this.floorArray = [];
        this.ladderArray = [];
        this.monsterArray = [];
        this.monster_2Array = [];
        this.isMovingRight = true;
        while(this.highestFloorY > - 3 * gameOptions.floorGap){
                this.addFloor();
                if(this.currentFloor >= 0){
                  this.addLadder(this.highestFloorY);
                  this.addMonster();
                  randomAry = [3,4,5,6];
                  randomM2 = game.rnd.pick(randomAry);
                  if(this.currentFloor == randomM2){
                    this.addMonster_2();
                  }
                }
                this.highestFloorY -= gameOptions.floorGap;
                this.currentFloor ++;
        }
        this.currentFloor = 0;
        this.addHero();
    },
    addMonster: function(){
      var ary = [38, 116],
          aryM = [gameOptions.monsterSpeed*(-1), gameOptions.monsterSpeed];
      var randomY = game.rnd.pick(ary),
          randomVecM = game.rnd.pick(aryM);
      var monster = game.add.sprite((game.width / 2)*(this.currentFloor % 2) + game.rnd.between(400, 458), this.highestFloorY-38, 'monster');
      monster.frame = game.rnd.integerInRange(0, 2);
      monster.anchor.setTo(0.5, 0);
      this.monsterGroup.add(monster);
      game.physics.enable(monster, Phaser.Physics.ARCADE);
      this.monsterArray.push(monster);
      monster.body.velocity.x = gameOptions.monsterSpeed;
      monster.scale.x = 1;
      /*monster.body.onWorldBounds = new Phaser.Signal();
      monster.body.onWorldBounds.add(function(sprite, up, down, left, right){
          if(left){
              //this.isMovingRight = true;
              monster.scale.x = 1;
          }
          if(right){
              //this.isMovingRight = false;
              monster.scale.x = -1;
          }
      }, this);*/
    },
    addMonster_2: function(){
      var aryM = [gameOptions.monsterSpeed*(-1), gameOptions.monsterSpeed];
      var randomY = game.rnd.between(76, 116),
          randomVecM = game.rnd.pick(aryM),
          randomX = game.rnd.between(42, 958);
      var monster_2 = game.add.sprite(randomX , this.highestFloorY+76, 'monster');
      monster_2.frame = 3
      monster_2.anchor.setTo(0.5, 0);
      this.monster_2Group.add(monster_2);
      game.physics.enable(monster_2, Phaser.Physics.ARCADE);
      this.monster_2Array.push(monster_2);
      monster_2.body.velocity.x = gameOptions.monster_2Speed;
      //monster_2.body.velocity.y = randomVecM;
      monster_2.scale.x = 1;
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
        this.hero = game.add.sprite(5 , game.height * gameOptions.floorStart - 100, "hero");
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
        this.monster_2Group = game.add.group();
        this.gameGroup.add(this.floorGroup);
        this.gameGroup.add(this.ladderGroup);
        this.gameGroup.add(this.monsterGroup);
        this.gameGroup.add(this.monster_2Group);
    },
    update: function(){
        game.background.tilePosition.y += 1;
        this.checkCollision();
        this.checkLadderCollision();
        this.checkLadder_2Collision();
        this.heroOnLadder();
        this.updateMonster();
        this.updateMonster_2();
        this.updateHero();
        this.updateMusic();
    },
    updateMusic: function(){
      if(!ostfx.isPlaying){
        ostfx.restart();
      }
    },
    updateHero: function(){
      if (!this.isClimbing){
        if(game.keyboard.isDown(Phaser.Keyboard.UP)){
          if(this.canJump){
              jumpfx.play();
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
          if(this.monsterArray[i].position.x<521){
            this.monsterArray[i].body.velocity.x=gameOptions.monsterSpeed;
            this.monsterArray[i].scale.x = 1;
          }
          if(this.monsterArray[i].position.x>958){
            this.monsterArray[i].body.velocity.x=-gameOptions.monsterSpeed;
            this.monsterArray[i].scale.x = -1;
          }
        }else{
          if(this.monsterArray[i].position.x<42){
            this.monsterArray[i].body.velocity.x=gameOptions.monsterSpeed;
            this.monsterArray[i].scale.x = 1;
          }
          if(this.monsterArray[i].position.x>458){
            this.monsterArray[i].body.velocity.x=-gameOptions.monsterSpeed;
            this.monsterArray[i].scale.x = -1;
          }
        }
      }
    },
    updateMonster_2: function(){
      for(var n = 0; n<this.monster_2Array.length;n++){
        if (n %2 == 1){
          if(this.monster_2Array[n].position.x<42){
            this.monster_2Array[n].body.velocity.x=gameOptions.monsterSpeed;
            this.monster_2Array[n].scale.x = 1;
          }
          if(this.monster_2Array[n].position.x>958){
            this.monster_2Array[n].body.velocity.x=-gameOptions.monsterSpeed;
            this.monster_2Array[n].scale.x = -1;
          }
          /*if(this.monster_2Array[n].position.y<this.highestFloorY-76){
            this.monster_2Array[n].body.velocity.y=-gameOptions.monsterSpeed;
          }
          if(this.monster_2Array[n].position.y>this.highestFloorY-96){
            this.monster_2Array[n].body.velocity.y=gameOptions.monsterSpeed;
          }*/
        }else{
          if(this.monster_2Array[n].position.x<42){
            this.monster_2Array[n].body.velocity.x=gameOptions.monsterSpeed;
            this.monster_2Array[n].scale.x = 1;
          }
          if(this.monster_2Array[n].position.x>958){
            this.monster_2Array[n].body.velocity.x=-gameOptions.monsterSpeed;
            this.monster_2Array[n].scale.x = -1;
          }
          /*if(this.monster_2Array[n].position.y<this.highestFloorY-76){
            this.monster_2Array[n].body.velocity.y=-gameOptions.monsterSpeed;
          }
          if(this.monster_2Array[n].position.y>this.highestFloorY-96){
            this.monster_2Array[n].body.velocity.y=gameOptions.monsterSpeed;
          }*/
        }
      }
    },
    checkCollision: function(){
      //monster collision check
      game.physics.arcade.collide(this.monsterArray, this.hero, function(){
        game.state.start('GameOver');
      }, null, this);
      game.physics.arcade.collide(this.monster_2Array, this.hero, function(){
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
                //this.fadeMonster_2.target =  this.monster_2Array[this.currentMonster_2];
                //this.fadeMonster_2.start();
                //this.currentMonster_2 = (this.currentMonster_2+1) % this.monster_2Array.length;
            }
        }, null, this);
    },
    checkLadder_2Collision: function(){
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
                this.fadeMonster_2.target =  this.monster_2Array[this.currentMonster_2];
                this.fadeMonster_2.start();
                this.currentMonster_2 = (this.currentMonster_2+1) % this.monster_2Array.length;
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
                this.monster_2Group.forEach(function(item) {
                    item.y += gameOptions.floorGap;
                }, this);
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
                counter++;
                text.setText(counter);
                localStorage.setItem(gameOptions.localStorageName,JSON.stringify({
                        counter: Math.max(counter, savedData.counter)
                 }));
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

        this.fadeMonster_2 = game.add.tween(this.monster_2Array[0]).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.Out);
        this.fadeMonster_2.onComplete.add(function(monster_2){
                monster_2.y = this.highestFloorY-40;
                monster_2.alpha =1;
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
