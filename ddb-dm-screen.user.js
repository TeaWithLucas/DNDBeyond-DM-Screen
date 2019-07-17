// ==UserScript==
// @name         ddb-dm-screen
// @namespace    https://github.com/mivalsten/ddb-dm-screen
// @version      1.2.7hf3
// @description  Poor man's DM screen for DDB campaigns
// @author       You
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// ==/UserScript==
//
var $ = window.jQuery;

class Character {
  constructor(json) {
    this.json = json;
    this.stats = new Object();

    this.level = 0;
    for (var i= 0; i < json.classes.length; i++) {
        this.level += json.classes[i].level;
    };
    this.proficiency = Math.ceil(this.level / 4) + 1;

    var stat = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    for(var i = 0; i < 6; i++){
      if (json.overrideStats[i].value == null) {
        this.stats[stat[i]] = new Stat(json.stats[i].value + json.bonusStats[i].value, this.proficiency);
      } 
      else {
        this.stats[stat[i]] = new Stat(json.overrideStats[i].value, this.proficiency);
      }
    }

    // modifiers
    var mods = json.modifiers; 
    [mods.race, mods.class, mods.background, mods.item, mods.feat].forEach(function(m){
      if (m.type == "bonus") {
        this.stats[m.subType.substr(0,3)].value += m.value;
      }
      else if (m.type == "proficiency") {
        if(m.subType == 'strength-saving-throws') {
          this.stats.str.saveProficiency = 1;
        }
        else {
          this.stats[m.subType.substr(0,3)].saveProficiency = true;
        }
      }
      else if (m.type == "set") {
        this.stats[m.subType.substr(0,3)].value = m.value;
      };
    });
  };

  get name(){
    return this.json.name;
  }

  get id(){
    return this.json.name.replace(/[^0-9a-zA-Z]+/g, '');
  }

  get iframe(){
    return $(`#frame-${this.id}`).contents();
  }

  get ac(){
    var val = this.iframe
       .find(".ct-combat-mobile__extra--ac")
       .find(".ct-combat-mobile__extra-value")
       .text();
    return parseInt(val);
  }

  get currentHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-current").text());
  }

  get maxHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-max").text());
  }

  get passivePerception(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Perception))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }

  get passiveInsight(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Insight))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }

  get passiveInvestigation(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Investigation))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }
};

class Stat {
  // class methods
  constructor(value, proficiency) {
      this.value = value;
      this.saveProficiency = false;
      this.bonus = Math.floor((value / 2) - 5)
      this.proficiency = proficiency;
  };

  modifier(){
    if(this.bonus > 0){
      return `+${this.bonus.toString()}`;
    }
    else{
      return this.bonus.toString();
    }
  };
  savingThrow() {
    if (this.saveProficiency) {
      var save = this.bonus + this.proficiency
      if(save > 0) {
        return "+" + save.toString();
      } 
      else {
        return save.toString()
      }
    }
    else {
      return this.modifier();
    }
  };
};

function render(character, node){
  var tableId = `character-details-${character.id}`;

  var div = `
    <div>
      <table id="${tableId}">
        <thead>
          <tr>
            <th></th>
            <th align="center">Value</th>
            <th align="center">Modifier</th>
            <th align="center">Saving throw</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  var statRow = `
    <tr>
      <th>title</th>
      <td align="center">value</td>
      <td align="center">mod</td>
      <td align="center">save</td>
    </tr>
  `;

  var otherRow = `
    <tr>
      <th>name</th>
      <td align="center">value</td>
      <td></td><td></td>
    </tr>
  `;

  node.parents('.ddb-campaigns-character-card').after(div);
  var footer = $(`#${tableId} > tbody:last-child`);
  for(var s in character.stats){
    var text = statRow
      .replace("title", s.toUpperCase())
      .replace("value", character.stats[s].value)
      .replace("mod", character.stats[s].modifier())
      .replace("save", character.stats[s].savingThrow());
    footer.append(text);
  }
  footer.append(otherRow.replace("name", "Proficiency").replace("value", `+${character.proficiency}`));
  footer.append(otherRow.replace("name", "HP").replace("value", `${character.currentHP} / ${character.maxHP}`));
  footer.append(otherRow.replace("name", "AC").replace("value", character.ac));
  footer.append(otherRow.replace("name", "Passive Investigation").replace("value", character.passiveInvestigation));
  footer.append(otherRow.replace("name", "Passive Perception").replace("value", character.passivePerception));
  footer.append(otherRow.replace("name", "Passive Insight").replace("value", character.passiveInsight));
}
 
(function() {
  $('#site').after('<div id="iframeDiv" style="display: none;"></div>');
  $('.ddb-campaigns-character-card-footer-links-item-view').each(function(index, value) {
      let node = $(this);

      if (!node.parents().hasClass('ddb-campaigns-detail-body-listing-inactive')) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText).character;
            let character = new Character(json);

            $('#iframeDiv').append(`<iframe id="frame-${character.id}"  src="${node.attr('href')}"></iframe>`);
            //let the iframe load, then render..
            setTimeout(function () { render(character, node); }, 5000);
          }
        }
        request.open("GET", `${node.attr('href')}/json`, true);
        request.send();
      }
    }
  );
})();
