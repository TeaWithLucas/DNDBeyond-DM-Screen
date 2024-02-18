// ==UserScript==
// @name			D&D Beyond Live Campaign
// @namespace		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/
// @version			0.1
// @description		Provides live character data on the D&D Beyond campaign page
// @author			Faith Lilley (aka Stormknight)
// @match			https://www.dndbeyond.com/campaigns/*
// @updateURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js
// @require			https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require         https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.dec3c041829e401e5940.min.js
// @grant			GM_setValue
// @grant			GM_getValue
// @license			MIT; https://github.com/FaithLilley/DnDBeyond-Live-Campaign/blob/master/LICENSE.md
// ==/UserScript==
console.log("Initialising D&D Beyond Live Campaign.");

// --------------------------------------------------------------------------------
// Script Globals
// --------------------------------------------------------------------------------

const linkUrlTarget = '.ddb-campaigns-character-card-footer-links-item-view';
const campaignElementTarget = '.ddb-campaigns-detail-header-secondary';

const rulesUrls = ["https://character-service.dndbeyond.com/character/v4/rule-data", "https://gamedata-service.dndbeyond.com/vehicles/v3/rule-data"];
const charJSONurlBase = "https://character-service.dndbeyond.com/character/v4/character/";

const stylesheetUrls = ["https://raw.githack.com/FaithLilley/DnDBeyond-Live-Campaign/sk-rebuild/ddb-live-campaign.css"]

const gameCollectionUrl = {prefix :"https://character-service.dndbeyond.com/character/v4/game-data/", postfix: "/collection"}
const optionalRules = {
    "optionalOrigins": {category:"racial-trait", id:"racialTraitId" },
    "optionalClassFeatures": {category:"class-feature", id:"classFeatureId" },
};

const scriptVarPrefix = "DDBLC-";

const charIDRegex = /\/(\d+)\/*$/;
const campaignIDRegex = /\/(\d+)\/*$/;

const positiveSign = '+', negativeSign = '-';

const autoUpdateDefault = true;
const updateDurationDefault = 60;

var $ = window.jQuery;
var rulesData = {}, charactersData = {}, campaignID = 0, campaignNode = {}, authHeaders ={};

// PHB cover image for cards
// https://www.dndbeyond.com/attachments/2/723/phbcover.jpg

// --------------------------------------------------------------------------------
// SVG Data
// --------------------------------------------------------------------------------



// --------------------------------------------------------------------------------
// HTML Structures
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
// Custom additonal modules to be loaded with D&DBeyond's module loader
// --------------------------------------------------------------------------------

var initalModules = {
    2080: function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        console.log("Module 2080: start");
        // Unused modules:
        // var react = __webpack_require__(0);
        // var react_default = __webpack_require__.n(react);
        // var react_dom = __webpack_require__(84);
        // var react_dom_default = __webpack_require__.n(react_dom);
        // var es = __webpack_require__(10);
        var dist = __webpack_require__(710);
        var dist_default = __webpack_require__.n(dist);
        var Core = __webpack_require__(5);
        var character_rules_engine_lib_es = __webpack_require__(1);
        var character_rules_engine_web_adapter_es = __webpack_require__(136);

        var crk = "js";
        var ktl = "U";
        var cmov = "ab";

        var key = "";

        for (key in character_rules_engine_lib_es){
            if (typeof character_rules_engine_lib_es[key].getAbilities === 'function'){
                crk = key;
                console.log("crk found: " + key);
            }
            if (typeof character_rules_engine_lib_es[key].getSenseTypeModifierKey === 'function'){
                ktl = key;
                console.log("ktl found: " + key);
            }
        }

        for (key in Core){
            if (typeof Core[key].WALK !== 'undefined' && typeof Core[key].SWIM !== 'undefined' && typeof Core[key].CLIMB !== 'undefined' && typeof Core[key].FLY !== 'undefined' && typeof Core[key].BURROW !== 'undefined'){
                cmov = key;
                console.log("cmov found: " + key);
            }
        }

        var charf1 = character_rules_engine_lib_es[crk];
        var charf2 = character_rules_engine_lib_es[ktl];
        var coref1 = character_rules_engine_lib_es[cmov];

        function getAuthHeaders() {
            return dist_default.a.makeGetAuthorizationHeaders({});

        }

        function getCharData(state) {
            /*
                All parts of the following return are from http://media.dndbeyond.com/character-tools/characterTools.bundle.71970e5a4989d91edc1e.min.js, they are found in functions that have: '_mapStateToProps(state)' in the name, like function CharacterManagePane_mapStateToProps(state)
                Any return that uses the function character_rules_engine_lib_es or character_rules_engine_web_adapter_es can be added to this for more return values as this list is not comprehensive.
                Anything with selectors_appEnv is unnessisary,as it just returns values in state.appEnv.
            */
            console.log("Module 2080: Processing State Info Into Data");

            var ruleData = charf1.getRuleData(state);

            function getSenseData(senses){ // finds returns the label
                return Object.keys(senses).map(function(index) {
                    let indexInt = parseInt(index);
                    return {
                        id: indexInt,
                        key: charf2.getSenseTypeModifierKey(indexInt),
                        name: charf2.getSenseTypeLabel(indexInt),
                        distance: senses[indexInt]
                    }
                })
            }

            function getSpeedData(speeds){ // finds returns the label
                let halfSpeed = roundDown(divide(speeds[Core[cmov].WALK],2));
                return Object.keys(speeds).map(function(index) {
                    let distance = speeds[index];
                    if(Core[cmov].SWIM === index || Core[cmov].CLIMB === index){
                        // swim speed is essentiall half walking speed rounded down if character doesn't have a set swim speed:
                        // source https://www.dndbeyond.com/sources/basic-rules/adventuring#ClimbingSwimmingandCrawling
                        distance = speeds[index] <= 0 ? halfSpeed : speeds[index];
                    }
                    return {
                        id: charf2.getMovementTypeBySpeedMovementKey(index),
                        key: index,
                        name: charf2.getSpeedMovementKeyLabel(index, ruleData),
                        distance: distance
                    }
                });
            }

            return {
                name: charf1.getName(state),
                avatarUrl: charf1.getAvatarUrl(state),
                spellCasterInfo: charf1.getSpellCasterInfo(state),
                armorClass: charf1.getAcTotal(state),
                initiative: charf1.getProcessedInitiative(state),
                hasInitiativeAdvantage: charf1.getHasInitiativeAdvantage(state),
                resistances: charf1.getActiveGroupedResistances(state),
                immunities: charf1.getActiveGroupedImmunities(state),
                vulnerabilities: charf1.getActiveGroupedVulnerabilities(state),
                conditions: charf1.getActiveConditions(state),
                choiceInfo: charf1.getChoiceInfo(state),
                classes: charf1.getClasses(state),
                feats: charf1.getBaseFeats(state),
                race: charf1.getRace(state),
                currentXp: charf1.getCurrentXp(state),
                preferences: charf1.getCharacterPreferences(state),
                totalClassLevel: charf1.getTotalClassLevel(state),
                spellCasterInfo: charf1.getSpellCasterInfo(state),
                startingClass: charf1.getStartingClass(state),
                background: charf1.getBackgroundInfo(state),
                notes: charf1.getCharacterNotes(state),
                totalWeight: charf1.getTotalWeight(state),
                carryCapacity: charf1.getCarryCapacity(state),
                pushDragLiftWeight: charf1.getPushDragLiftWeight(state),
                encumberedWeight: charf1.getEncumberedWeight(state),
                heavilyEncumberedWeight: charf1.getHeavilyEncumberedWeight(state),
                preferences: charf1.getCharacterPreferences(state),
                currencies: charf1.getCurrencies(state),
                attunedSlots: charf1.getAttunedSlots(state),
                attunableArmor: charf1.getAttunableArmor(state),
                attunableGear: charf1.getAttunableGear(state),
                attunableWeapons: charf1.getAttunableWeapons(state),
                startingClass: charf1.getStartingClass(state),
                background: charf1.getBackgroundInfo(state),
                equipped: {
                    armorItems: charf1.getEquippedArmorItems(state),
                    weaponItems: charf1.getEquippedWeaponItems(state),
                    gearItems: charf1.getEquippedGearItems(state)
                },
                unequipped: {
                    armorItems: charf1.getUnequippedArmorItems(state),
                    weaponItems: charf1.getUnequippedWeaponItems(state),
                    gearItems: charf1.getUnequippedGearItems(state)
                },
                hitPointInfo: charf1.getHitPointInfo(state),
                fails: charf1.getDeathSavesFailCount(state),
                successes: charf1.getDeathSavesSuccessCount(state),
                abilities: charf1.getAbilities(state), // not sure what the difference is between this and abilityLookup, seems to be one is a object, the other an array...
                abilityLookup: charf1.getAbilityLookup(state),
                proficiencyBonus: charf1.getProficiencyBonus(state),
                speeds: getSpeedData(charf1.getCurrentWeightSpeed(state)),
                preferences: charf1.getCharacterPreferences(state),
                inspiration: charf1.getInspiration(state),
                passivePerception: charf1.getPassivePerception(state),
                passiveInvestigation: charf1.getPassiveInvestigation(state),
                passiveInsight: charf1.getPassiveInsight(state),
                senses: getSenseData(charf1.getSenseInfo(state)), //has to be further processed
                skills: charf1.getSkills(state),
                customSkills: charf1.getCustomSkills(state),
                savingThrowDiceAdjustments: charf1.getSavingThrowDiceAdjustments(state),
                situationalBonusSavingThrowsLookup: charf1.getSituationalBonusSavingThrowsLookup(state),
                deathSaveInfo: charf1.getDeathSaveInfo(state),
                proficiencyGroups: charf1.getProficiencyGroups(state),
                background: charf1.getBackgroundInfo(state),
                alignment: charf1.getAlignment(state),
                height: charf1.getHeight(state),
                weight: charf1.getWeight(state),
                size: charf1.getSize(state),
                faith: charf1.getFaith(state),
                skin: charf1.getSkin(state),
                eyes: charf1.getEyes(state),
                hair: charf1.getHair(state),
                age: charf1.getAge(state),
                gender: charf1.getGender(state),
                traits: charf1.getCharacterTraits(state),
                notes: charf1.getCharacterNotes(state),
                levelSpells: charf1.getLevelSpells(state),
                spellCasterInfo: charf1.getSpellCasterInfo(state),
                ruleData: charf1.getRuleData(state),
                xpInfo: charf1.getExperienceInfo(state),
                spellSlots: charf1.getSpellSlots(state),
                pactMagicSlots: charf1.getPactMagicSlots(state),
                attunedSlots: charf1.getAttunedSlots(state),
                hasMaxAttunedItems: charf1.hasMaxAttunedItems(state),
                weaponSpellDamageGroups: charf1.getWeaponSpellDamageGroups(state),
                inventory: charf1.getInventory(state),
                creatures: charf1.getCreatures(state),
                customItems: charf1.getCustomItems(state),
                weight: charf1.getTotalWeight(state),
                weightSpeedType: charf1.getCurrentWeightType(state),
                notes: charf1.getCharacterNotes(state),
                currencies: charf1.getCurrencies(state),
                activatables: charf1.getActivatables(state),
                attacks: charf1.getAttacks(state),
                weaponSpellDamageGroups: charf1.getWeaponSpellDamageGroups(state),
                attacksPerActionInfo: charf1.getAttacksPerActionInfo(state),
                ritualSpells: charf1.getRitualSpells(state),
                spellCasterInfo: charf1.getSpellCasterInfo(state),
                originRefRaceData: charf1.getDataOriginRefRaceData(state),
                hasSpells: charf1.hasSpells(state),
                optionalOrigins: charf1.getOptionalOrigins(state),
            }
        }
        window.moduleExport = {
            getCharData : getCharData,
            getAuthHeaders : getAuthHeaders,
        }
        console.log("Module 2080: end");
    }
};


// --------------------------------------------------------------------------------
// Main Function
// --------------------------------------------------------------------------------

(function () {
    campaignID = window.location.pathname.match(charIDRegex);
    stylesheetUrls.forEach(loadStylesheet); //load and insert each stylesheet in the settings
    loadModules(initalModules); //load the module loader which imports from window.jsonpDDBCT and the inputted modules
    insertCampaignElements();
    findTargets();
    insertElements();
    window.moduleExport.getAuthHeaders()().then((function (headers) {
        authHeaders = headers;
        console.log("authHeaders: ", headers);
        retriveRules().then(() =>{
            updateAllCharData();
        }).catch((error) => {
            console.log(error);
        });
    }));
})();

// --------------------------------------------------------------------------------
// Functions
// --------------------------------------------------------------------------------

function findTargets() {
    console.log("Locating Characters from Window");
    $(linkUrlTarget).each(function (index, value) {
        var url = value.html;
        console.debug("Processing: " + url);
        var charID = 0;
        var matchArr = value.href.match(charIDRegex);
        if (matchArr.length > 0) {
            var charIDStr = matchArr[1];
            if (charIDStr == "") {
                console.warn("error: empty charIdStr");
            } else {
                charID = parseInt(charIDStr);
            }
        } else {
            console.warn("error: no numbers found in " + value.href);
        }
        if (charID != 0) {
            let node = $(value).parents('li');
            let type = 'unknown';
            let typeNode = $(value).parents('.ddb-campaigns-detail-body-listing');
            if(typeNode.hasClass('ddb-campaigns-detail-body-listing-active')){
                let unassignedNode = $(value).parents('.ddb-campaigns-detail-body-listing-unassigned-active');
                if(unassignedNode.length > 0){
                    type = 'unassigned';
                } else {
                    type = 'active';
                }
            } else if(typeNode.hasClass('ddb-campaigns-detail-body-listing-inactive')){
                type = 'deactivated';
            }
            charactersData[charID] = {
                node: node,
                url: charJSONurlBase + charID,
                state: {
                    appEnv: {
                        authEndpoint: "https://auth-service.dndbeyond.com/v1/cobalt-token", characterEndpoint: "", characterId: charID, characterServiceBaseUrl: null, diceEnabled: true, diceFeatureConfiguration: {
                            apiEndpoint: "https://dice-service.dndbeyond.com", assetBaseLocation: "https://www.dndbeyond.com/dice", enabled: true, menu: true, notification: false, trackingId: ""
                        }, dimensions: { sheet: { height: 0, width: 1200 }, styleSizeType: 4, window: { height: 571, width: 1920 } }, isMobile: false, isReadonly: false, redirect: undefined, username: "example"
                    },
                    appInfo: { error: null },
                    character: {},
                    characterEnv: { context: "SHEET", isReadonly: false, loadingStatus: "LOADED" },
                    confirmModal: { modals: [] },
                    modal: { open: {} },
                    ruleData: {},
                    serviceData: { classAlwaysKnownSpells: {}, classAlwaysPreparedSpells: {}, definitionPool: {}, infusionsMappings: [], knownInfusionsMappings: [], ruleDataPool: {}, vehicleComponentMappings: [], vehicleMappings: [] },
                    sheet: { initError: null, initFailed: false },
                    sidebar: { activePaneId: null, alignment: "right", isLocked: false, isVisible: false, panes: [], placement: "overlay", width: 340 },
                    syncTransaction: { active: false, initiator: null },
                    toastMessage: {}
                },
                data: {},
                type: type,
            }

            for (let ruleID in optionalRules){
                charactersData[charID].state.serviceData.definitionPool[optionalRules[ruleID].category] = {
                    accessTypeLookup:{},
                    definitionLookup:{},
                };
            }
        } else {
            console.warn("warn: skipping " + value.href + " due to ID not found");
        }
    });
    console.log("Finished locating Characters from Window");
    //console.debug(charactersData);
}

function insertElements() {
    console.log("Inserting Structual Elements");
    for(let id in charactersData) {
        let node = charactersData[id].node;
        node.addClass('.gs-' + id);
        node.append(mainInfoHTML); // add the structure for the main info adjacent ro the player card;
        node.find('.ddb-campaigns-character-card-header').append(quickInfoHTML); // add the structure for quick stats inside player card
    };
}

function retriveRules(charIDs) {
    return new Promise(function (resolve, reject) {
        console.log("Retriving Rules Data");
        getJSONfromURLs(rulesUrls).then((js) => {
            console.log("Rules Data Processing Start");
            js.forEach(function(rule, index){
                isSuccessfulJSON(rule, index);
            });
            rulesData = {
                ruleset : js[0].data,
                vehiclesRuleset : js[1].data
            }
            for(let id in charactersData){
                charactersData[id].state.ruleData = rulesData.ruleset;
                charactersData[id].state.serviceData.ruleDataPool = rulesData.vehiclesRuleset;
            }
            console.debug("Rules Data:");
            console.debug(rulesData);
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

function getRules(index){
    return rulesData[index];
}

function updateAllCharData() {
    console.log("Retriving Each Char Data");
    //console.debug(charactersData);
    let promises = []
    for(let id in charactersData){
        promises.push(updateCharData(charactersData[id].url));
    }
    //console.log(charactersData);
    Promise.all(promises)
        .then(() =>{
        updateCampaignData();
    }).catch((error) => {
        console.log(error);
    });
    updateVisibility();

    startRefreshTimer();
    console.log("Updated All Char Data");
}

function updateCharData(url) {

    return new Promise(function (resolve, reject) {
        console.log("Retriving Char Data");
        getJSONfromURLs([url]).then((js) => {
            //window.jstest = js;
            js.forEach(function(charJSON, index){
                if(isSuccessfulJSON(charJSON, index)){
                    let charId = charJSON.data.id;
                    console.debug("Processing Char: " + charId);
                    charactersData[charId].state.character = charJSON.data;
                    let promises = retriveCharacterRules(charId)
                    Promise.all(promises).then(()=>{
                        var charData = window.moduleExport.getCharData(charactersData[charId].state);
                        charactersData[charId].data = charData;
                        updateElementData(charactersData[charId]);
                        console.log("Retrived Char Data for char " + charId + " aka " + charactersData[charId].data.name);
                        console.log(charactersData[charId]);
                        resolve();
                    });
                } else {
                    console.log("Char URL " + url + " was skipped");
                }
            });
        }).catch((error) => {
            console.log(error);
            reject();
        });
    });

}

function retriveCharacterRules(charId) {
    let promises = [];
    console.log("Looking for optional rules for " + charactersData[charId].data.name);
    for(let ruleID in optionalRules){
        if(ruleID in charactersData[charId].state.character && charactersData[charId].state.character[ruleID].length > 0 ){
            console.log("Optional ruleset for " + ruleID + " found.");
            promises.push(retriveCharacterRule(charId, ruleID));
        }
    }
    return promises;
}

function retriveCharacterRule(charId, ruleID) {
    let url = gameCollectionUrl.prefix + optionalRules[ruleID].category + gameCollectionUrl.postfix;

    let ruleIds = []
    for(let item of charactersData[charId].state.character[ruleID]){
        ruleIds.push(item[optionalRules[ruleID].id]);
    }

    let body = {"campaignId":null,"sharingSetting":2,"ids":ruleIds};
    return new Promise(function (resolve, reject) {
        getJSONfromURLs([url], body).then((js) => {
            js.forEach(function(charJSON, index){
                console.log("Retrived " + ruleID + " data, processing.");
                console.log(charJSON);
                if(charJSON.success && charJSON.data.definitionData != undefined){
                    for(let data of charJSON.data.definitionData){
                        charactersData[charId].state.serviceData.definitionPool[optionalRules[ruleID].category].definitionLookup[data.id] = data;
                        charactersData[charId].state.serviceData.definitionPool[optionalRules[ruleID].category].accessTypeLookup[data.id] = 1;
                    }
                }
                console.log(ruleID + " finished processing.");
            });
            resolve();

        }).catch((error) => {
            console.log(error);
            reject();
        });
    });
}

function startRefreshTimer() {
    //get timeout value
    let refreshTime = parseInt($('input[name ="gs-auto-duration"]').val());
    let refreshTimeMiliSecs = refreshTime * 1000;
    console.log("Starting Refresh Timer: " + refreshTime);
    setTimeout(function () {
        //only refresh when checkbox is checked
        if ($('input[name ="gs-auto-update"]').is(':checked')) {
            updateAllCharData();
        }else{
            startRefreshTimer();
        }
    }, refreshTimeMiliSecs);
}

// --------------------------------------------------------------------------------
//        Element Updating Functions
// --------------------------------------------------------------------------------

function insertCampaignElements() {
    console.log("Inseting Campaign Elements");
    let campaignPrefix = scriptVarPrefix + "-" + campaignID;
    $(campaignElementTarget + " > div:nth-child(1)").after(controlsHTML);
    campaignNode = $(".gs-campaign");
    insertControls(campaignNode, campaignPrefix);
    insertVisibilityControls(campaignNode, campaignPrefix);
    insertStoredElements(campaignNode, campaignPrefix);
}

function insertControls(parent, campaignPrefix) {
    console.log("Inseting Main Controls");

    let controlsNode = parent.find('.gs-controls');

    let autoUpdate = controlsNode.find('input[name ="gs-auto-update"]');
    let autoDuration = controlsNode.find('input[name ="gs-auto-duration"]');

    // Loads ideally value set for this campaign, if not found it loads the last saved value otherwise it defaults
    let autoUpdateLoaded = GM_getValue(campaignPrefix + "-autoUpdate", GM_getValue(scriptVarPrefix + "-autoUpdate", autoUpdateDefault));
    let updateDurationLoaded = GM_getValue(campaignPrefix + "-updateDuration", GM_getValue(scriptVarPrefix + "-updateDuration", updateDurationDefault))

    autoUpdate.prop('checked', autoUpdateLoaded);
    autoDuration.prop('value', updateDurationLoaded);

    autoUpdate.change(function () {
        let updatedAutoUpdate = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-autoUpdate", updatedAutoUpdate);
        GM_setValue(scriptVarPrefix + "-autoUpdate", updatedAutoUpdate);
    });
    autoDuration.change(function () {
        let updatedAutoDuration = parseIntSafe($(this).val());
        GM_setValue(campaignPrefix + "-updateDuration", updatedAutoDuration);
        GM_setValue(scriptVarPrefix + "-updateDuration", updatedAutoDuration);
    });
}

function insertVisibilityControls(parent, campaignPrefix) {
    console.log("Inseting Visibility Controls");

    let controlsNode = parent.find('.gs-views');

    let showAbilities = controlsNode.find('input[name ="gs-show-abilities"]');
    let showSavingThrows = controlsNode.find('input[name ="gs-show-saving-throws"]');
    let showSenses = controlsNode.find('input[name ="gs-show-senses"]');
    let showClasses = controlsNode.find('input[name ="gs-show-classes"]');
    let showResources = controlsNode.find('input[name ="gs-show-resources"]');

    // Loads ideally value set for this campaign, if not found it loads the last saved value otherwise it defaults
    let showAbilitiesLoaded = GM_getValue(campaignPrefix + "-showAbilities", GM_getValue(scriptVarPrefix + "-showAbilities", showAbilitiesDefault));
    let showSavingThrowsLoaded = GM_getValue(campaignPrefix + "-showSavingThrows", GM_getValue(scriptVarPrefix + "-showSavingThrows", showSavingThrowsDefault));
    let showSensesLoaded = GM_getValue(campaignPrefix + "-showSenses", GM_getValue(scriptVarPrefix + "-showSenses", showSensesDefault));
    let showClassesLoaded = GM_getValue(campaignPrefix + "-showClasses", GM_getValue(scriptVarPrefix + "-showClasses", showClassesDefault));
    let showResourcesLoaded = GM_getValue(campaignPrefix + "-showResources", GM_getValue(scriptVarPrefix + "-showResources", showResourcesDefault));

    showAbilities.prop('checked', showAbilitiesLoaded);
    showSavingThrows.prop('checked', showSavingThrowsLoaded);
    showSenses.prop('checked', showSensesLoaded);
    showClasses.prop('checked', showClassesLoaded);
    showResources.prop('checked', showResourcesLoaded);

    showAbilities.change(function () {
        let updatedShowAbilities = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-showAbilities", updatedShowAbilities);
        GM_setValue(scriptVarPrefix + "-showAbilities", updatedShowAbilities);
        updateVisibility();
    });
    showSavingThrows.change(function () {
        let updatedShowSavingThrows = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-showSavingThrows", updatedShowSavingThrows);
        GM_setValue(scriptVarPrefix + "-showSavingThrows", updatedShowSavingThrows);
        updateVisibility();
    });
    showSenses.change(function () {
        let updatedShowSensesUpdate = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-showSenses", updatedShowSensesUpdate);
        GM_setValue(scriptVarPrefix + "-showSenses", updatedShowSensesUpdate);
        updateVisibility();
    });
    showClasses.change(function () {
        let updatedShowClasses = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-showClasses", updatedShowClasses);
        GM_setValue(scriptVarPrefix + "-showClasses", updatedShowClasses);
        updateVisibility();
    });
    showResources.change(function () {
        let updatedShowResources = parseBool($(this).prop("checked"));
        GM_setValue(campaignPrefix + "-showResources", updatedShowResources);
        GM_setValue(scriptVarPrefix + "-showResources", updatedShowResources);
        updateVisibility();
    });
}

function updateVisibility() {
    console.log("Updating data visibility");

    let abilities = $('input[name ="gs-show-abilities"]').is(':checked');
    let saves = $('input[name ="gs-show-saving-throws"]').is(':checked');
    let senses = $('input[name ="gs-show-senses"]').is(':checked');
    let classes = $('input[name ="gs-show-classes"]').is(':checked');
    let resources = $('input[name ="gs-show-resources"]').is(':checked');

    $('.gs-main-able').toggle(abilities);
    $('.gs-main-saves').toggle(saves);
    $('.gs-main-able').parents('.gs-container').toggle(abilities || saves);

    $('.gs-senses').toggle(senses);
    $('.gs-classes').toggle(classes);
    $('.gs-resources').toggle(resources);
    $('.gs-senses').parents('.gs-container').toggle(senses || classes || resources);
}

function insertStoredElements(parent, campaignPrefix) {
    console.log("Inseting Stored Elements");
    let storedNode = parent.find('.gs-stored');
    insertCurrencies(storedNode, campaignPrefix);
}

function insertCurrencies(parent, campaignPrefix){
    console.log("Updating Campaign Currencies Data");
    let currenciesLoaded = GM_getValue(campaignPrefix + "-currencies", currenciesDefault);
    //console.log(currenciesLoaded);
    let container = parent.find('.gs-camp-currencies > .gs-container');

    let currencyAmount = parent.find('.gs-camp-currencies > .gs-form-group input[name="gs-currency-amount"]');
    let currencyType = parent.find('.gs-camp-currencies > .gs-form-group select[name="gs-currency-type"]');
    let currencyConfirm = parent.find('.gs-camp-currencies > .gs-form-group button[name="gs-currency-confirm"]');

    for(let id in currenciesTypeDefault){
        let currency = currenciesTypeDefault[id];
        $('<option/>', {
            value: id,
            class: 'gs-currency-type-option gs-currency-type-' + id + '-option',
            html: currency.name
        }).appendTo(currencyType);
    }

    currencyType.val(currenciesMainDefault);

    currencyConfirm.click(function () {
        let updatedAmount = parseIntSafe(currencyAmount.val());
        if(updatedAmount != 0){
            let selectedType = currencyType.val();
            if(updatedAmount != undefined){
                let currenciesUpdate = GM_getValue(campaignPrefix + "-currencies", currenciesDefault);
                if(currenciesUpdate[selectedType] == undefined){
                    currenciesUpdate[selectedType] = 0;
                }
                currenciesUpdate[selectedType] += updatedAmount;
                GM_setValue(campaignPrefix + "-currencies", currenciesUpdate);
                updateCurrency(container, selectedType, currenciesUpdate[selectedType]);
            }
        }
    });

    for(let id in currenciesLoaded){
        updateCurrency(container, id, currenciesLoaded[id]);
    }
}

function updateCurrency(parent, id, value){
    let curCurrency = parent.find('.gs-currency-' + id);
    //console.log(curCurrency);
    if (curCurrency.length < 1) {
        parent.append(currencyHTML);
        curCurrency = parent.children().last();
        curCurrency.addClass('gs-currency-' + id);
        curCurrency.find('.gs-currency-label').html(id);
    }
    curCurrency.find('.gs-currency-number').html(value);
}

function updateCampaignData(){
    console.log("Updating Campaign Data");
    let outputsNode = campaignNode.find(".gs-outputs");
    updateLanguages(outputsNode);
}

function updateLanguages(parent){
    console.log("Updating Campaign Languages Data");
    let languages = {};
    for(let id in charactersData){
        let character = charactersData[id];
        if(character.type == 'active'){
            let charLanguages = character.data.proficiencyGroups.find(function (e) { return e.label == 'Languages'; });
            for(let index in charLanguages.modifierGroups){
                let language = charLanguages.modifierGroups[index];
                if (language.label != undefined){
                    if(languages[language.label] == undefined){
                        languages[language.label] = [];
                    }
                    languages[language.label].push({
                        id: id,
                        name: character.data.name
                    });
                }
            }
        }
    }
    let container = parent.find('.gs-camp-languages > .gs-container');
    container.empty();

    //console.log(languages);
    for(let id in languages){
        container.append(languageHTML);
        let curLanguage = container.children().last();
        curLanguage.addClass('gs-language-' + id);
        curLanguage.find('.gs-language-text').html(id);
    }
}


function updateElementData(character) { // function that builds the scraped data and renders it on the page.
    //console.log("Updating Information in HTML Elements");
    updateQuickInfo(character.node, character.data);
    updateMainInfo(character.node, character.data);
}

function updateQuickInfo(parent, character){
    var quickInfo = parent.find('.gs-quick-info');
    updateHitPointInfo(quickInfo, character.hitPointInfo);
    updateArmorClass(quickInfo, character.armorClass);
    updateInitiative(quickInfo, character.initiative);
    updateSpeeds(quickInfo, character.speeds);
}

function updateHitPointInfo(parent, hitPointInfo){
    parent.find('.gs-hp-cur').html(hitPointInfo.remainingHp);
    parent.find('.gs-hp-max').html(hitPointInfo.totalHp);
}

function updateArmorClass(parent, armorClass){
    parent.find('.gs-ac-value').html(armorClass);
}

function updateInitiative(parent, initiative){
    parent.find('.gs-intv-sign').html(getSign(initiative));
    parent.find('.gs-intv-number').html(Math.abs(initiative));
}

function updateSpeeds(parent, speeds){
    //Adds character speeds to the speed module
    let container = parent.find('.gs-speeds > .gs-container');
    container.empty();

    speeds.forEach(function(item, index){
        //console.log(item);
        if(item.distance > 0){
            container.append(speedHTML);
            let curSpeed = container.children().last();
            //console.log(curSpeed);
            curSpeed.addClass('gs-speed-' + item.key);
            curSpeed.find('.gs-speed-label').html(item.name);
            curSpeed.find('.gs-speed-number').html(item.distance);
            curSpeed.find('.gs-speed-affix').html(distanceUnit(item.distance));
        }
    });
    if (container.children().length < 1) {
        parent.find('.gs-speeds').addClass("gs-empty");
    }
}

function updateMainInfo(parent, character){
    var mainInfo = parent.find('.gs-main-info');
    updateAbilties(mainInfo, character.abilities);
    updatePassives(mainInfo, character.passivePerception, character.passiveInvestigation, character.passiveInsight);
    updateSenses(mainInfo, character.senses);
    updateClasses(mainInfo, character.classes, character.spellCasterInfo.castingInfo);
    updateResources(mainInfo, character.inventory);
}

function updateAbilties(parent, abilities){
    var containerAble = parent.find('.gs-main-able > .gs-container');
    var containerSave = parent.find('.gs-main-saves > .gs-container');
    containerAble.empty();
    containerSave.empty();
    abilities.forEach(function(item, index){
        //console.log(item);
        // Abilities
        containerAble.append(abilityHTML);
        let curAble = containerAble.children().last();
        curAble.addClass('gs-able-' + item.name);
        curAble.find('.gs-able-label').html(item.name);
        curAble.find('.gs-able-prefix').html(abilitySVGs[item.name]);
        curAble.find('.gs-able-number').html(item.totalScore);
        curAble.find('.gs-able-mod-sign').html(getSign(item.modifier));
        curAble.find('.gs-able-mod-value').html(Math.abs(item.modifier));

        // Saving Throws
        containerSave.append(savingThrowsHTML);
        let curSave = containerSave.children().last();
        curSave.addClass('gs-saves-' + item.name);
        curSave.find('.gs-saves-label').html(item.name);
        curSave.find('.gs-saves-prefix').html(abilitySVGs[item.name]);
        curSave.find('.gs-saves-sign').html(getSign(item.save));
        curSave.find('.gs-saves-number').html(Math.abs(item.save));
    });
}

function updatePassives(parent, passPerception, passInvestigation, passInsight){
    // add passive senses data
    let container = parent.find('.gs-passives > .gs-container');
    container.find('.gs-passivePerception .gs-passives-number').html(passPerception);
    container.find('.gs-passiveInvestigation .gs-passives-number').html(passInvestigation);
    container.find('.gs-passiveInsight .gs-passives-number').html(passInsight);
}

function updateSenses(parent, senses){
    // add additional senses data if exsists
    let container = parent.find('.gs-additonal-senses > .gs-container');
    container.empty();
    senses.forEach(function(item, index){
        //console.log(item);
        if(item.distance > 0){
            container.append(additonalSenseHTML);
            let curSense = container.children().last();
            curSense.addClass('gs-additonal-sense-' + item.key);
            curSense.find('.gs-additonal-sense-text').html(item.name);
            curSense.find('.gs-additonal-sense-number').html(item.distance);
            curSense.find('.gs-additonal-sense-affix').html(distanceUnit(item.distance));
        }
    });
    if (container.children().length < 1) {
        parent.find('.gs-additonal-senses').addClass("gs-empty");
    }
}

function updateClasses(parent, classes, casting){
    //Adds classes and thier relevant spell modifiers, save dcs and attacks to the classes module
    let container = parent.find('.gs-classes > .gs-container');
    container.empty();

    for(let i = 0; i < casting.modifiers.length; i++ ) {
        let modifier = casting.modifiers[i];
        let saveDc = casting.saveDcs[i];
        let attacks = casting.spellAttacks[i];
        let charClass = classes.find(function (e) { return e.id == modifier.sources[0].id; })

        container.append(classHTML);
        let curClass = container.children().last();

        curClass.addClass('gs-class-' + charClass.slug);
        curClass.find('.gs-class-label').html(charClass.definition.name);
        curClass.find('.gs-spellmod-number').html(modifier.value);
        curClass.find('.gs-spellsavedc-number').html(saveDc.value);
        curClass.find('.gs-spellattack-number').html(attacks.value);
    }
    if (container.children().length < 1) {
        parent.find('.gs-classes').addClass("gs-empty");
    }
}

function updateResources(parent, infos){
    //Adds resources quantities
    let container = parent.find('.gs-resources > .gs-container');
    container.empty();

    let listResources = {
        "Rations (1 day)": "ration",
        "Healing Potion": "healing-potion"
    };

    for (let i = 0; i < infos.length; i++){
        let currentItem = infos[i];

        if (!(currentItem.definition.name in listResources)) {
            continue;
        }

        let divInfo = listResources[currentItem.definition.name];

        container.append(resourcesHTML);
        let curClass = container.children().last();

        curClass.addClass('gs-class-resources');
        curClass.find('.gs-' + divInfo + '-number').html(currentItem.quantity);
        console.log(curClass);
    }
    if (container.children().length < 1) {
        parent.find('.gs-resources').addClass("gs-empty");
    }
}



// --------------------------------------------------------------------------------
//        D&DBeyond Module Loader
// --------------------------------------------------------------------------------

function loadModules(modules) {
    /*
        A near direct copy of the function from http://media.dndbeyond.com/character-tools/characterTools.bundle.71970e5a4989d91edc1e.min.js
        This basically loads in the modules in https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.f8b53c07d1796f1d29cb.min.js and similar module based scripts
        these are stored in window.jsonpDDBCT and can be loaded by this script and interacted with by active modules
    */
    console.log("Loading modules");
    function webpackJsonpCallback(data) {
        /*
            This allows additonal modules to be added run, the input format needs to be at least a two dimentional array,
            e.g. [[2],[function (module, exports, __webpack_require__) {...},...]] or [2],{34: function (module, exports, __webpack_require__) {...},...}] if you want to have set module id's
            you can also run modules by adding a third element to the argument data, e.g. [4],{69: function (module, __webpack_exports__, __webpack_require__) {...},...}, [69,4]] which will run the module 69 in chunk 4
            I am not 100% on the logic of this, so feel free to expand on this and futher comment to help out!
        */
        var chunkIds = data[0];
        var moreModules = data[1];
        var executeModules = data[2];
        var moduleId,
            chunkId,
            i = 0,
            resolves = [];
        for (; i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
                resolves.push(installedChunks[chunkId][0])
            }
            installedChunks[chunkId] = 0
        }
        for (moduleId in moreModules) {
            if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                modules[moduleId] = moreModules[moduleId]
            }
        }
        if (parentJsonpFunction) parentJsonpFunction(data);
        while (resolves.length) {
            resolves.shift()()
        }
        deferredModules.push.apply(deferredModules, executeModules || []);
        return checkDeferredModules()
    }
    function checkDeferredModules() {
        var result;
        for (var i = 0; i < deferredModules.length; i++) {
            var deferredModule = deferredModules[i];
            var fulfilled = true;
            for (var j = 1; j < deferredModule.length; j++) {
                var depId = deferredModule[j];
                if (installedChunks[depId] !== 0) fulfilled = false
            }
            if (fulfilled) {
                deferredModules.splice(i--, 1);
                result = __webpack_require__(__webpack_require__.s = deferredModule[0])
            }
        }
        return result
    }
    var installedModules = {};
    var installedChunks = {
        0: 0
    };
    var deferredModules = [];
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            })
        }
    };
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            })
        }
        Object.defineProperty(exports, "__esModule", {
            value: true
        })
    };
    __webpack_require__.t = function (value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != "string"){
            for (var key in value){
                __webpack_require__.d(ns, key, function (key) {
                    return value[key]
                }.bind(null, key));
            }
        }

        return ns
    };
    __webpack_require__.n = function (module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module.default
        }
        : function getModuleExports() {
            return module
        };
        __webpack_require__.d(getter, "a", getter);
        return getter
    };
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property)
    };
    __webpack_require__.p = "";
    var jsonpArray = window.jsonpDDBCT = window.jsonpDDBCT || [];
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray); //This allows additonal modules to be added and run by using window.jsonpDDBCT.push(modules) which calls webpackJsonpCallback(modules) above
    jsonpArray.push2 = webpackJsonpCallback;
    jsonpArray = jsonpArray.slice();
    for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
    var parentJsonpFunction = oldJsonpFunction;
    deferredModules.push([2080, 2]); //This sets module 2080 as an active module and is run after the other modules are loaded
    checkDeferredModules();
    console.log("Finished loading modules");
}


// --------------------------------------------------------------------------------
//        Generic Functions
// --------------------------------------------------------------------------------

function isSuccessfulJSON(js, name){
    let success = true;
    if(js.length < 1 || js.success == undefined){
        console.warn("JSON " + name + " is malformed");
        return false;
    } else if (js.success == false){
        console.warn("JSON " + name + "'s retrieval was unsuccessful");
        return false;
    } else if (js.success != true) {
        console.warn("JSON " + name + "'s retrieval was unsuccessful and is malformed");
        return false;
    } else if (js.data == undefined || js.data.length < 1) {
        console.warn("JSON " + name + "'s data is malformed");
        return false;
    }
    return true;
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

function getJSONfromURLs(urls, body, headers, cookies) {
    return new Promise(function (resolve, reject) {
        console.log("Fetching: ", urls);
        var proms = urls.map(d => fetchRequest(d, body, cookies));
        Promise.all(proms)
            .then(ps => Promise.all(ps.map(p => p.json()))) // p.json() also returns a promise
            .then(jsons => {
            console.log("JSON Data Retrived");
            resolve(jsons);
        })
            .catch((error) => {
            reject(error);
        });
    });
}
function fetchRequest(url, body, headers, cookies) {
    let options = {};
    let myHeaders = new Headers({
        'X-Custom-Header': 'hello world',
    });
    for(let id in authHeaders){
        myHeaders.append(id, authHeaders[id]);
    }
    if(body != undefined && body != ''){
        options.method = 'POST'
        myHeaders.append('Accept','application/json');
        myHeaders.append('Content-Type','application/json');
        options.body = JSON.stringify(body);
    }
    if(cookies != undefined && cookies != ''){
        options.cookies = cookies;
    }
    options.credentials = 'include';
    options.headers = myHeaders;
    console.log(options);
    return fetch(url, options);
}

function getSign(input){
    let number = parseIntSafe(input);
    return number >= 0 ? positiveSign : negativeSign
}

function roundDown(input){
    let number = parseInt(input);
    if (isNaN(number)) {
        return NaN;
    }
    return Math.floor(input);
}

function roundUp(input){
    let number = parseInt(input);
    if (isNaN(number)) {
        return NaN;
    }
    return Math.ceil(input);
}

function divide(numeratorInput, denominatorInput){
    let numerator = parseInt(numeratorInput);
    let denominator = parseInt(denominatorInput);
    if (isNaN(numerator) || isNaN(denominator)) {
        return NaN;
    }
    return numerator/denominator;
}

function distanceUnit(input){
    let number = parseIntSafe(input);
    let unit = 'ft.';
    if (number && number % FEET_IN_MILES === 0) {
        number = number / FEET_IN_MILES;
        unit = 'mile' + (Math.abs(number) === 1 ? '' : 's');
    }
    return unit;
}

function parseIntSafe(input){
    let number = parseInt(input);
    if (isNaN(number)) {
        number = 0;
    }
    return number;
}

function parseBool(x) {
    return x ? true : false;
}
