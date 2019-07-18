// ==UserScript==
// @name         ddb-dm-screen-2
// @namespace    https://github.com/mivalsten/ddb-dm-screen
// @version      2.0.1
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
    this.level = 0;
    for (var i= 0; i < json.classes.length; i++) {
        this.level += json.classes[i].level;
    };
    this.proficiency = Math.ceil(this.level / 4) + 1;
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
    return parseInt(this.iframe.find(".ct-armor-class-box__value").text());
  }

  get currentHP(){
    return parseInt(this.iframe.find(".ct-health-summary__hp-item:first .ct-health-summary__hp-number").text());
  }

  get maxHP(){
    return parseInt(this.iframe.find(".ct-health-summary__hp-item:last .ct-health-summary__hp-number").text());
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
}
 
(function() {
  $('#site').after('<div id="iframeDiv" style="opacity: 0; visibility: hidden; position: absolute;"></div>');
  $('.ddb-campaigns-character-card-footer-links-item-view').each(function(index, value) {
      let node = $(this);

      if (!node.parents().hasClass('ddb-campaigns-detail-body-listing-inactive')) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(this.responseText).character;
            let character = new Character(json);

            $('#iframeDiv').append(`<iframe id="frame-${character.id}" style="position: absolute; visibility: hidden;" seamless="" width="1024" height="768" src="${node.attr('href')}"></iframe>`);
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
