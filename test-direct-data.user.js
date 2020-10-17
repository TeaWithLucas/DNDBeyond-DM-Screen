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



parsedata(8048112);

(function() {
})();

function parsedata(characterId) {

	var curstate = {
		appEnv: {
			authEndpoint: "https://auth-service.dndbeyond.com/v1/cobalt-token",
			characterEndpoint: "",
			characterId: 0,
			characterServiceBaseUrl: null,
			diceEnabled: true,
			diceFeatureConfiguration: {
				apiEndpoint: "https://dice-service.dndbeyond.com",
				assetBaseLocation: "https://www.dndbeyond.com/dice",
				enabled: true,
				menu: true,
				notification: false,
				trackingId: ""
			},
			dimensions: {
				sheet: {
					height: 0,
					width: 1200
				},
				styleSizeType: 4,
				window: {
					height: 571,
					width: 1920
				}
			},
			isMobile: false,
			isReadonly: false,
			redirect: undefined,
			username: "example"
		},
		appInfo: {
			error: null
		},
		character: {},
		characterEnv: {
			context: "SHEET",
			isReadonly: false,
			loadingStatus: "LOADED"
		},
		confirmModal: {
			modals: []
		},
		modal: {
			open: {}
		},
		ruleData: {},
		serviceData: {
			classAlwaysKnownSpells: {},
			classAlwaysPreparedSpells: {},
			definitionPool: {},
			infusionsMappings: [],
			knownInfusionsMappings: [],
			ruleDataPool: {},
			vehicleComponentMappings: [],
			vehicleMappings: []
		},
		sheet: {
			initError: null,
			initFailed: false
		},
		sidebar: {
			activePaneId: null,
			alignment: "right",
			isLocked: false,
			isVisible: false,
			panes: [],
			placement: "overlay",
			width: 340
		},
		syncTransaction: {
			active: false,
			initiator: null
		},
		toastMessage: {}
	}

    curstate.appEnv.characterId = characterId;
    var urls = ["https://character-service.dndbeyond.com/character/v4/character/" + characterId, "https://character-service.dndbeyond.com/character/v4/rule-data?v=3.11.3", "https://gamedata-service.dndbeyond.com/vehicles/v3/rule-data?v=3.11.3"];
    var proms = urls.map(d => fetch(d));

    Promise.all(proms)
    .then(ps => Promise.all(ps.map(p => p.json()))) // p.json() also returns a promise
    .then(js => {
        curstate.character = js[0].data;
        curstate.ruleData = js[1].data;
        curstate.serviceData.ruleDataPool = js[2].data;
        var info = window.getCharData(curstate);
		console.log(info);
    });
}

(function(modules) {

    function webpackJsonpCallback(data) {
        var chunkIds = data[0];
        var moreModules = data[1];
        var executeModules = data[2];
        var moduleId, chunkId, i = 0, resolves = [];
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
        if (parentJsonpFunction)
            parentJsonpFunction(data);
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
                if (installedChunks[depId] !== 0)
                    fulfilled = false
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
    __webpack_require__.d = function(exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            })
        }
    }
    ;
    __webpack_require__.r = function(exports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            })
        }
        Object.defineProperty(exports, "__esModule", {
            value: true
        })
    }
    ;
    __webpack_require__.t = function(value, mode) {
        if (mode & 1)
            value = __webpack_require__(value);
        if (mode & 8)
            return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule)
            return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != "string")
            for (var key in value)
                __webpack_require__.d(ns, key, function(key) {
                    return value[key]
                }
                .bind(null, key));
        return ns
    }
    ;
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module["default"]
        }
        : function getModuleExports() {
            return module
        }
        ;
        __webpack_require__.d(getter, "a", getter);
        return getter
    }
    ;
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property)
    }
    ;
    __webpack_require__.p = "";
    var jsonpArray = window["jsonpDDBCT"] = window["jsonpDDBCT"] || [];
    var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
    jsonpArray.push2 = webpackJsonpCallback;
    jsonpArray = jsonpArray.slice();
    for (var i = 0; i < jsonpArray.length; i++)
        webpackJsonpCallback(jsonpArray[i]);
    var parentJsonpFunction = oldJsonpFunction;
    deferredModules.push([1080, 2]);
    return checkDeferredModules()
}
)
({
	1080: function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
		__webpack_require__.r(__webpack_exports__);
		console.log("1080: Hello");
// 		console.log(__webpack_require__);
// 		var react = __webpack_require__(0);
//      var poo = __webpack_require__(4);
// 		var react_default = __webpack_require__.n(react);
// 		var react_dom = __webpack_require__(84);
// 		var react_dom_default = __webpack_require__.n(react_dom);
// 		var es = __webpack_require__(10);
		var character_rules_engine_lib_es = __webpack_require__(1);
		var character_rules_engine_web_adapter_es = __webpack_require__(136);
        function getCharData(state){
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
                abilities: character_rules_engine_lib_es["jb"].getAbilities(state),
                proficiencyBonus: character_rules_engine_lib_es["jb"].getProficiencyBonus(state),
                speeds: character_rules_engine_lib_es["jb"].getCurrentWeightSpeed(state),
                preferences: character_rules_engine_lib_es["jb"].getCharacterPreferences(state),
                inspiration: character_rules_engine_lib_es["jb"].getInspiration(state),
                passivePerception: character_rules_engine_lib_es["jb"].getPassivePerception(state),
                passiveInvestigation: character_rules_engine_lib_es["jb"].getPassiveInvestigation(state),
                passiveInsight: character_rules_engine_lib_es["jb"].getPassiveInsight(state),
                senses: character_rules_engine_lib_es["jb"].getSenseInfo(state),
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
                abilityLookup: character_rules_engine_lib_es["jb"].getAbilityLookup(state),
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
                hasSpells: character_rules_engine_lib_es["jb"].hasSpells(state),
            }
        }
        window.getCharData = getCharData;
        console.log("1080: Bye");
	}
});
