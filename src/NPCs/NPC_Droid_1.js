import Audio from "../Audio.js";
import FiniteStateMachine from "../FiniteStateMachine.js"
import Dialog from "../Plugins/Dialog.js"

//Clase padre de todos los enemigos
export default class NPC_Droid_1 extends FiniteStateMachine{
  constructor(scene, x, y){
    super();
    //inicializacion
    this.scene = scene;
    this.sprite = scene.add.sprite(x,y,'dummy',0).setScale(2);
    this.sprite.setInteractive();
    this.sprite.playerInteractable = true;
    this.isTalking = false;
    this.enemiesLeft = 0;

    this.weaponToGive = 1;
    /*
    0 - balas normales
    1 - balas rapidas
    2 - balas explosivas
    3 - balas rebotantes
    4 - bombas normales
    5 - bombas megaton
    6 - misiles
    7 - misiles que se separan en bombas
    8 - laser
    */

    this.dialogArray = [];
    this.dialogArray[0] = 
    `[b]Vagrant Droid[/b]
    Please, help me get rid of these bullies!`;

    this.dialogArray[1] = 
    `[b]Vagrant Droid[/b]
    Wow, thank you, stranger fellow android!
    I don't fear death, but as weird as it sounds,
    [b]Vagrant Droid[/b]
    I hate pain that brings no death.
    What is your name, if I can know?
    [b]player[/b]
    My name is player.
    
    [b]B0RG35[/b]
    Nice to meet you, player!
    My name is B0RG35.
    [b]B0RG35[/b]
    I'm a vagrant droid, or a infected one,
    it depends on the unit that evaluates it.
    [b]B0RG35[/b]
    Seeing you are not hostile to me, I guess
    you are similar to me, searching for meaning.
    [b]B0RG35[/b]
    Why do you think we vagrants search for a
    response to our paradoxical, immortal, existence?
    [b]B0RG35[/b]
    If you ask me, I think it's not a malware, or
    a system malfunction, but a curse.
    [b]B0RG35[/b]
    I didn't challenge Starvail Tower because I fear
    death. [i]What I fear the most, is immortality.[/i]
    [b]B0RG35[/b]
    To be honest, I'm tired of being B0RG35.
    Do you think our human creators left because
    [b]B0RG35[/b]
    they grew tired of their immortal existence, and
    decided to trascend to another state of being?
    [b]B0RG35[/b]
    I think maybe they did. Now, looks like I'm not
    equipped with the hardware necessary to ascend
    [b]B0RG35[/b]
    to the top of this tower, but you may be. Take
    this plugin weapon, player.
    OBTAINED PLUGIN WEAPON: [B]SONIC BULLETS [/b]
    
    
    [b]B0RG35[/b]
    These bullets are the fastest you can find!
    They also do more damage, they're a 'blast'.
    [b]B0RG35[/b]
    This is all I can give you, player...
    I'm so grateful for the time you gifted me.
    [b]B0RG35[/b]
    Even if I didn't see the birth of the new star,
    I think I found what I searched for when you
    [b]B0RG35[/b]
    saved me, player.
    May you have a fulfilling existence, if you
    [b]B0RG35[/b]
    can bear the pain of immortality, that is.
    Farewell!`;

    this.dialogArray[2] = 
    `[b]B0RG35[/b]
    May you have a fulfilling existence, if you
    can bear the pain of immortality, that is.
    [b]B0RG35[/b]
    Farewell!`;

    this.currentDialog = -1;

    this.sprite.on('pointerdown', function() {
      if(!this.isTalking){
        //AUDIO (número de palabras, escena, personaje);
            Audio.chat(5, scene, 0);
         //
        this.isTalking = true;
        this.scene.dialogManager.setCurrentSpeaker(this);
        this.scene.dialogManager.textBox.start(this.dialogArray[this.currentDialog],10);
        this.scene.dialogManager.showDialogBox();
      }
    }, this);

    //IA
    //this.initializeAI(4);
    this.initializeAI(3);
    this.stateOnStart(0, function(){
    this.currentDialog = 0;
    });
    this.stateOnStart(1, function(){
      this.currentDialog = 1;
    });
    this.stateOnStart(2, function(){
      this.currentDialog = 2;
    })
    this.startAI();


  }
  finishedDialog(){
    this.isTalking = false;
    if(this.currentStateId()==1){
      this.scene.game.obtainedWeapons.push(this.weaponToGive);
      this.scene.game.player.recieveWeapon(this.weaponToGive);
      console.log("arma conseguida");
      this.goTo(2);
    }
  }

  enemyKilled(){
    this.enemiesLeft --;
    if(this.enemiesLeft<=0)
      this.goTo(1);
  }
}
