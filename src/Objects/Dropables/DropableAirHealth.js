import DropableAir from "./DropableAir.js";
import Audio from "../../Audio.js";
export default class DropableAirHealth extends DropableAir{
  constructor(scene, x, y, dirX, dirY, hp){
    super(scene, x, y, 'drop', 10000);
    this.hp = hp;
    this.bounce(5.01, dirX, 5.01, dirY);
    this.sprite.setFrame(0);
  }

  dropablePicked(drop){
    //AUDIO
      Audio.play3DinstanceNoRate(this,69);
    //
    this.scene.game.player.playerGainEnergy(Math.min(this.energy, this.scene.game.totalPlayerEnergy-this.scene.game.player.energy));
    super.dropablePicked(drop);
  }

  dropableExpire(drop){
    super.dropableExpire(drop);
  }

  distanceToPlayer(){
    if(this.sprite != undefined)
      return Math.sqrt(Math.pow(this.sprite.x - this.scene.game.player.sprite.x,2) + Math.pow(this.sprite.y - this.scene.game.player.sprite.y,2));
    else
      return 1000;    //ARREGLAR ESTO
  }
  
}