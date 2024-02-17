// ==UserScript==
// @name         Test Direct Data
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.dndbeyond.com/campaigns/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.f8b53c07d1796f1d29cb.min.js
// @grant        none
// ==/UserScript==

var rulesUrls = ["https://character-service.dndbeyond.com/character/v4/rule-data?v=3.11.3", "https://gamedata-service.dndbeyond.com/vehicles/v3/rule-data?v=3.11.3"];
var charJSONurlBase = "https://character-service.dndbeyond.com/character/v4/character/";

var rulesData = {}, charactersData = {};

var charIDs = [8048112, 33178712, 35899931, 10026953];
onload(charIDs);

(function() {
})();

function onload(charIDs){
    console.log("Starting Test Direct Data");
    retriveRules().then(() =>{
        generateCharStates(charIDs);
        updateCharData();
    }).catch((error) => {
        console.log(error);
    });
}

function retriveRules(charIDs) {
    return new Promise(function (resolve, reject) {
        console.log("Retriving Rules Data");
        getJSONfromURLs(rulesUrls).then((js) => {
            console.log("Rules Data Processing Start");
            js.forEach(function(rule, index){
                if (rule.success == null || rule.lenth < 1 || rule.success != true){
                    console.warn("ruleset " + index + " is null, empty or fail");
                }
            });
            rulesData = {
                ruleset : js[0].data,
                vehiclesRuleset : js[1].data
            }
            console.debug("Rules Data:");
            console.debug(rulesData);
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

function generateCharStates(charIDs) {
    console.log("Starting Char State Generation");
    charIDs.forEach(generateCharState);
}

function generateCharState(charID) {
    var stateTemplate = {
        appEnv: {
            authEndpoint: "https://auth-service.dndbeyond.com/v1/cobalt-token", characterEndpoint: "", characterId: 0, characterServiceBaseUrl: null, diceEnabled: true, diceFeatureConfiguration: {
                apiEndpoint: "https://dice-service.dndbeyond.com", assetBaseLocation: "https://www.dndbeyond.com/dice", enabled: true, menu: true, notification: false, trackingId: ""
            }, dimensions: { sheet: { height: 0, width: 1200 }, styleSizeType: 4, window: { height: 571, width: 1920 } }, isMobile: false, isReadonly: false, redirect: undefined, username: "example"
        },
        appInfo: { error: null },
        character: {},
        characterEnv: { context: "SHEET", isReadonly: false, loadingStatus: "LOADED" },
        confirmModal: { modals: [] },
        modal: { open: {} },
        ruleData: rulesData.ruleset,
        serviceData: { classAlwaysKnownSpells: {}, classAlwaysPreparedSpells: {}, definitionPool: {}, infusionsMappings: [], knownInfusionsMappings: [], ruleDataPool: rulesData.vehiclesRuleset, vehicleComponentMappings: [], vehicleMappings: [] },
        sheet: { initError: null, initFailed: false },
        sidebar: { activePaneId: null, alignment: "right", isLocked: false, isVisible: false, panes: [], placement: "overlay", width: 340 },
        syncTransaction: { active: false, initiator: null },
        toastMessage: {}
    }

    console.debug("Generating char: " + charID);
    charactersData[charID] = {
        url:  charJSONurlBase + charID,
        state: stateTemplate,
        data: {}
    }
    charactersData[charID].state.appEnv.characterId = charID;
}

function updateCharData() {
    console.log("Retriving Char Data");
	var charURLs = [];
	for(var charID in charactersData){
		charURLs.push(charactersData[charID].url);
	}
	getJSONfromURLs(charURLs).then((js) => {
        window.jstest = js;
        js.forEach(function(charJSON, index){
            if (charJSON.success == null || charJSON.lenth < 1 || charJSON.success != true){
                console.warn("charJSON " + index + " is null, empty or fail");
            }
            var charId = charJSON.data.id;
            console.debug("Processing Char: " + charId);
			charactersData[charId].state.character = charJSON.data;
			var charData = window.getCharData(charactersData[charId].state);
			charactersData[charId].data = charData;
        });
        console.log("Updated Char Data");
        console.debug(charactersData);
		updateCharInfo();
	}).catch((error) => {
		console.log(error);
	});
}

function updateCharInfo() {
    console.log("Updating Char Info");
    //insert data processing here
}


(function (modules) {
    /*
        A near direct copy of the function from http://media.dndbeyond.com/character-tools/characterTools.bundle.71970e5a4989d91edc1e.min.js
        This basically loads in the modules in https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.f8b53c07d1796f1d29cb.min.js which is loaded by this script
    */
    function webpackJsonpCallback(data) {
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
            return module["default"]
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
    var jsonpArray = window["jsonpDDBCT"] = window["jsonpDDBCT"] || [];
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
    jsonpArray.push2 = webpackJsonpCallback;
    jsonpArray = jsonpArray.slice();
    for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
    var parentJsonpFunction = oldJsonpFunction;
    deferredModules.push([1080, 2]);
    return checkDeferredModules()
})
({
    1080: function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        console.log("Module 1080: start");
        // Unused modules:
        // var react = __webpack_require__(0);
        // var react_default = __webpack_require__.n(react);
        // var react_dom = __webpack_require__(84);
        // var react_dom_default = __webpack_require__.n(react_dom);
        // var es = __webpack_require__(10);
        var Core = __webpack_require__(5);
        var character_rules_engine_lib_es = __webpack_require__(1);
        var character_rules_engine_web_adapter_es = __webpack_require__(136);
        function getCharData(state) {
            /*
                All parts of the following return are from http://media.dndbeyond.com/character-tools/characterTools.bundle.71970e5a4989d91edc1e.min.js, they are found in functions that have: '_mapStateToProps(state)' in the name, like function CharacterManagePane_mapStateToProps(state)
                Any return that uses the function character_rules_engine_lib_es or character_rules_engine_web_adapter_es can be added to this for more return values as this list is not comprehensive.
                Anything with selectors_appEnv is unnessisary,as it just returns values in state.appEnv.
            */
            console.log("Module 1080: Processing State Info Into Data");

            var ruleData = character_rules_engine_lib_es["jb"].getRuleData(state);

            function getSenseData(senses){ // finds returns the label
                return Object.keys(senses).map(function(index) {
                    let indexInt = parseInt(index);
                    return {
                        id: indexInt,
                        key: character_rules_engine_lib_es["R"].getSenseTypeModifierKey(indexInt),
                        name: character_rules_engine_lib_es["R"].getSenseTypeLabel(indexInt),
                        distance: senses[indexInt]
                    }
                })
            }

            function getSpeedData(speeds){ // finds returns the label
                let halfSpeed = roundDown(divide(speeds[Core['W'].WALK],2));
                return Object.keys(speeds).map(function(index) {
                    let distance = speeds[index];
                    if(Core['W'].SWIM === index || Core['W'].CLIMB === index){
                        // swim speed is essentiall half walking speed rounded down if character doesn't have a set swim speed:
                        // source https://www.dndbeyond.com/sources/basic-rules/adventuring#ClimbingSwimmingandCrawling
                        distance = speeds[index] <= 0 ? halfSpeed : speeds[index];
                    }
                    return {
                        id: character_rules_engine_lib_es["R"].getMovementTypeBySpeedMovementKey(index),
                        key: index,
                        name: character_rules_engine_lib_es["R"].getSpeedMovementKeyLabel(index, ruleData),
                        distance: distance
                    }
                });
            }

            return {
                name: character_rules_engine_lib_es["jb"].getName(state),
                avatarUrl: character_rules_engine_lib_es["jb"].getAvatarUrl(state),
                spellCasterInfo: character_rules_engine_lib_es["jb"].getSpellCasterInfo(state),
                armorClass: character_rules_engine_lib_es["jb"].getAcTotal(state),
                initiative: character_rules_engine_lib_es["jb"].getProcessedInitiative(state),
                hasInitiativeAdvantage: character_rules_engine_lib_es["jb"].getHasInitiativeAdvantage(state),
                resistances: character_rules_engine_lib_es["jb"].getActiveGroupedResistances(state),
                immunities: character_rules_engine_lib_es["jb"].getActiveGroupedImmunities(state),
                vulnerabilities: character_rules_engine_lib_es["jb"].getActiveGroupedVulnerabilities(state),
                conditions: character_rules_engine_lib_es["jb"].getActiveConditions(state),
                choiceInfo: character_rules_engine_lib_es["jb"].getChoiceInfo(state),
                classes: character_rules_engine_lib_es["jb"].getClasses(state),
                feats: character_rules_engine_lib_es["jb"].getBaseFeats(state),
                race: character_rules_engine_lib_es["jb"].getRace(state),
                currentXp: character_rules_engine_lib_es["jb"].getCurrentXp(state),
                preferences: character_rules_engine_lib_es["jb"].getCharacterPreferences(state),
                totalClassLevel: character_rules_engine_lib_es["jb"].getTotalClassLevel(state),
                spellCasterInfo: character_rules_engine_lib_es["jb"].getSpellCasterInfo(state),
                startingClass: character_rules_engine_lib_es["jb"].getStartingClass(state),
                background: character_rules_engine_lib_es["jb"].getBackgroundInfo(state),
                notes: character_rules_engine_lib_es["jb"].getCharacterNotes(state),
                totalWeight: character_rules_engine_lib_es["jb"].getTotalWeight(state),
                carryCapacity: character_rules_engine_lib_es["jb"].getCarryCapacity(state),
                pushDragLiftWeight: character_rules_engine_lib_es["jb"].getPushDragLiftWeight(state),
                encumberedWeight: character_rules_engine_lib_es["jb"].getEncumberedWeight(state),
                heavilyEncumberedWeight: character_rules_engine_lib_es["jb"].getHeavilyEncumberedWeight(state),
                preferences: character_rules_engine_lib_es["jb"].getCharacterPreferences(state),
                currencies: character_rules_engine_lib_es["jb"].getCurrencies(state),
                attunedSlots: character_rules_engine_lib_es["jb"].getAttunedSlots(state),
                attunableArmor: character_rules_engine_lib_es["jb"].getAttunableArmor(state),
                attunableGear: character_rules_engine_lib_es["jb"].getAttunableGear(state),
                attunableWeapons: character_rules_engine_lib_es["jb"].getAttunableWeapons(state),
                startingClass: character_rules_engine_lib_es["jb"].getStartingClass(state),
                background: character_rules_engine_lib_es["jb"].getBackgroundInfo(state),
                equipped: {
                    armorItems: character_rules_engine_lib_es["jb"].getEquippedArmorItems(state),
                    weaponItems: character_rules_engine_lib_es["jb"].getEquippedWeaponItems(state),
                    gearItems: character_rules_engine_lib_es["jb"].getEquippedGearItems(state)
                },
                unequipped: {
                    armorItems: character_rules_engine_lib_es["jb"].getUnequippedArmorItems(state),
                    weaponItems: character_rules_engine_lib_es["jb"].getUnequippedWeaponItems(state),
                    gearItems: character_rules_engine_lib_es["jb"].getUnequippedGearItems(state)
                },
                hitPointInfo: character_rules_engine_lib_es["jb"].getHitPointInfo(state),
                fails: character_rules_engine_lib_es["jb"].getDeathSavesFailCount(state),
                successes: character_rules_engine_lib_es["jb"].getDeathSavesSuccessCount(state),
                abilities: character_rules_engine_lib_es["jb"].getAbilities(state), // not sure what the difference is between this and abilityLookup, seems to be one is a object, the other an array...
                //abilityLookup: character_rules_engine_lib_es["jb"].getAbilityLookup(state),
                proficiencyBonus: character_rules_engine_lib_es["jb"].getProficiencyBonus(state),
                speeds: getSpeedData(character_rules_engine_lib_es["jb"].getCurrentWeightSpeed(state)),
                preferences: character_rules_engine_lib_es["jb"].getCharacterPreferences(state),
                inspiration: character_rules_engine_lib_es["jb"].getInspiration(state),
                passivePerception: character_rules_engine_lib_es["jb"].getPassivePerception(state),
                passiveInvestigation: character_rules_engine_lib_es["jb"].getPassiveInvestigation(state),
                passiveInsight: character_rules_engine_lib_es["jb"].getPassiveInsight(state),
                senses: getSenseData(character_rules_engine_lib_es["jb"].getSenseInfo(state)), //has to be further processed
                overridePassivePerception: character_rules_engine_lib_es["jb"].getOverridePassivePerception(state),
                customSensesLookup: character_rules_engine_lib_es["jb"].getCustomSenseLookup(state),
                customSenses: character_rules_engine_lib_es["jb"].getCustomSenses(state),
                skills: character_rules_engine_lib_es["jb"].getSkills(state),
                customSkills: character_rules_engine_lib_es["jb"].getCustomSkills(state),
                abilities: character_rules_engine_lib_es["jb"].getAbilities(state),
                savingThrowDiceAdjustments: character_rules_engine_lib_es["jb"].getSavingThrowDiceAdjustments(state),
                situationalBonusSavingThrowsLookup: character_rules_engine_lib_es["jb"].getSituationalBonusSavingThrowsLookup(state),
                deathSaveInfo: character_rules_engine_lib_es["jb"].getDeathSaveInfo(state),
                proficiencyGroups: character_rules_engine_lib_es["jb"].getProficiencyGroups(state),
                background: character_rules_engine_lib_es["jb"].getBackgroundInfo(state),
                alignment: character_rules_engine_lib_es["jb"].getAlignment(state),
                height: character_rules_engine_lib_es["jb"].getHeight(state),
                weight: character_rules_engine_lib_es["jb"].getWeight(state),
                size: character_rules_engine_lib_es["jb"].getSize(state),
                faith: character_rules_engine_lib_es["jb"].getFaith(state),
                skin: character_rules_engine_lib_es["jb"].getSkin(state),
                eyes: character_rules_engine_lib_es["jb"].getEyes(state),
                hair: character_rules_engine_lib_es["jb"].getHair(state),
                age: character_rules_engine_lib_es["jb"].getAge(state),
                gender: character_rules_engine_lib_es["jb"].getGender(state),
                traits: character_rules_engine_lib_es["jb"].getCharacterTraits(state),
                notes: character_rules_engine_lib_es["jb"].getCharacterNotes(state),
                levelSpells: character_rules_engine_lib_es["jb"].getLevelSpells(state),
                spellCasterInfo: character_rules_engine_lib_es["jb"].getSpellCasterInfo(state),
                ruleData: character_rules_engine_lib_es["jb"].getRuleData(state),
                xpInfo: character_rules_engine_lib_es["jb"].getExperienceInfo(state),
                spellSlots: character_rules_engine_lib_es["jb"].getSpellSlots(state),
                pactMagicSlots: character_rules_engine_lib_es["jb"].getPactMagicSlots(state),
                attunedSlots: character_rules_engine_lib_es["jb"].getAttunedSlots(state),
                hasMaxAttunedItems: character_rules_engine_lib_es["jb"].hasMaxAttunedItems(state),
                weaponSpellDamageGroups: character_rules_engine_lib_es["jb"].getWeaponSpellDamageGroups(state),
                inventory: character_rules_engine_lib_es["jb"].getInventory(state),
                creatures: character_rules_engine_lib_es["jb"].getCreatures(state),
                customItems: character_rules_engine_lib_es["jb"].getCustomItems(state),
                weight: character_rules_engine_lib_es["jb"].getTotalWeight(state),
                weightSpeedType: character_rules_engine_lib_es["jb"].getCurrentWeightType(state),
                notes: character_rules_engine_lib_es["jb"].getCharacterNotes(state),
                currencies: character_rules_engine_lib_es["jb"].getCurrencies(state),
                activatables: character_rules_engine_lib_es["jb"].getActivatables(state),
                attacks: character_rules_engine_lib_es["jb"].getAttacks(state),
                weaponSpellDamageGroups: character_rules_engine_lib_es["jb"].getWeaponSpellDamageGroups(state),
                attacksPerActionInfo: character_rules_engine_lib_es["jb"].getAttacksPerActionInfo(state),
                ritualSpells: character_rules_engine_lib_es["jb"].getRitualSpells(state),
                spellCasterInfo: character_rules_engine_lib_es["jb"].getSpellCasterInfo(state),
            }
        }
        window.getCharData = getCharData;
        console.log("Module 1080: end");
    }
});


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Generic Functions
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function loadStylesheet(href) {
    console.debug('Start: Adding CSS Stylesheet ' + href);
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    document.head.appendChild(link);
    console.debug('Done: Adding CSS Stylesheet');
}

function getJSONfromURLs(urls) {
    return new Promise(function (resolve, reject) {
        console.log("Fetching: ", urls);
        var proms = urls.map(d => fetch(d));
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
function getSign(input){
    if (input == null){
        input = 0;
    }
    return input >= 0 ? positiveSign : negativeSign
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
    let number = parseInt(input);
    if (isNaN(number)) {
        number = 0;
    }
    let unit = 'ft.';
    if (number && number % FEET_IN_MILES === 0) {
        number = number / FEET_IN_MILES;
        unit = 'mile' + (Math.abs(number) === 1 ? '' : 's');
    }
    return unit;
}