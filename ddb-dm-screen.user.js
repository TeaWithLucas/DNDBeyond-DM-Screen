// ==UserScript==
// @name         ddb-dm-screen
// @namespace    https://github.com/mivalsten/ddb-dm-screen
// @version      1.2.7 hf1
// @description  Poor man's DM screen for DDB campaigns
// @author       You
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// ==/UserScript==
var $ = window.jQuery;
class Stat {
  // class methods
  constructor(value, prof) {
      this.value = parseInt(value);
      this.saveProficiency = false;
      this.saveBonus = 0;
      this.prof = parseInt(prof);
  };
    bonus() {
        var b = 0;
        if (this.value <= 1) {b = "-5";}
        else {b = Math.floor((this.value - 10)/2);}
        if (b < 0) {return b.toString();}
        else {return '+' + b;};
    };
    savingThrow() {
        var ret = parseInt(this.bonus()) + this.saveBonus;
        if (this.saveProficiency) {ret += this.prof;}
        if (ret <= 0) {return ret;}
        else {return '+' + ret;}
    };
};

class Skill {
    constructor(name, prof, type) {
        this.name = name;
        this.attr = this.getAttr(name);
        this.prof = parseInt(prof);
        this.passiveBonus = 0;
        this.setProf(type);
    };
    setProf(type) {
        if (type == "proficiency") {this.proficiency = true;};
        if (type == "expertise") {this.proficiency = true; this.expertise = true;};
    };
    getAttr(name) {
        switch(name) {
            case 'deception': return 'cha'; break;
            case 'intimidation': return 'cha'; break;
            case 'performance': return 'cha'; break;
            case 'persuasion': return 'cha'; break;
            case 'acrobatics': return 'dex'; break;
            case 'sleight-of-hand': return 'dex'; break;
            case 'stealth': return 'dex'; break;
            case 'arcana': return 'int'; break;
            case 'history': return 'int'; break;
            case 'investigation': return 'int'; break;
            case 'nature': return 'int'; break;
            case 'religion': return 'int'; break;
            case 'athletics': return 'str'; break;
            case 'animal-handling': return 'wis'; break;
            case 'insight': return 'wis'; break;
            case 'medicine': return 'wis'; break;
            case 'perception': return 'wis'; break;
            case 'survival': return 'wis'; break;
            default: return "none"
        };
    };
    getPassive(attrArray) {
        let passv = 10 + this.bonus(attrArray);
        return passv;
    };
    bonus(attrArray) {
        let bonus = parseInt(attrArray[this.attr].bonus());
        if (this.proficiency) {bonus += this.prof;};
        if (this.expertise) {bonus += this.prof;};
        if (bonus < 0) {return bonus.toString;}
        else {return '+' + bonus;};
    }
};

(function() {
    'use strict';

    // Your code here...
    $('#site').after('<div id="iframeDiv" style="display: none;"></iframe><div>');
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
                        character.bonusHP = 0;
                        character.skills = new Object();
                        // level
                        character.level = 0;
                        for (var j=0; j < x.classes.length; j++) {
                            character.level += x.classes[j].level;
                            //ugly hack for draconic bloodline
                            if (x.classes[j].subclassDefinition && x.classes[j].subclassDefinition.name == "Draconic Bloodline") {character.bonusHP += x.classes[j].level;};
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
                        //iframes
                        $('#iframeDiv').append('<iframe id="hiddenFrame' + character.name.replace(/[^0-9a-zA-Z]+/g, '') + '" src="'+ charLink.attr('href') +'"></iframe>');
                        $('#hiddenFrame' + character.name.replace(/[^0-9a-zA-Z]+/g, '')).load(function(){
                            setTimeout(function () {
                                //console.log('################### ' + character.name + ' ########################');
                                //console.log($('#hiddenFrame' + character.name.replace(/[^0-9a-zA-Z]+/g, '')).contents());
                                var acElem = $('#hiddenFrame' + character.name.replace(/[^0-9a-zA-Z]+/g, '')).contents().find(".ct-combat-mobile__extra--ac");
                                //console.log(acElem);
                                var ac = acElem.find(".ct-combat-mobile__extra-value").text();
                                $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>AC</td><td>'+ ac + '</td><td></td><td></td></tr>');
                            }, 5000);
                            });
                        character.stats = new Object();
                        if (x.overrideStats[0].value == null) {character.stats.str = new Stat(x.stats[0].value + x.bonusStats[0].value, character.proficiency);} else {character.stats.str = new Stat(x.overrideStats[0].value, character.proficiency);}
                        if (x.overrideStats[1].value == null) {character.stats.dex = new Stat(x.stats[1].value + x.bonusStats[1].value, character.proficiency);} else {character.stats.dex = new Stat(x.overrideStats[1].value, character.proficiency);}
                        if (x.overrideStats[2].value == null) {character.stats.con = new Stat(x.stats[2].value + x.bonusStats[2].value, character.proficiency);} else {character.stats.con = new Stat(x.overrideStats[2].value, character.proficiency);}
                        if (x.overrideStats[3].value == null) {character.stats.int = new Stat(x.stats[3].value + x.bonusStats[3].value, character.proficiency);} else {character.stats.int = new Stat(x.overrideStats[3].value, character.proficiency);}
                        if (x.overrideStats[4].value == null) {character.stats.wis = new Stat(x.stats[4].value + x.bonusStats[4].value, character.proficiency);} else {character.stats.wis = new Stat(x.overrideStats[4].value, character.proficiency);}
                        if (x.overrideStats[5].value == null) {character.stats.cha = new Stat(x.stats[5].value + x.bonusStats[5].value, character.proficiency);} else {character.stats.cha = new Stat(x.overrideStats[5].value, character.proficiency);}
                        // modifiers
                        var mods = x.modifiers.race;
                        mods = mods.concat(x.modifiers.class, x.modifiers.background, x.modifiers.item, x.modifiers.feat);
                        // calculate current stats first
                        for (j=0; j < mods.length; j++) {
                            let y = mods[j];
                            if (y.type == "bonus") {
                                switch(y.subType) {
                                    case 'strength-score': character.stats.str.value += y.value; break;
                                    case 'dexterity-score': character.stats.dex.value += y.value; break;
                                    case 'constitution-score': character.stats.con.value += y.value; break;
                                    case 'intelligence-score': character.stats.int.value += y.value; break;
                                    case 'wisdom-score': character.stats.wis.value += y.value; break;
                                    case 'charisma-score': character.stats.cha.value += y.value; break;
                                    case 'passive-perception':
                                        if (typeof(character.skills['perception']) === "undefined" ) {
                                            character.skills['perception'] = new Skill('perception', character.proficiency, "none");
                                        };
                                        character.skills.perception.passiveBonus += 5;
                                        break;
                                    case 'passive-investigation':
                                        if (typeof(character.skills['investigation']) === "undefined" ) {
                                            character.skills['investigation'] = new Skill('investigation', character.proficiency, "none");
                                        };
                                        character.skills.investigation.passiveBonus += 5;
                                        break;
                                }
                            };
                            if (y.type == "set") {
                                switch(y.subType) {
                                    case 'strength-score': character.stats.str.value = y.value; break;
                                    case 'dexterity-score': character.stats.dex.value = y.value; break;
                                    case 'constitution-score': character.stats.con.value = y.value; break;
                                    case 'intelligence-score': character.stats.int.value = y.value; break;
                                    case 'wisdom-score': character.stats.wis.value = y.value; break;
                                    case 'charisma-score': character.stats.cha.value = y.value; break;
                                }
                            };
                        };
                        for (j=0; j < mods.length; j++) {
                            let y = mods[j];
                            if (y.type == "proficiency") {
                                switch(y.subType) {
                                    case 'strength-saving-throws': character.stats.str.saveProficiency = 1; break;
                                    case 'dexterity-saving-throws': character.stats.dex.saveProficiency = true; break;
                                    case 'constitution-saving-throws': character.stats.con.saveProficiency = true; break;
                                    case 'intelligence-saving-throws': character.stats.int.saveProficiency = true; break;
                                    case 'wisdom-saving-throws': character.stats.wis.saveProficiency = true; break;
                                    case 'charisma-saving-throws': character.stats.cha.saveProficiency = true; break;
                                    default:
                                        if (typeof(character.skills[y.subType]) === "undefined" ) {
                                            character.skills[y.subType] = new Skill(y.subType, character.proficiency, "proficiency");
                                        } else {character.skills[y.subType].setProf("proficiency")}; break;
                                };
                            };
                            if (y.type == "expertise") {
                                if (typeof(character.skills[y.subType]) === "undefined" ) {
                                    character.skills[y.subType] = new Skill(y.subType, character.proficiency, "expertise");
                                } else {character.skills[y.subType].setProf("expertise")};
                            };
                            if (y.id == "classFeature_270_1439") {
                                character.stats.str.saveBonus += parseInt(character.stats.cha.bonus());
                                character.stats.dex.saveBonus += parseInt(character.stats.cha.bonus());
                                character.stats.con.saveBonus += parseInt(character.stats.cha.bonus());
                                character.stats.int.saveBonus += parseInt(character.stats.cha.bonus());
                                character.stats.wis.saveBonus += parseInt(character.stats.cha.bonus());
                                character.stats.cha.saveBonus += parseInt(character.stats.cha.bonus());
                            };
                            //racial bonus to HP
                            if (y.type == 'bonus' && y.subType == 'hit-points-per-level' && y.id.includes('racialTrait')) {character.bonusHP += (character.level * y.value);};

                            //tough and other bonuses to hp from feats
                            if (y.type == 'bonus' && y.subType == 'hit-points-per-level' && y.id.includes('feat')) {character.bonusHP += character.level * y.value;};

                        };
                        if (typeof(character.skills.perception) === "undefined" ) {character.skills.perception = new Skill('perception', character.proficiency, "none");};
                        if (typeof(character.skills.investigation) === "undefined" ) {character.skills.investigation = new Skill('investigation', character.proficiency, "none");};
                        if (typeof(character.skills.insight) === "undefined" ) {character.skills.perception = new Skill('insight', character.proficiency, "none");};
                        //console.log(character.skills);
                        if (x.overrideHitPoints == null) {character.maxHP = character.bonusHP + x.baseHitPoints + x.bonusHitPoints + (character.level * parseInt(character.stats.con.bonus()));}
                        else {character.maxHP = x.overrideHitPoints;}
                        character.currentHP = character.maxHP + x.temporaryHitPoints - x.removedHitPoints;

                        //characterData.push(character);
                        // debug info
                        //console.log(character);
                        charLink.parents('.ddb-campaigns-character-card').after('<div><table id="character-details-' + character.name.replace(/[^0-9a-zA-Z]+/g, '') + '">\<thead><tr><th></th><th>Value</th><th>Bonus</th><th>Saving Throw</th></thead>\<tbody></tbody>\</table></div>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Strength</td><td>'+ character.stats.str.value + '</td><td>' + character.stats.str.bonus() + '</td><td>' + character.stats.str.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Dexterity</td><td>'+ character.stats.dex.value + '</td><td>' + character.stats.dex.bonus() + '</td><td>' + character.stats.dex.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Constitution</td><td>'+ character.stats.con.value + '</td><td>' + character.stats.con.bonus() + '</td><td>' + character.stats.con.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Intelligence</td><td>'+ character.stats.int.value + '</td><td>' + character.stats.int.bonus() + '</td><td>' + character.stats.int.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Wisdom</td><td>'+ character.stats.wis.value + '</td><td>' + character.stats.wis.bonus() + '</td><td>' + character.stats.wis.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Charisma</td><td>'+ character.stats.cha.value + '</td><td>' + character.stats.cha.bonus() + '</td><td>' + character.stats.cha.savingThrow(character.proficiency) + '</td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Proficiency</td><td>+'+ character.proficiency + '</td><td></td><td></td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>HP</td><td>'+ character.currentHP + '/' + character.maxHP + '</td><td></td><td></td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Passive Perception</td><td>'+ character.skills.perception.getPassive(character.stats) + '</td><td></td><td></td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Passive Investigation</td><td>'+ character.skills.investigation.getPassive(character.stats) + '</td><td></td><td></td></tr>');
                        $('#character-details-'+character.name.replace(/[^0-9a-zA-Z]+/g, '')+' > tbody:last-child').append('<tr><td>Passive Insight</td><td>'+ character.skills.insight.getPassive(character.stats) + '</td><td></td><td></td></tr>');

                    }
                 };
                xmlhttp.open("GET", charString, true);
                xmlhttp.send();

            };
        }
    );
    // end get charater loop
})();
