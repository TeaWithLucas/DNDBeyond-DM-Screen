// ==UserScript==
// @name         ddb-dm-screen
// @namespace    https://github.com/mivalsten/ddb-dm-screen
// @version      2.1.1
// @description  Poor man's DM screen for DDB campaigns
// @author       Mivalsten Lothsun
// @match        https://www.dndbeyond.com/campaigns/*
// @updateURL    https://github.com/mivalsten/ddb-dm-screen/raw/master/ddb-dm-screen.user.js
// @grant        none
// @license      MIT; https://github.com/lothsun/ddb-dm-screen/blob/master/LICENSE
// ==/UserScript==

var $ = window.jQuery;


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start Character Class
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

class Character {
  constructor(name) {
    this.name = name;
  };

  // Do we need Level and Proficency anymore? They aren't used anywhere in the render function.
  get level() {
    var classes = this.iframe.find('.ct-character-tidbits__classes').text().split('/').map(function(i){return parseInt(i.replace(/[^0-9]+/g, ''))});
    return classes.reduce((a, b) => a + b, 0);
  }
  get proficiency() {
    return Math.ceil(this.level / 4) + 1;
  }

  get id(){
    return this.name.replace(/[^0-9a-zA-Z]+/g, '');
  }

  get iframe(){
    return $(`#frame-${this.id}`).contents();
  }

  get ac(){
    return parseInt(this.iframe.find(".ct-armor-class-box__value").text());
  }

  get currentHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-current").text());
  }

  get maxHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-max").text());
  }

  get savingThrows(){
    var savingThrows = {}
    var selector = this.iframe.find('.ct-saving-throws-summary')
    selector.children().each(function (){
      var saveStat = $(this).find(".ct-saving-throws-summary__ability-name").text();
      var saveNumber = $(this).find(".ct-signed-number__number").text();
      var saveSign = $(this).find(".ct-signed-number__sign").text();
      var saveFullNumber = {"sign": saveSign, "number" : saveNumber}
      savingThrows[saveStat] = saveFullNumber
    });
    return savingThrows
  }

  get savingThrowMods(){
    // var modifiers = []
    // this.iframe.find(".ct-saving-throws-box__modifiers").children().each(function() {
    //   modifiers.push($(this).text())
    // })
    // console.log(modifiers.length)
    //if(modifiers.length)
    var modifiers = this.iframe.find("div.ct-saving-throws-box__modifiers").html()
    return modifiers
  }

  get savingThrowsCSS(){
    var css = this.iframe.css()
    return css
  }

  get passiveSkills(){
    var passiveStats = {}
    var selector = this.iframe.find('.ct-senses__callouts')
    selector.children().each(function (){
      var number = $(this).find(".ct-senses__callout-value").text();
      var skill = ""
      if($(this).is(':contains("Perception")')){
        skill = "Perception"
      } else if($(this).is(':contains("Investigation")')){
        skill = "Investigation"
      } else if($(this).is(':contains("Insight")')){
        skill = "Insight"
      }
      passiveStats[skill] = number
    });
    return passiveStats
  }

  get senses(){
    var senses = this.iframe.find('.ct-senses__summary').text()
    return senses
  }

  get stats(){
    var stats = {};
    var iframe = this.iframe;
    iframe.find('.ct-ability-summary').each(function(index){
      let name = $(this).find('.ct-ability-summary__abbr').text();
      stats[name] = {
        value: Math.max(
          parseInt($(this).find('.ct-ability-summary__primary').text()),
          parseInt($(this).find('.ct-ability-summary__secondary').text())
        ),
        modifier: Math.min(
          parseInt($(this).find('.ct-ability-summary__primary').text()),
          parseInt($(this).find('.ct-ability-summary__secondary').text())
        ),
        savingThrow: iframe.find(`.ct-saving-throws-summary__ability--${name} .ct-signed-number`).text()
      };
    });
    return stats;
  }

  get skills(){
    var skills = {};
    this.iframe.find('.ct-skills__item').each(function() {
      var name = $(this).children('.ct-skills__col--skill').text();
      var value = $(this).children('.ct-skills__col--modifier').text();
      skills[name] = value;
    });
    return skills;
  }

  get initiative(){
    var initNumber = parseInt(this.iframe.find(".ct-initiative-box__value > .ct-signed-number.ct-signed-number--large > .ct-signed-number__number").text());
    var initMod = this.iframe.find(".ct-initiative-box__value > .ct-signed-number.ct-signed-number--large > .ct-signed-number__sign").text();
    var init = {
      "number" : initNumber,
      "mod" : initMod
    }
    return init;
  }

  get speed(){
    this.iframe.find(".ct-speed-box").trigger("click");
    var speeds = {}
    var selector = this.iframe.find(".ct-speed-manage-pane__speeds")
    selector.children().each(function () {
      var label = $(this).find(".ct-speed-manage-pane__speed-label").text();
      var amount = $(this).find(".ct-speed-manage-pane__speed-amount").find('.ct-distance-number__number').text();
      speeds [label] = amount;
    });
    this.iframe.find(".ct-quick-nav__edge-toggle").trigger("click");
    return speeds;
  }

  get conditions() {
    var conds = new Array();
    this.iframe.find(".ct-combat-tablet__cta-button").trigger("click");
    this.iframe.find(".ct-collapsible__header-content").each(function(i,v){
        if ($(this).find(".ct-toggle-field").hasClass("ct-toggle-field--enabled")) {
            conds.push($(this).find(".ct-condition-manage-pane__condition-name").text());
        }
    })
    this.iframe.find(".ct-quick-nav__edge-toggle").trigger("click");
    return conds;
  }

  get spellSaveDC() {
    var spellSaveDCs = {};
    this.iframe.find(".ct-quick-nav__toggle").trigger("click");
    this.iframe.find(".ct-quick-nav__menu-item--spells").children(".ct-quick-nav__button").trigger("click");
    var selector = ".ct-spells__casting .ct-spells-level-casting__info-group:has(.ct-spells-level-casting__info-label:contains(Save))";
    this.iframe.find(selector).find("span").each(function(i,v) {
        spellSaveDCs[$(this).attr("data-original-title")] = $(this).text();
    })
    this.iframe.find(".ct-quick-nav__toggle").trigger("click");
    this.iframe.find(".ct-quick-nav__menu-item--main").children(".ct-quick-nav__button").trigger("click");
    return spellSaveDCs;
  }
};


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start Render Function
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function render(character, node){ // function that builds the scraped data and renders it on the page.

  var tableId = `character-details-${character.id}`; //variable fot table ID. Will be removed in upcoming release.

  //base html that the code gets added to
  var genStats = `
    <div class="genStats">
      <div class="genStats__container genStats__container--1">
      </div>
      <div class="genStats__container genStats__container--2">
      </div>
      <div class="genStats__container genStats__container--3">
      </div>
      <div class="genStats__container genStats__container--4">
      </div>
    </div>
  `;
  // Html for the save dc module
  var saveDcModule = `
    <div class="genStats__module genStats__module--savedc">
      <div class="genStats__heading">
        <div class="genStats__label">Save DC</div>
      </div>
      <div class="genStats__inlineGroup genStats__saveGroup"></div>
    </div>
  `;
  // Html for the saveDC item

  var saveDcItemModule =`
    <div class="genStats__inlineGroup--item genStats__saveItem">
      <div class="genStats__value">saveNumber</div>
      <div class="genStats__footer">
        <div class="genStats__label">saveClass</div>
      </div>
    </div>
  `;

  // Html for the speed module
  var speedModule =`
    <div class="genStats__module genStats__module--speed">
      <div class="genStats__heading">
        <div class="genStats__label">Speed</div>
      </div>
      <div class="genStats__inlineGroup genStats__speedGroup"></div>
    </div>
  `;

  // Html for the speed item

  var speedItemModule =`
    <div class="genStats__inlineGroup--item genStats__speedItem">
      <div class="genStats__value">
        <span class="genStats__distance">
          <span class="genStats__distance--number">speedNumber</span>
          <span class="genStats__distance--label">ft.</span>
        </span>
      </div>
      <div class="genStats__footer">
        <div class="genStats__label">speedLabel</div>
      </div>
    </div>
  `;

  // Html for the initiative module
  var initModule =`
    <div class="genStats__module genStats__module--init">
      <div class="genStats__value">
        <span class="genStats__number genStats__number--large">
          <span class="genStats__number--sign">initMod</span>
          <span class="genStats__number--number">initNumber</span>
        </span>
      </div>
      <div class="genStats__footer">
        <div class="genStats__label">initiative</div>
      </div>
    </div>
  `;
  // Html for the armor class module
  var armorClassModule =`
    <div class="genStats__module genStats__module--armorClass">
      <div class="genStats__heading">
        <div class="genStats__label">armor</div>
      </div>
      <div class="genStats__value">ac</div>
      <div class="genStats__footer">
        <div class="genStats__label">Class</div>
      </div>
    </div>
  `;
  // Html for the Health module
  var healthModule =`
    <div class="genStats__module genStats__module--health">
      <div class="genStats__value">
        <span class=".genStats__health--hp-current">currentHP</span>
        <span class=".genStats__health--hp-sep">/</span>
        <span class=".genStats__health--hp-max">maxHP</span>
      </div>
        <div class="genStats__label">Hit Points</div>
      </div>
    </div>
  `;

  // Html for the saving throw module
  var savingThrowsModule = `
    <div class="genStats__module genStats__module--savingThrow">
      <div class="genStats__heading">
        <div class="genStats__label">Saving Throws</div>
      </div>
      <div class="genStats__inlineGroup genStats__savingThrowsGroup"></div>
      <!--<div class="genStats__savingThrowMods">saveMods</div>-->
    </div>
  `;
  // Html for the saving throw item module

  var savingThrowsItemModule =`
    <div class="genStats__inlineGroup--item genStats__savingThrowsItem">
      <div class="genStats__value">
        <span class="genStats__number genStats__number--large">
          <span class="genStats__number--sign">throwSign</span>
          <span class="genStats__number--number">throwNumber</span>
        </span>
      </div>
      <div class="genStats__footer">
        <div class="genStats__label">throwLabel</div>
      </div>
    </div>
  `;

  // Html for the Passive Skills module
  var passiveSkillsModule = `
    <div class="genStats__module genStats__module--passiveSkills">
      <div class="genStats__heading">
        <div class="genStats__label">Passive Skills</div>
      </div>
      <div class="genStats__inlineGroup genStats__passiveSkillsGroup"></div>
      <div class="genStats__senses">sensesText</div>
    </div>
  `;
  // Html for the passive skills item module

  var passiveSkillsItemModule =`
    <div class="genStats__inlineGroup--item genStats__passiveSkillsItem">
    <div class="genStats__value">passiveNumber</div>
    <div class="genStats__footer">
      <div class="genStats__label">passiveStat</div>
    </div>
    </div>
  `;

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //        Start adding elements to page
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  node.parents('.ddb-campaigns-character-card').find('.ddb-campaigns-character-card-header').after(genStats); // add general stats to the player card
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--1').append(initModule.replace("initNumber", character.initiative.number).replace("initMod", character.initiative.mod)); //add player initiative mod to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--1').append(armorClassModule.replace("ac", character.ac)); //add player armor class to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--1').append(healthModule.replace("currentHP", character.currentHP).replace("maxHP", character.maxHP)); //add player current and max hp to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--3').append(savingThrowsModule/*.replace("saveMods", character.savingThrowMods)*/); //add player saving throws to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--4').append(passiveSkillsModule.replace("sensesText", character.senses)); //add player senses to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--2').append(speedModule); //add player walking speed to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container--2').append(saveDcModule); //add player Save DC to front of general stats div

  //adds saving throws to page
  Object.keys(character.savingThrows).forEach(function (savingThrow) {
    var stat = savingThrow
    var savingThrowItem = savingThrowsItemModule
      .replace("throwLabel", [savingThrow])
      .replace("throwSign", character.savingThrows[stat].sign)
      .replace("throwNumber", character.savingThrows[stat].number)
    node.parents('.ddb-campaigns-character-card').find('.genStats__savingThrowsGroup').append(savingThrowItem)
  })

  // These next few lines checks if the character has a spell save DC. If it doesn't it replaces the number with a 0 and changes the class to no save.
  if (Object.keys(character.spellSaveDC).length !== 0 && character.spellSaveDC.constructor === Object) {
    Object.keys(character.spellSaveDC).forEach(function (item) { // iterates through each item in the object and adds it to the spell save module
      var saveItem = saveDcItemModule
        .replace("saveNumber", character.spellSaveDC[item]) //adds the save dc number
        .replace("saveClass", item) //Adds the spell save class
      node.parents('.ddb-campaigns-character-card').find('.genStats__saveGroup').append(saveItem) // adds item to the character card
    })
  } else {
    var saveItem = saveDcItemModule
        .replace("saveNumber", "0")
        .replace("saveClass", "No Save")
    node.parents('.ddb-campaigns-character-card').find('.genStats__saveGroup').append(saveItem)
  }
  //Adds character speeds to the speed module

  Object.keys(character.speed).forEach(function (item) {
    var speedItem = speedItemModule
      .replace("speedLabel", item)
      .replace("speedNumber", character.speed[item])
    node.parents('.ddb-campaigns-character-card').find('.genStats__speedGroup').append(speedItem)
  })

  Object.keys(character.passiveSkills).forEach(function (skill) {
    var stat = skill
    var passiveItem = passiveSkillsItemModule
      .replace("passiveStat", stat)
      .replace("passiveNumber", character.passiveSkills[skill])
    node.parents('.ddb-campaigns-character-card').find('.genStats__passiveSkillsGroup').append(passiveItem)
  })
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start PreRender Function
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function prerender(character, node, times) { //Prerender logic - needs to be commented further
    if (!isNaN(character.ac)) {render(character, node);}
    else {
        times += 1;
        if (times < 80) {setTimeout(function() {prerender(character, node, times);}, 500);};
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start iFrame Logic
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

(function() { //iFrame Logic - Needs to be commented further
  $('#site').after('<div id="iframeDiv" style="opacity: 0; position: absolute;"></div>'); //visibility: hidden;
  let chars = $('.ddb-campaigns-detail-body-listing-active').find('.ddb-campaigns-character-card-footer-links-item-view');
  chars.each(function(index, value) {
      let node = $(this);
      let name = node.parents('.ddb-campaigns-character-card').find('.ddb-campaigns-character-card-header-upper-character-info-primary').text();
      let character = new Character(name);
      let newIframe = document.createElement('iframe');
      //after loading iframe, wait for a second to let JS create content.
      newIframe.onload = function(){prerender(character, node, 0)};
      newIframe.id = `frame-${character.id}`;
      newIframe.style = "position: absolute;"; //visibility: hidden;
      newIframe.width = 1000;
      newIframe.height = 200;
      newIframe.seamless = "";
      newIframe.src = node.attr('href');
      document.body.appendChild(newIframe);
      $('#iframeDiv').append(newIframe);
    }
  );
  //$('head').append('<link rel="stylesheet" href="https://raw.githack.com/lothsun/ddb-dm-screen/master/style.css" type="text/css" />')//development css sheet
  $('head').append('<link rel="stylesheet" href="https://rawcdn.githack.com/lothsun/ddb-dm-screen/742360e72e74c4e74fa132bb921370545b17de25/style.css" type="text/css" />') //production css sheet
})();
