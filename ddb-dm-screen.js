// ==UserScript==
// @name         ddb-dm-screen
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var characterArr = [];
    console.log(characterArr);
    $('.ddb-campaigns-character-card-footer-links-item-view').each(
        function(index, value) {
            //if not ddb-campaigns-detail-body-listing-inactive
            if (!($(this).parents().hasClass('ddb-campaigns-detail-body-listing-inactive'))) {
                var charString = $(this).attr('href')+"/json";
                console.log(charString);
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var myObj = JSON.parse(this.responseText);
                        console.log(myObj);
                        characterArr.push(myObj);
                    }
                };
                xmlhttp.open("GET", charString, true);
                xmlhttp.send();
            };
        }
    );
    // end get charater loop

    for (var i = 0; i < characterArr.length; i++) {
        console.log(characterArr[i]);
    }
})();
