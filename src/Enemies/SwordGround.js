import Enemy from "./Enemy.js";
import DropableGroundEnergy from "../Objects/Dropables/DropableGroundEnergy.js"
import Audio from "../Audio.js";
import TileController from "../TileController.js"

//enemigo que hereda de Enemy
export default class SwordGround extends Enemy {
  constructor(scene, x, y){
    super(scene, x, y, 'hero', 120);
    this.sprite.setScale(2);

    //this.sprite.setBounce(1.01735).setFixedRotation().setFriction(0).setFrictionAir(0).setFrictionStatic(0);
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const body = Bodies.rectangle(0, 0, 30, 50);
    /*this.sensors = {
      left: Bodies.rectangle(-25, 6, 10, 20, { isSensor: true }),
      right: Bodies.rectangle(25 , 6, 10, 20, { isSensor: true }),
      bottom: Bodies.rectangle(0, 60, 10, 10, { isSensor: true })
    };
    const compoundBody = Body.create({
      parts: [body, this.sensors.left, this.sensors.right, this.sensors.bottom]
    });

    this.sprite.setExistingBody(compoundBody).setOrigin(0.52, 0.55).setPosition(x, y).setFixedRotation();*/
    this.sprite.setExistingBody(body).setPosition(x, y).setFixedRotation().setOrigin(0.5,0.79);
    this.scene.bulletInteracBodies[this.currentBodyIndex] = body;
    this.scene.enemyController.enemyBodies[this.currentEnemyIndex] = body;
    this.sprite.body.collisionFilter.group = -3;
    this.sprite.body.restitution = 0.4;

    this.adjustedFriction = this.sprite.body.friction / this.scene.matter.world.getDelta();

    //Variables de IA
    //No Tocar
    this.patrolDir = (Math.round(Math.random()) == 1)?1:-1;
    this.standByReDistance = 950;
    this.patrolDistance = 900;
    this.initPos = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    this.traveledDistance = 0;
    this.playerVector = new Phaser.Math.Vector2(0, 0);
    this.targetDir = false;
    //No Tocar

    //Ajustar estas
    this.points = 50;               //puntos al matar a enemigo
    this.patrolRouteLength = 100*this.scene.matter.world.getDelta();  //al patrullar cuanto se desplaza antes de darse la vuelta
    this.patrolSpeed = 1/this.scene.matter.world.getDelta();        //velocidad al patrullar
    this.detectDistance = 250;                                        //distancia a la uqe detecta el jugador cuando esta patrullando
    this.detectSpeed = 3.5/this.scene.matter.world.getDelta();        //velocidad al detectarlo
    this.hitDistance = 70;                                            //distancia de la cual se pone a golpear
    this.hitSpeed = 1/this.scene.matter.world.getDelta();           //pequeña velocidad mientras está golpeando
    this.hitDamage = 80;                                              //daño al golpear
    this.energyDrop = 150;                                             //drop de energia
    //Ajustar estas
    //Variables de IA

    /*this.scene.matterCollision.addOnCollideStart({
      objectA: [this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });
    this.scene.matterCollision.addOnCollideEnd({
      objectA: this.sensors.bottom,
      callback: this.onSensorCollide2,
      context: this
    });*/

    //IA
    this.initializeAI(4);
    this.stateOnStart(0, function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      this.sprite.anims.stop();
      this.sprite.setIgnoreGravity(true);
      this.sprite.setVelocityX(0);
      this.sprite.setVelocityY(0);
      this.sprite.body.friction = 10;
      TileController.disableEnemy(this.sprite);
    });
    this.stateOnEnd(0,function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      TileController.enableEnemy(this.sprite);
      this.sprite.body.friction = 0.1;
      this.sprite.setIgnoreGravity(false);
    })
    this.stateOnStart(1, function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      this.sprite.body.friction = 0.1;
      this.sprite.setIgnoreGravity(false);
      this.sprite.anims.setTimeScale(1);
      this.sprite.anims.play('heroRun', true);
    });
    this.stateUpdate(1, function(time, delta){
      if(this.sprite == undefined || this.sprite.body == undefined)return;

      this.sprite.setVelocityX(this.patrolSpeed * this.patrolDir * delta);
      this.traveledDistance += delta;
      if(this.traveledDistance >= this.patrolRouteLength){
        this.traveledDistance = 0;
        this.patrolDir = -this.patrolDir;
      }
      this.sprite.setFlipX(this.sprite.body.velocity.x<0);
    })
    this.stateOnStart(2, function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      this.sprite.anims.setTimeScale(1.5);
      this.sprite.anims.play('heroRun', true);
    });
    this.stateUpdate(2, function(time, delta){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      this.sprite.setFlipX(this.scene.game.player.sprite.x<this.sprite.x);

      this.playerVector.x = this.scene.game.player.sprite.x - this.sprite.x;
      this.playerVector.y = this.scene.game.player.sprite.y - this.sprite.y;
      this.distanceToCheck = Math.sqrt( Math.pow(this.playerVector.x ,2) +  Math.pow(this.playerVector.y ,2));
      if(this.distanceToCheck > this.hitDistance){
        if(Math.abs(this.playerVector.x) > this.hitDistance/2)
          this.sprite.setVelocityX(this.detectSpeed * Math.sign(this.playerVector.x) * delta);
        //console.log("persuing");
      }else{
        this.targetDir = this.scene.game.player.sprite.x<this.sprite.x;
        this.sprite.setFlipX(this.targetDir);
        this.goTo(3)
      }
    })
    this.stateOnStart(3, function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      //this.sprite.body.collisionFilter.group = -1;
      this.sprite.setFlipX(this.targetDir);
      this.sprite.anims.setTimeScale(1);
      this.sprite.anims.play('heroAttack', true)
      this.sprite.once('animationcomplete', function(){
        this.goTo(2);
      },this);
      this.scene.time.addEvent({
        delay: 500,
        callback: () => (this.inflictDamagePlayerArea(this.targetDir))
      },this);
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => (this.tryFlipX())
      },this);
      this.scene.time.addEvent({
        delay: 1500,
        callback: () => (this.inflictDamagePlayerArea(this.targetDir))
      },this);
    });

    this.stateUpdate(3, function(time, delta){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      this.sprite.setVelocityX(this.hitSpeed * Math.sign(this.scene.game.player.sprite.x - this.sprite.x) * delta);
    });

    this.stateOnEnd(3, function(){
      if(this.sprite == undefined || this.sprite.body == undefined)return;
      //this.sprite.body.collisionFilter.group = 0;
    });
    this.startAI();
    //IA

    //AUDIO
      this.sfx=Audio.play3DenemyInstance(this, 48);
      this.sfxDetect=Audio.play2Dinstance(54);
      this.stateChanged=false;
    //
  }
  tryFlipX(){
    if(this.sprite != undefined && this.sprite.body != undefined){
      this.targetDir =  this.scene.game.player.sprite.x<this.sprite.x;
      this.sprite.setFlipX(this.targetDir);
    }
  }

  update(time, delta){
    if(this.sprite == undefined || this.sprite.body == undefined)return
    super.update(time, delta);
      //AUDIO
        this.sfx.volume=Audio.volume3D(this);
        this.sfxDetect.volume=Audio.volume3D(this);
      //
  }

  updateTouchBoundry(){
    if(this.sprite != undefined)
      TileController.enemyHalfTouchBoundry(this.scene, this.sprite, 1, 2, 10);
  }

  onSensorCollide({ bodyA, bodyB, pair }){
    if (bodyB.isSensor) return;
    if (bodyA === this.sensors.right)
      this.patrolDir = -1;
    else if (bodyA === this.sensors.left)
      this.patrolDir = 1;
    this.traveledDistance = 0;
  }

  onSensorCollide2({ bodyA, bodyB, pair }){
     if (bodyB.isSensor) return;
     if(this.scene.tileBodyMatrix[Math.floor(bodyB.position.x/32) + 2*this.patrolDir][Math.floor(bodyB.position.y/32)] === undefined){
       this.patrolDir = -this.patrolDir;
       this.traveledDistance = 0;
     }
  }

  inflictDamagePlayerArea(dir){
    if(this.sprite == undefined || this.sprite.body == undefined)return;
        //AUDIO
            Audio.play3Dinstance(this,74);
        //
    if(dir){
      if(super.playerHit(this.sprite.x-95, this.sprite.y-35, this.sprite.x+10, this.sprite.y+35)){
        this.scene.game.player.playerDamage(this.hitDamage, true);
      //AUDIO
          Audio.play3Dinstance(this,55);
      //
      }
    }else{
      if(super.playerHit(this.sprite.x-10, this.sprite.y-35, this.sprite.x + 95, this.sprite.y+35)){
        this.scene.game.player.playerDamage(this.hitDamage, true);
      //AUDIO
          Audio.play3Dinstance(this,55);
      //
      }
    }
  }


  damage(dmg, v){
      //AUDIO
        if(Math.random()>0.1){
          var auxSfx=Audio.play3DinstanceRnd(this,45);
        }else{
           var auxSfx=Audio.play3DinstanceRnd(this,44);
        }
          auxSfx.setDetune(auxSfx.detune+200);
      //
    if(this.currentStateId() == 1){
      //AUDIO
        this.soundChangeState();
      //
      this.goTo( 2);
    }else if(this.currentStateId() != 0)
      super.damage(dmg, v);
  }
  damageLaser(dmg, v){
    //AUDIO
      Audio.load.lasserSufferingLoop.setDetune(0);
    //
    if(this.currentStateId() == 1){
      //AUDIO
        this.soundChangeState();
      //
      this.goTo(2);
    }else if(this.currentStateId() != 0)
      super.damageLaser(dmg, v);
  }

  enemyDead(vXDmg){
    this.goTo(0);
    if(!this.dead){
      //AUDIO
          Audio.play3DinstanceRnd(this, 58);
          Audio.play3DinstanceRnd(this, 61);
          this.sfx.stop();
          this.sfxDetect.stop();
      //
      let explosion = this.scene.add.sprite(this.sprite.x, this.sprite.y, "enemyExplosion");
      explosion.setDepth(10).setScale(2.25);
      //al completar su animacion de explsion, dicha instancia se autodestruye
      explosion.on('animationcomplete', function(){
        explosion.destroy();
      });
      //animacion de explosion
      explosion.anims.play('enemyExplosion', true);
      super.enemyDead();
      new DropableGroundEnergy(this.scene, this.sprite.x, this.sprite.y, Math.sign(vXDmg),  this.energyDrop);
    }
  }

  updatePlayerPosition(dist){
    switch (this.currentStateId()) {
      case 0:
        if(dist <= this.patrolDistance)
          this.goTo(1);
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
      case 1:
        if(dist <= this.detectDistance){
          //AUDIO
            this.soundChangeState();
          //
          this.goTo(2);
        }
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
      case 2:
        //AUDIO
        this.sfxDetect.setRate(Audio.volume2D(dist)+0.75);

        //
        if(dist > this.standByReDistance){
          //AUDIO
          this.stateChanged=false;
          this.sfxDetect.stop();
          //
          this.goTo(0);
        }
      break;
      case 3:
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
    }
  }

  //AUDIO
  soundChangeState(){
    if(!this.stateChanged){
      this.sfxDetect=Audio.play3Dinstance(this, 49);
      this.stateChanged=true;
    }
  }
  //
}
