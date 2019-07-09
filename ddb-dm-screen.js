// ==UserScript==
// @name         ddb-dm-screen
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  try to take over the world!
// @author       You
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// ==/UserScript==

class Stat {
  // class methods
  constructor(value) {
      this.value = value;
      this.saveProficiency = false;
  };
    bonus() {
      if (this.value == 1) {return -5;}
      else if (this.value <= 3)  {return '-4';}
      else if (this.value <= 5)  {return '-3';}
      else if (this.value <= 7)  {return '-2';}
      else if (this.value <= 9)  {return '-1';}
      else if (this.value <= 11) {return '0';}
      else if (this.value <= 13) {return '+1';}
      else if (this.value <= 15) {return '+2';}
      else if (this.value <= 17) {return '+3';}
      else if (this.value <= 19) {return '+4';}
      else if (this.value <= 21) {return '+5';}
      else if (this.value <= 23) {return '+6';}
      else if (this.value <= 25) {return '+7';}
      else if (this.value <= 27) {return '+8';}
      else if (this.value <= 29) {return '+9';}
    };
    savingThrow(proficiency) {
        if (this.saveProficiency) {var ret = parseInt(this.bonus()) + proficiency;}
        else { var ret = parseInt(this.bonus());}
        if (ret <= 0) {return ret;}
        else {return '+' + ret;}
    };
};

(function() {
    'use strict';

    // Your code here...
    var characterJSON = [];
    var characterData = [];
    //console.log(characterJSON);
    $('.ddb-campaigns-character-card-footer-links-item-view').each(
        function(index, value) {
            //if not ddb-campaigns-detail-body-listing-inactive
            if (!($(this).parents().hasClass('ddb-campaigns-detail-body-listing-inactive'))) {
                var charLink = $(this);
                var charString = $(this).attr('href')+"/json";
                //console.log(charString);
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var x = JSON.parse(this.responseText).character;
                        var character = new Object();
                        // assign character data
                        character.name = x.name;
                        character.stats = new Object();
                        character.stats.str = new Stat(x.stats[0].value);
                        character.stats.dex = new Stat(x.stats[1].value);
                        character.stats.con = new Stat(x.stats[2].value);
                        character.stats.int = new Stat(x.stats[3].value);
                        character.stats.wis = new Stat(x.stats[4].value);
                        character.stats.cha = new Stat(x.stats[5].value);
                        // level
                        character.level = 0;
                        for (var j=0; j < x.classes.length; j++) {
                            character.level += x.classes[j].level;
                        };
                        //proficiency bonus
                        if (character.level < 5) {
                            character.proficiency = 2;
                        } else if (character.level < 9) {
                            character.proficiency = 3;
                        } else if (character.level < 13) {
                            character.proficiency = 4;
                        } else if (character.level < 17) {
                            character.proficiency = 5;
                        } else {
                            character.proficiency = 6;
                        };
                        // modifiers
                        var mods = x.modifiers.race;
                        mods = mods.concat(x.modifiers.class, x.modifiers.background, x.modifiers.item, x.modifiers.feat);
                        for (j=0; j < mods.length; j++) {
                            var y = mods[j];
                            if (y.type == "bonus") {
                                switch(y.subType) {
                                    case 'strength-score': character.stats.str.value += y.value; break;
                                    case 'dexterity-score': character.stats.dex.value += y.value; break;
                                    case 'constitution-score': character.stats.con.value += y.value; break;
                                    case 'intelligence-score': character.stats.int.value += y.value; break;
                                    case 'wisdom-score': character.stats.wis.value += y.value; break;
                                    case 'charisma-score': character.stats.cha.value += y.value; break;
                                }
                            };
                            if (y.type == "proficiency") {
                                switch(y.subType) {
                                    case 'strength-saving-throws': character.stats.str.saveProficiency = 1; break;
                                    case 'dexterity-saving-throws': character.stats.dex.saveProficiency = true; break;
                                    case 'constitution-saving-throws': character.stats.con.saveProficiency = true; break;
                                    case 'intelligence-saving-throws': character.stats.int.saveProficiency = true; break;
                                    case 'wisdom-saving-throws': character.stats.wis.saveProficiency = true; break;
                                    case 'charisma-saving-throws': character.stats.cha.saveProficiency = true; break;
                                };
                            };
                        };
                        character.maxHP = x.baseHitPoints + (character.level * parseInt(character.stats.con.bonus())) - x.removedHitPoints;
                        character.currentHP = character.maxHP + x.temporaryHitPoints - x.removedHitPoints;

                        //characterData.push(character);
                        // debug info
                        //console.log(character);
                        charLink.parents('.ddb-campaigns-character-card').after('\
<div><table id="character-details-' + character.name.replace(/\s/g, '') + '">\
<thead><tr><th></th><th>Value</th><th>Bonus</th><th>Saving Throw</th></thead>\
<tbody></tbody>\
</table></div>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Strength</td><td>'+ character.stats.str.value + '</td><td>' + character.stats.str.bonus() + '</td><td>' + character.stats.str.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Dexterity</td><td>'+ character.stats.dex.value + '</td><td>' + character.stats.dex.bonus() + '</td><td>' + character.stats.dex.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Constitution</td><td>'+ character.stats.con.value + '</td><td>' + character.stats.con.bonus() + '</td><td>' + character.stats.con.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Intelligence</td><td>'+ character.stats.int.value + '</td><td>' + character.stats.int.bonus() + '</td><td>' + character.stats.int.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Wisdom</td><td>'+ character.stats.wis.value + '</td><td>' + character.stats.wis.bonus() + '</td><td>' + character.stats.wis.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Charisma</td><td>'+ character.stats.cha.value + '</td><td>' + character.stats.cha.bonus() + '</td><td>' + character.stats.cha.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>Proficiency</td><td>+'+ character.proficiency + '</td><td></td><td></td></tr>');
                        $('#character-details-'+character.name.replace(/\s/g, '')+' > tbody:last-child').append('<tr><td>HP</td><td>'+ character.currentHP + '/' + character.maxHP + '</td><td></td><td></td></tr>');
                    }
                 };
                xmlhttp.open("GET", charString, true);
                xmlhttp.send();

            };
        }
    );
    // end get charater loop
})();
