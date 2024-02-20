// ==UserScript==
// @name			D&D Beyond Live-Update Campaign
// @namespace		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/
// @copyright		Copyright (c) 2024 Faith Elisabeth Lilley (aka Stormknight)
// @version			0.1
// @description		Provides live character data on the D&D Beyond campaign page
// @author			Faith Elisabeth Lilley (aka Stormknight)
// @match			https://www.dndbeyond.com/campaigns/*
// @updateURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js
// @downloadURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js
// @supportURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/
// @require			https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require         https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.dec3c041829e401e5940.min.js
// @grant			GM_setValue
// @grant			GM_getValue
// @license			MIT; https://github.com/FaithLilley/DnDBeyond-Live-Campaign/blob/master/LICENSE.md
// ==/UserScript==
console.log("Initialising D&D Beyond Live Campaign.");

/**
* DEFINE GLOBALS
*/

// Content sharing and description section.
// const campaignElementTarget = ".ddb-campaigns-detail-header-secondary";

// jQuery set-up
const rulesUrls = [
  "https://character-service.dndbeyond.com/character/v4/rule-data",
  "https://gamedata-service.dndbeyond.com/vehicles/v3/rule-data",
];
const charJSONurlBase =
  "https://character-service.dndbeyond.com/character/v4/character/";
const gameCollectionUrl = {
  prefix: "https://character-service.dndbeyond.com/character/v4/game-data/",
  postfix: "/collection",
};

const stylesheetUrls = [
  "https://raw.githack.com/FaithLilley/DnDBeyond-Live-Campaign/build-code-01/ddb-live-campaign.css",
];

const positiveSign = "+",
  negativeSign = "-";

const debugMode = true;

const autoUpdateDefault = true;
const updateDurationDefault = 60;

var $ = window.jQuery;
var rulesData = {},
    charactersData = {},
    campaignID = 0,
    svgImageData = {},
    authHeaders = {};

/**
* charactersData is an object array of all characters in the campaign
* * charactersData[characterID].property
* node:     the top DOM element for each character card
* url:      JSON query for character data in the DDB charater service
* data:     Data for the character
*/

// PHB cover image for cards
// https://www.dndbeyond.com/attachments/2/723/phbcover.jpg

/**
* MAIN FUNCTION
* * Called by Tampermonkey
* TODO: Add the data loading
*/

(function () {
    const campaignIDRegex = /(?<=\/)\d+/;
    writeDebugData("Main function executing");
    stylesheetUrls.forEach(loadStylesheet); //load and insert each stylesheet in the settings
    campaignID = window.location.pathname.match(campaignIDRegex);
    writeDebugData("Campaign detected: " + campaignID);
    defineSVGimageData();
    defineHTMLsnippets();
    locateCharacters();
})();

/**
* locateCharacters()
* Parse through the page to locate every active character in the campaign.
* Initialises charactersData
* * No parameters
*/
function locateCharacters() {
    const charIDRegex = /(?<=\/)\d+/;
    const linkUrlTarget = ".ddb-campaigns-detail-body-listing-active .ddb-campaigns-character-card-footer-links-item-view";
    writeDebugData("Locating active characters on the campaign page.");
    $(linkUrlTarget).each(function (index, value) {
        let characterID = parseInt(value.href.match(charIDRegex));
        writeDebugData("Character ID located: " + characterID);
        if (characterID != 0) {
            let node = $(value).parents('li');
            charactersData[characterID] = {
                node: node,
                url: charJSONurlBase + characterID,
                data: {},
            }
            injectNewCharacterCardElements(characterID);
            updateCharacterClasses(characterID);
            writeDebugData(charactersData[characterID].url);
        } else {
            console.warn("Warning! Character with null character ID was found!");
        }
    });
}


/**
* FUNCTIONS FOR UPDATING THE PAGE STRUCTURE
*/
function injectNewCharacterCardElements(characterID) {
    let targetNode = charactersData[characterID].node.find('.ddb-campaigns-character-card-header');
    targetNode.append(defineHTMLsnippets());
}

/**
* FUNCTIONS FOR UPDATING THE PAGE DATA
*/

// Updates the Character Class based on data
function updateCharacterClasses(characterID) {
    let targetNode = charactersData[characterID].node.find('.ddb-campaigns-character-card-header-upper-character-info-secondary').first();
    targetNode.html('Variant Human - Barbarian 4 / Sorceror 3');
    // TODO: Plug in the actual data
}

/**
* GENERIC FUNCTIONS
*/

function writeDebugData(data) {
  if (debugMode === true) {
    console.log("DDBLC:: " + data);
  }
}

function loadStylesheet(href) {
    console.debug('Start: Adding CSS Stylesheet ' + href);
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    document.head.appendChild(link);
    console.debug('Done: Adding CSS Stylesheet');
}

/**
* DEFINE SVG IMAGES so they can be used later on.
* * Reference example: svgImageData.armorClass
*/
function defineSVGimageData() {
    svgImageData = {
        armorClass:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 90"><path fill="#FEFEFE" d="M72.8,30.7v13.7c-1,3.6-9.7,30.9-31.9,38.6c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7 C26,78.7,17.9,68.6,12.9,59.8c0,0,0,0,0,0c-0.3-0.5-0.6-1-0.8-1.5c-3.6-6.7-5.4-12.4-5.9-14V30.7c0.7-0.3,1.2-0.9,1.2-1.7 c0-0.1,0-0.2-0.1-0.3c6.2-4,8.5-11.5,9.2-15.2L38.1,7c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.4,6.6 c0.8,3.6,3,11.1,9.2,15.2V29c0,0.2,0,0.4,0.1,0.6C71.8,30.1,72.3,30.5,72.8,30.7z"></path><path fill="#C53131" d="M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7 s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9 c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4 c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3c-1,3.6-9.6,30.5-31.5,38.2 c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3 c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3 c0,0.8,0.5,1.5,1.2,1.7V44.3z M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7 c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4 c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8 c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3 c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7 l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3c0,0.8,0.5,1.5,1.2,1.7V44.3z M78.1,24.5c-8.7-1.8-9.9-14.9-9.9-15l-0.1-0.8L39.5,0 L10.9,8.7l-0.1,0.8c0,0.1-1.2,13.3-9.9,15l-1,0.2v20.4v0.3C0,45.8,9.6,82.1,39.1,89.9l0.3,0.1l0.3-0.1C69.5,82.1,79,45.8,79.1,45.4 V24.7L78.1,24.5z M76.7,45C76,47.5,66.6,80.1,39.5,87.5C12.6,80.1,3.2,47.4,2.5,45V26.7c8.3-2.4,10.3-13,10.7-16.1l26.4-8l26.4,8 c0.4,3.1,2.4,13.7,10.7,16.1V45z M63.5,13.2l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4 c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2 c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-1-0.8-1.9-1.8-1.9c-0.4,0-0.8,0.2-1.1,0.4C66.2,23.9,64.1,16.4,63.5,13.2z M72.5,30.9v13.5 c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7 l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3C71.3,30,71.8,30.6,72.5,30.9z"></path></svg>`,
        attributeBox:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 95"><path fill="#FEFEFE" d="M77.56,53.81a4.55,4.55,0,0,1-1.64-3.69c0-6.29-1.3-14.52,1.37-20.68A5,5,0,0,1,76,26.51a5.3,5.3,0,0,1-.72-6c1.28-2.68,1.17-6.68.88-9.54a4.15,4.15,0,0,1,1.22-3.27c.12-.62.23-1.24.35-1.86C73.47,7.49,70.86,2,70.86,2H10.14S8,6.44,4.48,6.16A5.61,5.61,0,0,1,4.63,7.5c0,1.54-.17,3.1-.21,4.66.09,1.24.23,2.47.44,3.68a33,33,0,0,1,1.58,7.78,4.58,4.58,0,0,1-1.05,3.21,4.79,4.79,0,0,1-1.47,2.34,5.17,5.17,0,0,1,.5,2.12c.18,6.94.78,13.53.25,20.5a5,5,0,0,1-1.2,3c.06,2,0,4,0,6.07a4.61,4.61,0,0,1,.44,3.71C1.64,73,6.36,78,12.35,82.16a5.16,5.16,0,0,1,.49.21c.91.5,1.81,1,2.73,1.55a1,1,0,0,0,.17.1c.54.3,1.09.59,1.66.85a2.39,2.39,0,0,1,.21.13h1.85a4.21,4.21,0,0,1-1.19-1.92,9.45,9.45,0,0,1-.9-6.13,3.71,3.71,0,0,1,.18-1.22c.16-.41.32-.79.49-1.15A10.44,10.44,0,0,1,21,70.26c.11-.12.21-.25.32-.36a14.53,14.53,0,0,1,1.91-1.84,18.26,18.26,0,0,1,6-3.17,21.13,21.13,0,0,1,4.9-1.39c6.15-1.45,14.34-.72,19.85,2.51.67.3,1.33.62,1.94,1a6.52,6.52,0,0,1,.67.45l.07,0a14.44,14.44,0,0,1,4,3.33,4.51,4.51,0,0,1,.77,1,22.47,22.47,0,0,1,1.29,1.89,4.61,4.61,0,0,1,.57,3.41,5.42,5.42,0,0,1,.27,1.78,5.73,5.73,0,0,1-.27,2.33,5.11,5.11,0,0,1-1.29,3.1,3.79,3.79,0,0,1-.66.72h2.68a4.41,4.41,0,0,1,2.21-1.49c1.34-.86,2.74-1.65,4.06-2.61,1.7-1.26,5.14-3.55,5.9-5.61A5.51,5.51,0,0,1,76.8,74a7.8,7.8,0,0,0,.37-1.71,5.4,5.4,0,0,1,.34-1.56c-.09-1.51-.18-3-.41-4.53a6.21,6.21,0,0,1,.5-3.74C77.46,59.57,77.46,56.64,77.56,53.81Z"></path><path fill="#FEFEFE" d="M40.5,66C50.7,66,59,71.61,59,78.5S50.7,91,40.5,91,22,85.39,22,78.5,30.3,66,40.5,66"></path><path fill="#C53131" d="M4.52,13.62A34.66,34.66,0,0,1,3.08,6.26l0-.42.63-.2C5.22,5.18,9.41,3.35,9.41,1V0H71.59V1c0,2.37,4.19,4.2,5.66,4.66l.63.2,0,.42a35.34,35.34,0,0,1-1.44,7.36L76,7.3C74.42,6.71,70.47,5,69.74,2H11.26C10.52,5,6.58,6.71,5,7.3ZM2.32,79.46H2.6c.08-1.12.16-2.38.24-3.76A13,13,0,0,1,.63,69.83,9.4,9.4,0,0,1,3.21,62.6V61.43S1.83,35.67.56,31.56L.4,31l.47-.29a12.31,12.31,0,0,0,2.2-1.87,6.23,6.23,0,0,0,1.55-2.24A5.08,5.08,0,0,0,5,23.27c0-.11-.58-1.35-1.12-3l-.26,2.85c.27.79.5,1.63.71,2.49a5.17,5.17,0,0,1-1.56,2A33.13,33.13,0,0,0,1.74,23.6l-.07-.2L2.91,9.63c0,2,1.38,6.53,1.38,6.53a36.23,36.23,0,0,0,2.1,6.67A7.13,7.13,0,0,1,5,28.71C6.68,38,5.08,71,4.87,74.89A15.6,15.6,0,0,1,3,71.41c.08-2,.13-4.16.16-6.41a7.57,7.57,0,0,0-1.15,4.71,12,12,0,0,0,2.1,5.41l.15.22.45.64.06.07h0a29.64,29.64,0,0,0,5.74,5.66A39.48,39.48,0,0,1,14,83.83h0l.26.18c.79.54,1.55,1.09,2.29,1.65l.18.13h0c1.42,1.09,2.71,2.17,3.78,3.11,1.39,0,2.75.11,4,.22a16.4,16.4,0,0,1-3.19-3.33H17.91l-2.49-2h2.32a16.19,16.19,0,0,1-.88-4.16,4.31,4.31,0,0,1-5.21,1.79c.59.18,3,.53,5.24-4.08v0a8.24,8.24,0,0,1,2.52-5.32,13.54,13.54,0,0,0-1,10.29A1.76,1.76,0,0,0,19.8,83,11.36,11.36,0,0,1,19,78.77c0-8.55,9.66-15.51,21.54-15.51S62,70.22,62,78.77A11.36,11.36,0,0,1,61.2,83a1.76,1.76,0,0,0,1.34-.64,13.54,13.54,0,0,0-1-10.29A8.24,8.24,0,0,1,64.1,77.4v0c2.2,4.61,4.64,4.26,5.24,4.08a4.31,4.31,0,0,1-5.21-1.79,16.19,16.19,0,0,1-.88,4.16h2.32l-2.49,2H59.68a16.4,16.4,0,0,1-3.19,3.33c1.2-.11,2.57-.21,4-.22,1.07-.94,2.36-2,3.78-3.11h0l.18-.13c.74-.56,1.5-1.11,2.29-1.65l.26-.18h0a39.48,39.48,0,0,1,3.49-2.11,29.64,29.64,0,0,0,5.74-5.66h0l.06-.07.45-.64.15-.22A12,12,0,0,0,79,69.71,7.64,7.64,0,0,0,77.8,65c0,2.25.08,4.41.16,6.41a15.6,15.6,0,0,1-1.83,3.48C75.92,71,74.32,38,76,28.71a7.1,7.1,0,0,1-1.34-5.88,38.28,38.28,0,0,0,2.09-6.67s1.4-4.48,1.38-6.53L79.33,23.4l-.07.2a33.13,33.13,0,0,0-1.07,4.08,5.39,5.39,0,0,1-1.57-2c.22-.86.45-1.7.71-2.49l-.25-2.85c-.54,1.61-1.07,2.85-1.12,3a5.08,5.08,0,0,0,.42,3.36,6.23,6.23,0,0,0,1.55,2.24,12.31,12.31,0,0,0,2.2,1.87l.48.29-.17.53c-1.26,4.11-2.64,29.87-2.64,29.87,0,.39,0,.79,0,1.17a9.4,9.4,0,0,1,2.58,7.23,13.37,13.37,0,0,1-2.2,5.89c.07,1.38.15,2.64.23,3.76h.28c1.49-.12,2.79.71,2.16,1.75a2.46,2.46,0,0,1-1.72,1.15,2.58,2.58,0,0,0,.75-.85c.17-.3,0-.44-.14-.51l-.38,0h0a7.86,7.86,0,0,0-.84,0c.18,2.31.32,3.71.33,3.79L79,85.79H66.64c-1.46,1-2.84,2.15-4,3.15a11.85,11.85,0,0,1,7,2.12l-2.75,1.09h0a30,30,0,0,1-5.35,1.74h0l-.33,0L61,94c-9.66,1.67-10.67.75-10.67.75A10.09,10.09,0,0,0,57.11,92l.23-.24c.1-.1.62-.62,1.46-1.4-.62,0-1.22.07-1.81.12h0l-.44,0a8.82,8.82,0,0,0-1.18.23,7.12,7.12,0,0,0-.87.27l-.14,0a6.24,6.24,0,0,0-1,.44l-.11.07a5.63,5.63,0,0,0-.77.54l-.22.19a4.82,4.82,0,0,0-.75.86l-7.89.9.06,0a26.18,26.18,0,0,1-6.46,0l.06,0-7.89-.9a4.5,4.5,0,0,0-.76-.86l-.22-.2a7,7,0,0,0-.79-.55l-.09-.06a8.88,8.88,0,0,0-.95-.44L26.45,91c-.3-.11-.59-.2-.86-.27-.46-.11-.86-.17-1.14-.21l-.44,0h0c-.59,0-1.19-.09-1.81-.12.84.78,1.36,1.3,1.45,1.4l.24.24a10.09,10.09,0,0,0,6.78,2.71s-1,.92-10.67-.75l-.24,0-.33,0h0a29.76,29.76,0,0,1-5.35-1.74h0l-2.75-1.09a11.85,11.85,0,0,1,7-2.12c-1.2-1-2.58-2.1-4-3.15H2l.12-1.08c0-.08.15-1.48.33-3.79a7.86,7.86,0,0,0-.84,0h0l-.38,0c-.17.07-.31.21-.14.51a2.5,2.5,0,0,0,.74.85A2.47,2.47,0,0,1,.16,81.21c-.63-1,.67-1.87,2.16-1.75ZM76.78,49.11c.53-5.66,1.25-14.21,2.15-17.46a15.6,15.6,0,0,1-1.28-1,144.6,144.6,0,0,0-.87,18.5ZM74.63,80a11.89,11.89,0,0,1,1.8-.35c0-.46-.07-1-.1-1.48-.57.67-1.15,1.28-1.7,1.83Zm-5,3.82h7.17c-.06-.66-.15-1.61-.24-2.76a18.56,18.56,0,0,0-6.93,2.76ZM58.69,92.48l.07,0c1.06.59,4.54-.45,7.31-1.59a17.09,17.09,0,0,0-5.08-.6c-1.07,1-1.88,1.72-2.3,2.14ZM40.5,92.14c7,0,13-2.55,16.48-6.35.27-.3.53-.62.78-.94a.61.61,0,0,1,.07-.1,9.16,9.16,0,0,0,.61-.92,9.74,9.74,0,0,0,1.46-5.06c0-7.37-8.7-13.37-19.4-13.37s-19.4,6-19.4,13.37a9.83,9.83,0,0,0,1.45,5.06c.19.32.4.62.62.92l.08.1c.24.32.5.64.77.94,3.43,3.8,9.52,6.35,16.48,6.35ZM20,90.34a17.09,17.09,0,0,0-5.08.6c2.78,1.14,6.25,2.18,7.31,1.59l.07,0c-.42-.42-1.22-1.18-2.3-2.14ZM4.57,79.66a12.14,12.14,0,0,1,1.8.35c-.55-.55-1.13-1.16-1.7-1.83,0,.52-.07,1-.1,1.48Zm-.35,4.17h7.17a18.62,18.62,0,0,0-6.93-2.76c-.09,1.15-.18,2.1-.24,2.76Zm0-34.72a144.6,144.6,0,0,0-.87-18.5,15.6,15.6,0,0,1-1.28,1C3,34.9,3.68,43.45,4.22,49.11Z"></path></svg>`,
        hitPointBox:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 89"><path fill="#FEFEFE" d="M87.54,9.45a42.28,42.28,0,0,1-3-3A42.91,42.91,0,0,0,74.21,1H18.36a11,11,0,0,0-1.53.59A4.9,4.9,0,0,1,15.36,2.7,21.09,21.09,0,0,0,6,12.28a5.14,5.14,0,0,1,.12,1.59,5.15,5.15,0,0,1,.24,1.18c1,12.72.57,25.84.4,38.59-.09,6.5,0,13-.05,19.48,0,2-.11,4.08-.22,6.12a17.93,17.93,0,0,0,2.78,2.94A73.22,73.22,0,0,0,16.51,87H78l.07-.06a32.31,32.31,0,0,0,9.31-8.5c.13-6,.65-12,.36-18s.2-11.89.36-17.9c.16-6.53,0-13.11-.17-19.64C87.84,18.57,88.07,13.86,87.54,9.45Z"></path><path fill="#C53131" d="M85,0H9L0,9.05V80l9,9H85l9-9V9.05Zm6.55,10.08v7a29.26,29.26,0,0,0-3.24-6.78v-.13h-.08a20.45,20.45,0,0,0-9.13-7.69H84ZM75.6,86.52H18.36a19,19,0,0,1-11.3-7.73V10.25A19.27,19.27,0,0,1,18.4,2.48H75.64a18.94,18.94,0,0,1,11.3,7.73V78.75A19.27,19.27,0,0,1,75.6,86.52ZM2.47,21.18a31.7,31.7,0,0,1,3.24-8.8V76.64c-.3-.53-.62-1-.89-1.62a32.92,32.92,0,0,1-2.35-7.11Zm85.82-8.82c.3.53.62,1,.89,1.62a32.92,32.92,0,0,1,2.35,7.11V67.81a31.64,31.64,0,0,1-3.24,8.81ZM10.05,2.48h4.87a20.45,20.45,0,0,0-9.13,7.69H5.71v.13a29.26,29.26,0,0,0-3.24,6.78v-7ZM2.47,78.92v-7A29.45,29.45,0,0,0,5.71,78.7v.13h.08a20.45,20.45,0,0,0,9.13,7.69H10.05ZM84,86.52H79.08a20.45,20.45,0,0,0,9.13-7.69h.08V78.7a29.45,29.45,0,0,0,3.24-6.78v7Z"></path></svg>`,
        initiativeBox:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 45"><polygon fill="#FEFEFE" points="68.8,22.5 55.8,43.3 14.2,43.3 1.2,22.5 14.2,1.8 14.3,1.7 55.7,1.7 55.8,1.8 "></polygon><path fill="#C53131" d="M59.1,0H10.9L0,17.2v10.5L10.9,45H59l11-17.2V17.2L59.1,0z M58.2,2.2l10,15.8v3L56.5,2.3l-0.1-0.1H58.2z M14.8,2.2h40.5 l0.1,0.1L68,22.5L55.3,42.8H14.7L2,22.5L14.8,2.2L14.8,2.2z M1.8,18l10-15.8h1.8l-0.1,0.1L1.8,21V18z M11.8,42.8L1.8,27v-3 l11.7,18.8H11.8z M68.2,27l-10,15.8h-1.7L68.2,24V27z"></path></svg>`,
    };
}

/**
* DEFINE HTML SNIPPETS that will be injected into the page.
* * Reference example: htmlSnippetData.armorClass
*/
function defineHTMLsnippets() {
    let htmlSnippetData = `
            <div class="ddb-lc-character-expanded">
                <div class="ddb-lc-character-stats">
                    <div class="ddb-lc-character-stats-armorclass">
                    </div>
                    <div class="ddb-lc-character-stats-hitpoints">
                    </div>
                    <div class="ddb-lc-character-stats-initiative">
                    </div>
                    <div class="ddb-lc-character-stats-passives">
                    </div>
                </div>
                <div class="ddb-lc-character-attributes">
                    <div class="ddb-lc-character-attributes-str">
                    </div>
                    <div class="ddb-lc-character-attributes-dex">
                    </div>
                    <div class="ddb-lc-character-attributes-con">
                    </div>
                    <div class="ddb-lc-character-attributes-int">
                    </div>
                    <div class="ddb-lc-character-attributes-wis">
                    </div>
                    <div class="ddb-lc-character-attributes-cha">
                    </div>
                </div>
            </div>
    `;
    return htmlSnippetData;
}