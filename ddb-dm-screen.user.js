// ==UserScript==
// @name         ddb-dm-screen
// @namespace    https://github.com/mivalsten/ddb-dm-screen
// @version      2.0.6
// @description  Poor man's DM screen for DDB campaigns
// @author       Mivalsten
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// @license      MIT; https://github.com/mivalsten/ddb-dm-screen/blob/master/LICENSE
// ==/UserScript==
//
var $ = window.jQuery;

class Character {
  constructor(name) {
    this.name = name;
  };
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

    get initiative() {
        return this.iframe.find(".ct-initiative-box__value").text();
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

    get speed(){
    return this.iframe.find(".ct-distance-number__number").text();
  }

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
      .replace("mod", character.stats[s].modifier)
      .replace("save", character.stats[s].savingThrow);
    footer.append(text);
  }

  otherInfo = {
    "Proficiency": `+${character.proficiency}`,
    "HP": `${character.currentHP} / ${character.maxHP}`,
    "AC": character.ac,
    "Passive Investigation": character.passiveInvestigation,
    "Passive Perception": character.passivePerception,
    "Passive Insight": character.passiveInsight
  }

  for (name in otherInfo){
    footer.append(otherRow.replace("name", name).replace("value", otherInfo[name]));
  }
  console.log(character.initiative);
  console.log(character.conditions);
  console.log(character.spellSaveDC);
  console.log(character.speed);

}

function prerender(character, node, times) {
    if (!isNaN(character.ac)) {render(character, node);}
    else {
        times += 1;
        if (times < 80) {setTimeout(function() {prerender(character, node, times);}, 500);};
    }
}

(function() {
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
})();
