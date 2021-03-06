export function sendPercentileTestToChat(actor, skill, target){
    let roll = new Roll('d100', actor.data.data).roll();
    let total = roll.total;
    let isCritical = false;
    let isSuccess = false;
    let html = '';
    let label = `Rolling ${skill.toUpperCase()} Target ${target}`;
    let resultString = '';
    let styleOverride = '';

    isCritical = skillCheckResultIsCritical(total);

    if(total <= target){
      isSuccess = true;
    }

    if(isCritical){
      resultString = 'CRITICAL ';
    }

    if(isSuccess){
      resultString += "Success";

      if(isCritical){
        resultString = resultString.toUpperCase() + '!';
        styleOverride="color: green";
      }
    }
    else{
      resultString += "Failure";

      if(isCritical){
        resultString = resultString.toUpperCase() + '!';
        styleOverride="color: red";
      }
    }

    html = `<div class="dice-roll">`
    html += `     <div class="dice-result">`
    html += `     <div style="${styleOverride}" class="dice-formula">${resultString}</div>`
    html += `     <div class="dice-tooltip">`
    html += `          <section class="tooltip-part">`
    html += `               <div class="dice">`
    html += `                    <p class="part-formula">`
    html += `                         ${roll.formula}`
    html += `                         <span class="part-total">${roll.total}</span>`
    html += `                    </p>`
    html += `                    <ol class="dice-rolls">`
    html += `                         <li class="roll die ${roll.formula}">${roll.total}</li>`
    html += `                    </ol>`
    html += `               </div>`
    html += `          </section>`
    html += `     </div>`
    html += `     <h4 class="dice-total">${roll.total}</h4>`
    html += `</div>`

    let chatData = {
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: html,
      flavor: label
      };

    // play the dice rolling sound, like a regular in-chat roll
	AudioHelper.play({src: "sounds/dice.wav", volume: 0.8, autoplay: true, loop: false}, true);

    ChatMessage.create(chatData, {});
  }

  export function skillCheckResultIsCritical(rollResult){
    let isCritical = false;

    if(rollResult === 1 || rollResult === 100){
      // really good, or reeaaaally bad
      isCritical = true;
    }
    else if(rollResult % 11 === 0){
      // any matching dice are a crit, i.e. 11, 22, 33...99.
      isCritical = true;
    }

    return isCritical;
  }

  export function sendLethalityTestToChat(actor, weaponName, target){
    let roll = new Roll('d100', actor.data.data).roll();
    let isCritical = false;
    let skillCheckTotal = roll.total;
    

    // page 57 of agent's handbook
    // Lethality rolls do not fumble or critically succeed, but the attack roll can.
    // In this situation, the lethality threshold doubles (e.g. 20% would become 40%),
    // and if the lethality roll fails, the damage is doubled per normal.  However right now
    // the attack roll and damage roll are completely separate... Perhaps in the future, use a
    // button in the skill check roll to allow doubling this logic?

    // try to determine what the d100 result would be as if it was two d10's being rolled
    let damageDie1 = Math.floor(skillCheckTotal / 10);
    let damageDie2 = skillCheckTotal - (damageDie1 * 10);
    if(damageDie2 === 0){
      // if the result is evenly divisible by 10 (e.g. 30, 40, 50...) 
      // then the percentile die result was actually one lower than the calculation above would show.
      // For example, a '70' is actually a 60 + 10, so the damage die should be 6 + 10 = 16, not 7 + 0 = 7.
      damageDie1 -= 1;
      damageDie2 = 10;
    }

    let damageDie1Label = damageDie1.toString();
    let damageDie2Label = damageDie2.toString();

    if(damageDie1 === 0){
      // a roll of 00 on the tens part of the d100 counts as a ten if it becomes a damage die
      // Will leave the labeling as a '0' though, to be consistent with a regular d10 roll
      damageDie1 = 10;
    }

    if(damageDie2 === 10){
      // keep the labelling consistent, show a '0' for a ten
      damageDie2Label = '0';
    }

    let nonlethalDamage = damageDie1 + damageDie2;
    
    let isLethal = false;
    let html = '';
    let label = `Rolling LETHALITY for ${weaponName.toUpperCase()} Target ${target}`;
    let resultString = '';
    let styleOverride = '';

    if(skillCheckTotal <= target){
      isLethal = true;
      resultString = "LETHAL";
      styleOverride="color: red";
    }
    else{
      resultString = "Fail";
    }

    html = `<div class="dice-roll">`;
    html += `     <div class="dice-result">`;
    html += `     <div style="${styleOverride}" class="dice-formula">${resultString}</div>`;
    html += `     <div class="dice-tooltip">`;
    html += `          <section class="tooltip-part">`;
    html += `               <div class="dice">`;
    html += `                    <p class="part-formula">`;
    html += `                         d100 OR d10 + d10`;
    html += `                         <span class="part-total">${roll.total}</span>`;
    html += `                    </p>`;
    html += `                    <ol class="dice-rolls">`;
    //html += `                         <li class="roll die d100">${roll.total}</li>`
    html += `                         <li class="roll die d10">${damageDie1Label}</li>`;
    html += `                         <li class="roll die d10">${damageDie2Label}</li>`;
    html += `                    </ol>`;
    html += `               </div>`;
    html += `          </section>`;
    html += `     </div>`;
    html += `     <h4 class="dice-total">${roll.total} (${nonlethalDamage} Damage)</h4>`;
    html += `</div>`;

    let chatData = {
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: html,
      flavor: label
      };

    // play the dice rolling sound, like a regular in-chat roll
	AudioHelper.play({src: "sounds/dice.wav", volume: 0.8, autoplay: true, loop: false}, true);

    ChatMessage.create(chatData, {});
  }

  export function sendDamageRollToChat(actor, label, diceFormula){
    let roll = new Roll(diceFormula, actor.data.data);

    label = `Rolling damage for ${label.toUpperCase()}`;

    roll.roll().toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: label
    });
  }