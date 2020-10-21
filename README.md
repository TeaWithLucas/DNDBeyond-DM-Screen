# D&DBeyond DM Screen

This Tampermonkey or Greecemonkey userscript aims to provide simple DM screen by scraping character sheet for relevant values. It works on campaign screen and shows stats, HP, AC and passives.

## Usage

1. Install Tampermonkey or Greecemonkey, addon for managing userscripts. Get [Tampermonkey here](https://www.tampermonkey.net/) or Get [Greecemonkey here](https://wiki.greasespot.net/) 
2. Install new script from below link: https://github.com/TeaWithLucas/DNDBeyond-DM-Screen/raw/master/ddb-dm-screen.user.js
3. Open your campaign, can be found here https://dndbeyond.com/my-campaigns, bask in the glory
4. It autoupdates, yay

## Features

The following are features currently built into the system, see below for further possible expansions

* Loads information about each of the characters in your campaign on the campaign page and displays important or useful information about each
* Calcalates additional information not available on the character sheet:
** Climbing and swimming speed of non climbers and swimmers
* Displays information regarding all characters:
** Known langauges to all characters in the campaign
* Stores additonal information (BETA) to your browser for the campaign
** Currencies, can be used for storing group funds
* Can auto-refresh at any given interval


## Ideas

The new system is much more modular and contains far more information than is currently displayed, [a full list is here](../../wiki/Module-output)
There is lots we can do with the data that isn't implemented, so feel free to play around and come up with what you'd find useful!

Some ideas for future work:
* more info - add e.g. resistances, conditions, languages, proficiences etc to the characters
* calculated info and more like long jump and high jump, useful as its not done by dndbeyond for some reason.
* Tabs for characters in the main info section to allow to switch to other info like notes quickly 
* Toggle sections - different info can be shown and hidden e.g. hide abilities, saving throws, speed, etc ... using new control group at the top, would make it less busy for those who want it or allow for only the relevant info to show when wanted.
* Streamer mode - Toggle setting to hide everything but the controls and characters, shrink everything and make full screen to allow a live updating summary of characters
* Health and Conditons Interactable - Would only be available for DM and character owner, not sure if possible, allow for additons and removal of health and conditions
* Group items - Like campaign currencies, a seproate storage for group items, may be too ambitions/time consuming to do.

## Images

![Screenshot of the DM Screen](https://i.imgur.com/F2hdXDg.png)

## Note from the Orignal Author

This is a fork from @mivalsten: 
If you like my work and would like to thank me, please donate to your local cause. Women shelters, LGBTQ and Pro-LGBTQ organisations or animal rights activists would please me the most. Thanks a lot and spread the love!

## Security

Remember to never paste unknown userscripts from some shady github repos to your tampermonkey addon as this can severely compromise your PC.
