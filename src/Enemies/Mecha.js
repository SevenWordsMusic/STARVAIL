import Enemy from "./Enemy.js";
import DropableGroundEnergy from "../Objects/Dropables/DropableGroundEnergy.js"
import EnemyGun from "./EnemyGun.js";

//enemigo que hereda de Enemy
export default class Mecha extends Enemy {
  constructor(scene, x, y){
    super(scene, x, y, 'mecha', 500);
    this.sprite.setScale(2.5);

    //this.sprite.setBounce(1.01735).setFixedRotation().setFriction(0).setFrictionAir(0).setFrictionStatic(0);
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const body = Bodies.rectangle(0, 0, 70, 90, {chamfer: { radius: 8 } });
    /*this.sensors = {
      left: Bodies.rectangle(-25, 6, 10, 20, { isSensor: true }),
      right: Bodies.rectangle(25 , 6, 10, 20, { isSensor: true }),
      bottom: Bodies.rectangle(0, 60, 10, 10, { isSensor: true })
    };*/

    this.sensor = Bodies.rectangle(0, 65, 10, 10, { isSensor: true });
    const compoundBody = Body.create({
      parts: [body, this.sensor]
    });

    this.sprite.setExistingBody(compoundBody).setPosition(x, y).setFixedRotation();
    this.scene.bulletInteracBodies[this.currentBodyIndex] = body;
    this.scene.enemyController.enemyBodies[this.currentEnemyIndex] = body;
    this.sprite.body.collisionFilter.group = -1;
    this.sprite.body.restitution = 0.4;
    this.sprite.setOrigin(0.5,0.6);

    this.adjustedFriction = this.sprite.body.friction / this.scene.matter.world.getDelta();


    //Variables de IA
    //No Tocar
    this.patrolDir = (Math.round(Math.random()) == 1)?1:-1;
    this.standByReDistance = 700;
    this.patrolDistance = 650;
    this.initPos = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    this.traveledDistance = 0;
    this.playerVector = new Phaser.Math.Vector2(0, 0);
    this.leftMultiply = 1;
    this.rightMultiply = 1;
    //No Tocar

    //Ajustar estas
    this.patrolRouteLength = 100*this.scene.matter.world.getDelta();  //al patrullar cuanto se desplaza antes de darse la vuelta
    this.patrolSpeed = 1.5/this.scene.matter.world.getDelta();        //velocidad al patrullar
    this.detectDistance = 500;                                        //distancia a la uqe detecta el jugador cuando esta patrullando
    this.detectSpeed = 1.5/this.scene.matter.world.getDelta();        //velocidad al detectarlo
    this.retreatDistance = 300;                                            //distancia de la cual se pone a huir
    this.hitDamage = 10;                                                //daño al golpear
    this.fireRate = 400;                                               //fire rate del droid
    this.energyDrop = 100;                                             //drop de energia
    //Ajustar estas
    //Variables de IA

    this.gun = new EnemyGun(scene, this.sprite.x, this.sprite.y, this.hitDamage);


    /*this.scene.matterCollision.addOnCollideStart({
      objectA: [this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });*/
    this.scene.matterCollision.addOnCollideEnd({
      objectA: this.sensor,
      callback: this.onSensorCollide2,
      context: this
    });

    //IA
    //this.initializeAI(4);
    this.initializeAI(3);
    this.stateOnStart(0, function(){
      if(this.sprite.body === undefined)return;
      this.sprite.setIgnoreGravity(true);
      this.sprite.setVelocityX(0);
      this.sprite.setVelocityY(0);
      this.sprite.body.friction = 10;
      this.gun.followPosition(this.sprite.x, this.sprite.y);
    });
    this.stateOnEnd(0,function(){
      if(this.sprite.body === undefined)return;
      this.sprite.body.friction = 0.1;
      this.sprite.setIgnoreGravity(false);
      this.gun.followPosition(this.sprite.x, this.sprite.y);
    })
    this.stateOnStart(1, function(){
      if(this.sprite.body === undefined)return;
      this.sprite.body.friction = 0.1;
      this.sprite.setIgnoreGravity(false);
      this.gun.followPosition(this.sprite.x, this.sprite.y);
    });
    this.stateUpdate(1, function(time, delta){
      if(this.sprite.body === undefined)return;

      this.sprite.setVelocityX(this.patrolSpeed * this.patrolDir * ((this.patrolDir>=0)?this.rightMultiply:this.leftMultiply) * delta);
      this.traveledDistance += delta;
      if(this.traveledDistance >= this.patrolRouteLength){
        this.traveledDistance = 0;
        this.patrolDir = -this.patrolDir;
      }
      this.gun.followPosition(this.sprite.x, this.sprite.y);

    })
    this.stateOnStart(2, function(){
      this.fireTimer = this.scene.time.addEvent({
        delay: this.fireRate,
        callback: () => (this.gun.shoot()),
        repeat: -1
      },this);
    })
    this.stateUpdate(2, function(time, delta){
      if(this.sprite.body === undefined)return;
      this.playerVector.x = this.scene.game.player.sprite.x - this.sprite.x;
      this.playerVector.y = this.scene.game.player.sprite.y - this.sprite.y;
      this.distanceToCheck = Math.sqrt( Math.pow(this.playerVector.x ,2) +  Math.pow(this.playerVector.y ,2));
      if(this.distanceToCheck <= this.retreatDistance){
        this.sprite.setVelocityX(this.detectSpeed * delta * ((this.playerVector.x >= 0)?-this.leftMultiply:this.rightMultiply));
      }
      else{
        this.sprite.setVelocityX(this.detectSpeed * delta * ((this.playerVector.x >= 0)?this.rightMultiply:-this.leftMultiply));
      }

      this.gun.followPosition(this.sprite.x, this.sprite.y);
      this.gun.aimGun(this.playerVector.angle());
    })
    this.stateOnEnd(2, function(){
      this.fireTimer.remove();
    })

    this.startAI();
    //IA
  }

  update(time, delta){
    super.update(time, delta);
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
     if(this.scene.tileBodyMatrix[Math.floor(bodyB.position.x/32) - 2][Math.floor(bodyB.position.y/32)] === undefined){
       this.leftMultiply = 0;
     }else{
       this.leftMultiply = 1;
     }
     if(this.scene.tileBodyMatrix[Math.floor(bodyB.position.x/32) + 2][Math.floor(bodyB.position.y/32)] === undefined){
       this.rightMultiply = 0;
     }else{
       this.rightMultiply = 1;
     }
  }

  inflictDamagePlayerArea(position){
    if(this.sprite.body === undefined)return;
    this.scene.graphics.clear();
    this.scene.graphics.fillRect(this.sprite.x-50, this.sprite.y-50, 100, 100);
    if(super.playerHit(this.sprite.x-50, this.sprite.y-50, this.sprite.x+50, this.sprite.y+50))
      this.scene.game.player.playerDamage(this.hitDamage);
  }


  damage(dmg, v){
    if(this.currentStateId() == 1)
      this.goTo( 2);
    if(this.currentStateId() != 0)
      super.damage(dmg, v);
  }
  damageLaser(dmg, v){
    if(this.currentStateId() == 1)
      this.goTo(2);
    if(this.currentStateId() != 0)
      super.damageLaser(dmg, v);
  }

  enemyDead(vXDmg){
    this.goTo(0);
    if(!this.dead){
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
        if(dist <= this.detectDistance)
          this.goTo(2);
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
      case 2:
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
      case 3:
        if(dist > this.standByReDistance)
          this.goTo(0);
      break;
    }
  }
}