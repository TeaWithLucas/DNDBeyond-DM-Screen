// ==UserScript==
// @name         D&DBeyond DM Screen
// @namespace    https://github.com/TeaWithLucas/ddb-dm-screen/tree/Test
// @version      2.3.1
// @description  Advanced DM screen for D&DBeyond campaigns
// @author       TeaWithLucas
// @match        https://www.dndbeyond.com/campaigns/*
// @updateURL    https://github.com/TeaWithLucas/ddb-dm-screen/raw/Test/ddb-dm-screen.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant    		 GM_addStyle
// @license      MIT; https://github.com/TeaWithLucas/ddb-dm-screen/blob/Test/LICENSE
// ==/UserScript==

var $ = window.jQuery;

console.log("Starting D&DBeyond DM Screen");

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        SVG Data
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var savingThrowRowBowSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.1 34" class="ddbc-svg ddbc-saving-throw-row-box-svg ddbc-svg--empty"><g id="SavingThrowRowBoxSvg-Page-1_1_"><g id="SavingThrowRowBoxSvg-Sheet_Desktop_Static" transform="translate(-683.000000, -651.000000)"><path fill="#d8d8d8" id="SavingThrowRowBoxSvg-Page-1" d="M789.8,651h-22l-0.3,0.2c-1.2,0.8-2.3,1.7-3.2,2.7h-75.6l-0.3,0.4c-0.7,1.2-3,4.5-4.9,5.4l-0.5,0.2l0,16.1l0.5,0.2c1.8,0.9,4.1,4.2,4.9,5.4l0.3,0.4h75.6c1,1,2.1,1.9,3.2,2.7l0.3,0.2h21.9l0.3-0.2c5.6-3.8,9-10,9-16.8s-3.4-13-9-16.8L789.8,651z M797.1,668c0,5.8-2.9,11.2-7.6,14.5h-10.3c-4.7-2.1-11.1-3.2-14.3-3.8c-2.3-3-3.7-6.8-3.7-10.7v0c0-3.9,1.3-7.7,3.7-10.7c3.1-0.6,9.5-1.7,14.3-3.8h10.3C794.3,656.8,797.1,662.2,797.1,668L797.1,668z M752.8,655.6c0.8,0.7,2.5,1.8,5.7,2.1c-0.9,1.5-3,5.5-3,10.3s2,8.8,3,10.3c-3.2,0.3-4.9,1.4-5.7,2.1h-55.4c-3.1-1.1-11.1-4.5-12.9-9.3l0-6.2c1.9-4.8,9.9-8.1,12.9-9.3H752.8z M759.6,657.8c0.6,0,1.3,0,2,0c-1.8,3.1-2.8,6.6-2.8,10.3v0c0,3.7,1,7.2,2.9,10.3c-0.7,0-1.3-0.1-2,0c-0.6-1-3.1-5.2-3.1-10.2S759,658.8,759.6,657.8L759.6,657.8z M768.9,682.5c-1.1-0.8-2.1-1.7-3-2.6c2.4,0.5,5.1,1.3,8.3,2.6H768.9L768.9,682.5z M762.2,679.3c0.3,0.4,0.5,0.7,0.8,1.1h-8.5C755.9,679.7,758.3,678.9,762.2,679.3L762.2,679.3z M689.3,680.4c-0.7-1.1-2.8-4.1-4.9-5.4v-1.9c2.3,3.4,7.1,5.9,10.4,7.3H689.3L689.3,680.4z M684.4,661c2.1-1.3,4.2-4.3,4.9-5.4h5.5c-3.3,1.4-8,3.9-10.4,7.3V661L684.4,661z M763,655.6c-0.3,0.4-0.5,0.7-0.8,1.1c-3.9,0.4-6.3-0.4-7.7-1.1H763z M765.9,656.1c0.9-1,1.9-1.9,3-2.6h5.3C771,654.8,768.2,655.6,765.9,656.1L765.9,656.1z"></path></g></g></svg>';
var abilityScoreBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 95" class="ddbc-svg ddbc-ability-score-box-svg "><path fill="#FEFEFE" d="M77.56,53.81a4.55,4.55,0,0,1-1.64-3.69c0-6.29-1.3-14.52,1.37-20.68A5,5,0,0,1,76,26.51a5.3,5.3,0,0,1-.72-6c1.28-2.68,1.17-6.68.88-9.54a4.15,4.15,0,0,1,1.22-3.27c.12-.62.23-1.24.35-1.86C73.47,7.49,70.86,2,70.86,2H10.14S8,6.44,4.48,6.16A5.61,5.61,0,0,1,4.63,7.5c0,1.54-.17,3.1-.21,4.66.09,1.24.23,2.47.44,3.68a33,33,0,0,1,1.58,7.78,4.58,4.58,0,0,1-1.05,3.21,4.79,4.79,0,0,1-1.47,2.34,5.17,5.17,0,0,1,.5,2.12c.18,6.94.78,13.53.25,20.5a5,5,0,0,1-1.2,3c.06,2,0,4,0,6.07a4.61,4.61,0,0,1,.44,3.71C1.64,73,6.36,78,12.35,82.16a5.16,5.16,0,0,1,.49.21c.91.5,1.81,1,2.73,1.55a1,1,0,0,0,.17.1c.54.3,1.09.59,1.66.85a2.39,2.39,0,0,1,.21.13h1.85a4.21,4.21,0,0,1-1.19-1.92,9.45,9.45,0,0,1-.9-6.13,3.71,3.71,0,0,1,.18-1.22c.16-.41.32-.79.49-1.15A10.44,10.44,0,0,1,21,70.26c.11-.12.21-.25.32-.36a14.53,14.53,0,0,1,1.91-1.84,18.26,18.26,0,0,1,6-3.17,21.13,21.13,0,0,1,4.9-1.39c6.15-1.45,14.34-.72,19.85,2.51.67.3,1.33.62,1.94,1a6.52,6.52,0,0,1,.67.45l.07,0a14.44,14.44,0,0,1,4,3.33,4.51,4.51,0,0,1,.77,1,22.47,22.47,0,0,1,1.29,1.89,4.61,4.61,0,0,1,.57,3.41,5.42,5.42,0,0,1,.27,1.78,5.73,5.73,0,0,1-.27,2.33,5.11,5.11,0,0,1-1.29,3.1,3.79,3.79,0,0,1-.66.72h2.68a4.41,4.41,0,0,1,2.21-1.49c1.34-.86,2.74-1.65,4.06-2.61,1.7-1.26,5.14-3.55,5.9-5.61A5.51,5.51,0,0,1,76.8,74a7.8,7.8,0,0,0,.37-1.71,5.4,5.4,0,0,1,.34-1.56c-.09-1.51-.18-3-.41-4.53a6.21,6.21,0,0,1,.5-3.74C77.46,59.57,77.46,56.64,77.56,53.81Z"></path><path fill="#FEFEFE" d="M40.5,66C50.7,66,59,71.61,59,78.5S50.7,91,40.5,91,22,85.39,22,78.5,30.3,66,40.5,66"></path><path fill="#972e2e" d="M4.52,13.62A34.66,34.66,0,0,1,3.08,6.26l0-.42.63-.2C5.22,5.18,9.41,3.35,9.41,1V0H71.59V1c0,2.37,4.19,4.2,5.66,4.66l.63.2,0,.42a35.34,35.34,0,0,1-1.44,7.36L76,7.3C74.42,6.71,70.47,5,69.74,2H11.26C10.52,5,6.58,6.71,5,7.3ZM2.32,79.46H2.6c.08-1.12.16-2.38.24-3.76A13,13,0,0,1,.63,69.83,9.4,9.4,0,0,1,3.21,62.6V61.43S1.83,35.67.56,31.56L.4,31l.47-.29a12.31,12.31,0,0,0,2.2-1.87,6.23,6.23,0,0,0,1.55-2.24A5.08,5.08,0,0,0,5,23.27c0-.11-.58-1.35-1.12-3l-.26,2.85c.27.79.5,1.63.71,2.49a5.17,5.17,0,0,1-1.56,2A33.13,33.13,0,0,0,1.74,23.6l-.07-.2L2.91,9.63c0,2,1.38,6.53,1.38,6.53a36.23,36.23,0,0,0,2.1,6.67A7.13,7.13,0,0,1,5,28.71C6.68,38,5.08,71,4.87,74.89A15.6,15.6,0,0,1,3,71.41c.08-2,.13-4.16.16-6.41a7.57,7.57,0,0,0-1.15,4.71,12,12,0,0,0,2.1,5.41l.15.22.45.64.06.07h0a29.64,29.64,0,0,0,5.74,5.66A39.48,39.48,0,0,1,14,83.83h0l.26.18c.79.54,1.55,1.09,2.29,1.65l.18.13h0c1.42,1.09,2.71,2.17,3.78,3.11,1.39,0,2.75.11,4,.22a16.4,16.4,0,0,1-3.19-3.33H17.91l-2.49-2h2.32a16.19,16.19,0,0,1-.88-4.16,4.31,4.31,0,0,1-5.21,1.79c.59.18,3,.53,5.24-4.08v0a8.24,8.24,0,0,1,2.52-5.32,13.54,13.54,0,0,0-1,10.29A1.76,1.76,0,0,0,19.8,83,11.36,11.36,0,0,1,19,78.77c0-8.55,9.66-15.51,21.54-15.51S62,70.22,62,78.77A11.36,11.36,0,0,1,61.2,83a1.76,1.76,0,0,0,1.34-.64,13.54,13.54,0,0,0-1-10.29A8.24,8.24,0,0,1,64.1,77.4v0c2.2,4.61,4.64,4.26,5.24,4.08a4.31,4.31,0,0,1-5.21-1.79,16.19,16.19,0,0,1-.88,4.16h2.32l-2.49,2H59.68a16.4,16.4,0,0,1-3.19,3.33c1.2-.11,2.57-.21,4-.22,1.07-.94,2.36-2,3.78-3.11h0l.18-.13c.74-.56,1.5-1.11,2.29-1.65l.26-.18h0a39.48,39.48,0,0,1,3.49-2.11,29.64,29.64,0,0,0,5.74-5.66h0l.06-.07.45-.64.15-.22A12,12,0,0,0,79,69.71,7.64,7.64,0,0,0,77.8,65c0,2.25.08,4.41.16,6.41a15.6,15.6,0,0,1-1.83,3.48C75.92,71,74.32,38,76,28.71a7.1,7.1,0,0,1-1.34-5.88,38.28,38.28,0,0,0,2.09-6.67s1.4-4.48,1.38-6.53L79.33,23.4l-.07.2a33.13,33.13,0,0,0-1.07,4.08,5.39,5.39,0,0,1-1.57-2c.22-.86.45-1.7.71-2.49l-.25-2.85c-.54,1.61-1.07,2.85-1.12,3a5.08,5.08,0,0,0,.42,3.36,6.23,6.23,0,0,0,1.55,2.24,12.31,12.31,0,0,0,2.2,1.87l.48.29-.17.53c-1.26,4.11-2.64,29.87-2.64,29.87,0,.39,0,.79,0,1.17a9.4,9.4,0,0,1,2.58,7.23,13.37,13.37,0,0,1-2.2,5.89c.07,1.38.15,2.64.23,3.76h.28c1.49-.12,2.79.71,2.16,1.75a2.46,2.46,0,0,1-1.72,1.15,2.58,2.58,0,0,0,.75-.85c.17-.3,0-.44-.14-.51l-.38,0h0a7.86,7.86,0,0,0-.84,0c.18,2.31.32,3.71.33,3.79L79,85.79H66.64c-1.46,1-2.84,2.15-4,3.15a11.85,11.85,0,0,1,7,2.12l-2.75,1.09h0a30,30,0,0,1-5.35,1.74h0l-.33,0L61,94c-9.66,1.67-10.67.75-10.67.75A10.09,10.09,0,0,0,57.11,92l.23-.24c.1-.1.62-.62,1.46-1.4-.62,0-1.22.07-1.81.12h0l-.44,0a8.82,8.82,0,0,0-1.18.23,7.12,7.12,0,0,0-.87.27l-.14,0a6.24,6.24,0,0,0-1,.44l-.11.07a5.63,5.63,0,0,0-.77.54l-.22.19a4.82,4.82,0,0,0-.75.86l-7.89.9.06,0a26.18,26.18,0,0,1-6.46,0l.06,0-7.89-.9a4.5,4.5,0,0,0-.76-.86l-.22-.2a7,7,0,0,0-.79-.55l-.09-.06a8.88,8.88,0,0,0-.95-.44L26.45,91c-.3-.11-.59-.2-.86-.27-.46-.11-.86-.17-1.14-.21l-.44,0h0c-.59,0-1.19-.09-1.81-.12.84.78,1.36,1.3,1.45,1.4l.24.24a10.09,10.09,0,0,0,6.78,2.71s-1,.92-10.67-.75l-.24,0-.33,0h0a29.76,29.76,0,0,1-5.35-1.74h0l-2.75-1.09a11.85,11.85,0,0,1,7-2.12c-1.2-1-2.58-2.1-4-3.15H2l.12-1.08c0-.08.15-1.48.33-3.79a7.86,7.86,0,0,0-.84,0h0l-.38,0c-.17.07-.31.21-.14.51a2.5,2.5,0,0,0,.74.85A2.47,2.47,0,0,1,.16,81.21c-.63-1,.67-1.87,2.16-1.75ZM76.78,49.11c.53-5.66,1.25-14.21,2.15-17.46a15.6,15.6,0,0,1-1.28-1,144.6,144.6,0,0,0-.87,18.5ZM74.63,80a11.89,11.89,0,0,1,1.8-.35c0-.46-.07-1-.1-1.48-.57.67-1.15,1.28-1.7,1.83Zm-5,3.82h7.17c-.06-.66-.15-1.61-.24-2.76a18.56,18.56,0,0,0-6.93,2.76ZM58.69,92.48l.07,0c1.06.59,4.54-.45,7.31-1.59a17.09,17.09,0,0,0-5.08-.6c-1.07,1-1.88,1.72-2.3,2.14ZM40.5,92.14c7,0,13-2.55,16.48-6.35.27-.3.53-.62.78-.94a.61.61,0,0,1,.07-.1,9.16,9.16,0,0,0,.61-.92,9.74,9.74,0,0,0,1.46-5.06c0-7.37-8.7-13.37-19.4-13.37s-19.4,6-19.4,13.37a9.83,9.83,0,0,0,1.45,5.06c.19.32.4.62.62.92l.08.1c.24.32.5.64.77.94,3.43,3.8,9.52,6.35,16.48,6.35ZM20,90.34a17.09,17.09,0,0,0-5.08.6c2.78,1.14,6.25,2.18,7.31,1.59l.07,0c-.42-.42-1.22-1.18-2.3-2.14ZM4.57,79.66a12.14,12.14,0,0,1,1.8.35c-.55-.55-1.13-1.16-1.7-1.83,0,.52-.07,1-.1,1.48Zm-.35,4.17h7.17a18.62,18.62,0,0,0-6.93-2.76c-.09,1.15-.18,2.1-.24,2.76Zm0-34.72a144.6,144.6,0,0,0-.87-18.5,15.6,15.6,0,0,1-1.28,1C3,34.9,3.68,43.45,4.22,49.11Z"></path></svg>';
var armorClassBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 90" class="ddbc-svg ddbc-armor-class-box-svg "><path fill="#FEFEFE" d="M72.8,30.7v13.7c-1,3.6-9.7,30.9-31.9,38.6c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C26,78.7,17.9,68.6,12.9,59.8c0,0,0,0,0,0c-0.3-0.5-0.6-1-0.8-1.5c-3.6-6.7-5.4-12.4-5.9-14V30.7c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.2-4,8.5-11.5,9.2-15.2L38.1,7c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.4,6.6c0.8,3.6,3,11.1,9.2,15.2V29c0,0.2,0,0.4,0.1,0.6C71.8,30.1,72.3,30.5,72.8,30.7z"></path><path fill="#972e2e" d="M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3c0,0.8,0.5,1.5,1.2,1.7V44.3z M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3c0,0.8,0.5,1.5,1.2,1.7V44.3z M78.1,24.5c-8.7-1.8-9.9-14.9-9.9-15l-0.1-0.8L39.5,0L10.9,8.7l-0.1,0.8c0,0.1-1.2,13.3-9.9,15l-1,0.2v20.4v0.3C0,45.8,9.6,82.1,39.1,89.9l0.3,0.1l0.3-0.1C69.5,82.1,79,45.8,79.1,45.4V24.7L78.1,24.5z M76.7,45C76,47.5,66.6,80.1,39.5,87.5C12.6,80.1,3.2,47.4,2.5,45V26.7c8.3-2.4,10.3-13,10.7-16.1l26.4-8l26.4,8c0.4,3.1,2.4,13.7,10.7,16.1V45z M63.5,13.2l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-1-0.8-1.9-1.8-1.9c-0.4,0-0.8,0.2-1.1,0.4C66.2,23.9,64.1,16.4,63.5,13.2z M72.5,30.9v13.5c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3C71.3,30,71.8,30.6,72.5,30.9z"></path></svg>';
var initiativeBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 45" class="ddbc-svg ddbc-initiative-box-svg "><polygon fill="#FEFEFE" points="68.8,22.5 55.8,43.3 14.2,43.3 1.2,22.5 14.2,1.8 14.3,1.7 55.7,1.7 55.8,1.8 "></polygon><path fill="#972e2e" d="M59.1,0H10.9L0,17.2v10.5L10.9,45H59l11-17.2V17.2L59.1,0z M58.2,2.2l10,15.8v3L56.5,2.3l-0.1-0.1H58.2z M14.8,2.2h40.5l0.1,0.1L68,22.5L55.3,42.8H14.7L2,22.5L14.8,2.2L14.8,2.2z M1.8,18l10-15.8h1.8l-0.1,0.1L1.8,21V18z M11.8,42.8L1.8,27v-3l11.7,18.8H11.8z M68.2,27l-10,15.8h-1.7L68.2,24V27z"></path></svg>';
var containerBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 281 200" class="ddbc-svg "><path fill="#FEFEFE" d="M274.78,153.59a27.53,27.53,0,0,0-.93-3c-1.71-4.27-1.13-39.26-1.13-39.26s0-12.67-.58-30.9c-.35-11.2,1.57-25,3.1-33.94a8.34,8.34,0,0,1-3-8.09,11.87,11.87,0,0,1,.79-2.54c0-1.16.12-2.31.26-3.46-.82-5.25-1.12-10.74-3.65-15.42S262.79,9.2,259,5.79c-.08-.08-.13-.15-.2-.23-2.22-1.06-4.61-1.79-6.78-3a6.15,6.15,0,0,1-.84-.57h-221c-.78.52-1.59,1-2.35,1.57A4.18,4.18,0,0,1,25,4.24c-6.23,5.4-13.07,9-15.73,17.58a46.94,46.94,0,0,0-1.78,9.43,3.2,3.2,0,0,1,.1.42c.27,1.51.42,3,.57,4.54,0,0,.13.91.13,1a14.6,14.6,0,0,0,.55,1.93,4.61,4.61,0,0,1-1.47,4.95,5.55,5.55,0,0,1-2.49,3c1.51,9,3.34,22.38,3,33.33-.58,18.23-.58,30.9-.58,30.9s.58,35-1.13,39.26a27.88,27.88,0,0,0-1.09,3.65,4.78,4.78,0,0,1,3,3.17c1.31,4,.41,8.33-.78,12.49A4.68,4.68,0,0,1,7.5,171C8.64,183.88,17.62,192.75,29,197.68A4.75,4.75,0,0,1,30.83,199h215.8c1.94-.54,3.91-1,5.81-1.65a3.83,3.83,0,0,1,1.31-.86,4.61,4.61,0,0,1,2.42-1.31l.75-.19a3.88,3.88,0,0,1,1.06-.81c1.25-.62,2.55-1.18,3.79-1.85a17.12,17.12,0,0,1,1.71-1.4,3.17,3.17,0,0,1,.65-.36c.08-.09.16-.17.23-.26s.57-.83.57-.83a5.39,5.39,0,0,1,2.46-2.06c.45-.55.88-1.12,1.29-1.69l.1-.12a37.3,37.3,0,0,0,4.72-17.11,3,3,0,0,1,0-.31c-1.65-3.32-1.28-6.59-1.53-10.19A4.68,4.68,0,0,1,274.78,153.59Z"></path><path fill="#972e2e" d="M275.28,101.4v2c.77-12.53,2.64-42.67,5.52-52l.21-.68-.6-.37a20.9,20.9,0,0,1-3.68-3.08,60.93,60.93,0,0,1,2.34-9.38l.12-.34L276.7,10l-1.08-.34c-2.52-.78-9.71-3.91-9.71-8V0H15.09V1.68c0,4.05-7,7.12-9.71,8L4.3,10,1.82,37.56l.12.34a61.53,61.53,0,0,1,2.34,9.36A21.05,21.05,0,0,1,.6,50.36l-.6.38.21.67c2.88,9.33,4.74,39.41,5.51,52v-2C5,113.87,3.09,139.25.21,148.59l-.21.68.6.37a20.9,20.9,0,0,1,3.68,3.08,59.8,59.8,0,0,1-2.34,9.38l-.12.34L4.3,190l1.08.34c2.7.84,9.71,3.91,9.71,8V200H265.91v-1.68c0-4,7-7.12,9.71-8l1.08-.34,2.48-27.58-.12-.34a61.53,61.53,0,0,1-2.34-9.36,21.05,21.05,0,0,1,3.68-3.1l.6-.38-.21-.67c-2.88-9.33-4.74-34.65-5.51-47.19m-3.84,62.1s.45,1.05,1,2.57a28.69,28.69,0,0,1-1.33,12.18c-2.95,8.6-10.16,14.89-20.88,18.39H30.68c-23-7.48-22.8-25.21-22.16-30.51.59-1.59,1.06-2.7,1.09-2.78a11.79,11.79,0,0,0-2.1-9.57c3.38-18.48,1.66-42,1.58-43.08V89.42c.09-1.17,1.81-24.74-1.57-43.23A12,12,0,0,0,9.56,36.5s-.45-1.06-1-2.57A28.69,28.69,0,0,1,9.87,21.75c3-8.6,10.16-14.9,20.89-18.39H250.32c23.05,7.48,22.8,25.21,22.16,30.51-.59,1.59-1.06,2.7-1.09,2.78a11.79,11.79,0,0,0,2.1,9.57c-3.38,18.48-1.66,42-1.58,43.08v21.28c-.09,1.17-1.81,24.74,1.57,43.23a12,12,0,0,0-2.05,9.69m7.41-112c-1.71,6-3,17.24-4,27.91a184.33,184.33,0,0,1,1.5-29.93,24.77,24.77,0,0,0,2.5,2m-5.72-14.31c.09-.2,1.13-2.66,2.12-5.71l.51,5.64A58.68,58.68,0,0,0,274,43.57a9.17,9.17,0,0,1-.89-6.35m.42-24.74,1.24,13.81c-.25,1.19-.59,2.43-1,3.62a29,29,0,0,0-1.55-8.55c-2-5.88-6.88-13.33-18.42-18h8.89c1.25,5.13,8,8.1,10.8,9.12M18.25,3.36h8.88C10.49,10.1,7.46,22.74,7.21,30c-.38-1.23-.74-2.52-1-3.75L7.45,12.48c2.79-1,9.55-4,10.8-9.12m-13,33.79.51-5.64c1,3,2,5.43,2.07,5.56A9.4,9.4,0,0,1,7,43.51a59.87,59.87,0,0,0-1.73-6.36M4.64,49.5A184.34,184.34,0,0,1,6.15,79.44c-1-10.67-2.29-21.88-4-27.91a22.88,22.88,0,0,0,2.49-2m-2.49,99c1.71-6,3-17.24,4-27.91a184.33,184.33,0,0,1-1.5,29.93,23.42,23.42,0,0,0-2.5-2m5.72,14.31c-.09.2-1.13,2.66-2.12,5.71l-.51-5.63A59.49,59.49,0,0,0,7,156.43a9.17,9.17,0,0,1,.89,6.35m-.42,24.74L6.21,173.71c.25-1.18.59-2.42,1-3.62a29,29,0,0,0,1.55,8.55c2,5.89,6.88,13.33,18.42,18H18.25c-1.25-5.13-8-8.1-10.8-9.12m255.3,9.12h-8.88c16.64-6.73,19.67-19.38,19.92-26.68.38,1.23.74,2.52,1,3.75l-1.24,13.81c-2.79,1-9.55,4-10.8,9.12m13-33.78-.51,5.63c-1-3-2-5.43-2.07-5.56a9.41,9.41,0,0,1,.85-6.44,60.72,60.72,0,0,0,1.73,6.37m.6-12.36a184.34,184.34,0,0,1-1.51-29.94c1,10.67,2.29,21.88,4,27.91a22.88,22.88,0,0,0-2.49,2"></path></svg>';
var groupsBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 278 338" class="ddbc-svg "><polygon fill="#FEFEFE" points="8 336 271 336 271 2 8 2 8 336"></polygon><path fill="#972e2e" d="M278,6.39V4.47h-6.14V0h-2.68s-1.06,1.54-3.91,1.54H12.73C9.88,1.54,8.82,0,8.82,0H6.14V4.47H0V6.39c2.53,0,2.67,4.14,2.67,4.14V324.91S2.53,329,0,329V331H6.14v7H8.82V3.31H269.18V334.69H8.82V338s1.06-1.54,3.91-1.54H265.27c2.84,0,3.9,1.52,3.91,1.54h2.68v-7H278V329c-2.53,0-2.67-4.13-2.67-4.13V10.53s.14-4.14,2.67-4.14ZM6.27,324.91H4.14V12.12H6.27Zm267.79.48h-2.12V12.61h2.12Z"></path></svg>';
var otherBoxSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 89" class="ddbc-svg "><path fill="#FEFEFE" d="M87.54,9.45a42.28,42.28,0,0,1-3-3A42.91,42.91,0,0,0,74.21,1H18.36a11,11,0,0,0-1.53.59A4.9,4.9,0,0,1,15.36,2.7,21.09,21.09,0,0,0,6,12.28a5.14,5.14,0,0,1,.12,1.59,5.15,5.15,0,0,1,.24,1.18c1,12.72.57,25.84.4,38.59-.09,6.5,0,13-.05,19.48,0,2-.11,4.08-.22,6.12a17.93,17.93,0,0,0,2.78,2.94A73.22,73.22,0,0,0,16.51,87H78l.07-.06a32.31,32.31,0,0,0,9.31-8.5c.13-6,.65-12,.36-18s.2-11.89.36-17.9c.16-6.53,0-13.11-.17-19.64C87.84,18.57,88.07,13.86,87.54,9.45Z"></path><path fill="#972e2e" d="M85,0H9L0,9.05V80l9,9H85l9-9V9.05Zm6.55,10.08v7a29.26,29.26,0,0,0-3.24-6.78v-.13h-.08a20.45,20.45,0,0,0-9.13-7.69H84ZM75.6,86.52H18.36a19,19,0,0,1-11.3-7.73V10.25A19.27,19.27,0,0,1,18.4,2.48H75.64a18.94,18.94,0,0,1,11.3,7.73V78.75A19.27,19.27,0,0,1,75.6,86.52ZM2.47,21.18a31.7,31.7,0,0,1,3.24-8.8V76.64c-.3-.53-.62-1-.89-1.62a32.92,32.92,0,0,1-2.35-7.11Zm85.82-8.82c.3.53.62,1,.89,1.62a32.92,32.92,0,0,1,2.35,7.11V67.81a31.64,31.64,0,0,1-3.24,8.81ZM10.05,2.48h4.87a20.45,20.45,0,0,0-9.13,7.69H5.71v.13a29.26,29.26,0,0,0-3.24,6.78v-7ZM2.47,78.92v-7A29.45,29.45,0,0,0,5.71,78.7v.13h.08a20.45,20.45,0,0,0,9.13,7.69H10.05ZM84,86.52H79.08a20.45,20.45,0,0,0,9.13-7.69h.08V78.7a29.45,29.45,0,0,0,3.24-6.78v7Z"></path></svg>';
var expandArrowSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="ddbc-svg ddbc-svg--light"><path fill="#fff" d="M11,2.48,5,8l6,5.52a1.3,1.3,0,0,1-.21,2.12h0a2.25,2.25,0,0,1-2.68-.17L0,8,8.11.53A2.25,2.25,0,0,1,10.79.36h0A1.3,1.3,0,0,1,11,2.48Z"></path><polygon fill="#fff" points="6.92 8 16 0 16 16 6.92 8"></polygon></svg>';

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start Character Class
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

class Character {
  constructor(name) {
    this.name = name;
  };

  // Do we need Level and Proficency anymore? They aren't used anywhere in the render function.
  get level() {
    var classes = this.iframe.find('.ddbc-character-tidbits__classes').text().split('/').map(function(i){return parseInt(i.replace(/[^0-9]+/g, ''))});
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
    return parseInt(this.iframe.find(".ddbc-armor-class-box__value").text());
  }

  get currentHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-current").text());
  }

  get maxHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-max").text());
  }

  get savingThrows(){
    var savingThrows = {}
    var selector = this.iframe.find('.ddbc-saving-throws-summary')
    selector.children().each(function (){
      var saveStat = $(this).find(".ddbc-saving-throws-summary__ability-name").text();
      var saveNumber = $(this).find(".ddbc-signed-number__number").text();
      var saveSign = $(this).find(".ddbc-signed-number__sign").text();
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

  get abilities(){
    var abilities = {}
    var selector = this.iframe.find('.ddbc-ability-summary');
    selector.each(function (){
		var ability = $(this).find(".ddbc-ability-summary__abbr").text();
		if (ability != "") {
			abilities[ability] = {
				"abbr": 	ability,
				"name": 	$(this).find(".ddbc-ability-summary__label").text(),
				"mod": 		$(this).find(".ddbc-signed-number__number").text(),
				"sign": 	$(this).find(".ddbc-signed-number__sign").text(),
				"number":	$(this).find(".ddbc-ability-summary__secondary").text()
			}
		}
    });
    return abilities
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
    var initNumber = parseInt(this.iframe.find(".ct-initiative-box__value").find(".ddbc-signed-number__number").text());
    var initSign = this.iframe.find(".ct-initiative-box__value").find(".ddbc-signed-number__sign").text();
    var init = {
      "number" : initNumber,
      "sign" : initSign
    }
    return init;
  }

  get speed(){
    this.iframe.find(".ct-speed-box").trigger("click");
    var speeds = {}
    var selector = this.iframe.find(".ct-speed-manage-pane__speeds")
    selector.children().each(function () {
      var label = $(this).find(".ct-speed-manage-pane__speed-label").text();
      var amount = $(this).find(".ct-speed-manage-pane__speed-amount").find('.ddbc-distance-number__number').text();
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
    <div id="genStats1" class="genStats genStats-wrapper genStats-infobox">
      <div id="genStats-container-1" class="genStats-container">
      </div>
      <div id="genStats-container-2" class="genStats-container">
      </div>
      <div id="genStats-container-3" class="genStats-container">
      </div>
    </div>
  `;

  //ssecond html that the code gets added to
  var quickInfo = `
    <div id="gs-quick-info" class="gs-wrapper gs-expanded">
      <div id="gs-quick-info-container-1" class="gs-container">
      </div>
      <div id="gs-quick-info-container-2" class="gs-container">
      </div>
      <div id="gs-quick-info-container-3" class="gs-container">
      </div>
    </div>
  `;

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start adding elements to page
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  node.find('.ddb-campaigns-character-card-header').append(quickInfo); // add general stats to the player card
  node.append(genStats); // add general stats to the player card

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
  //        Adding quickInfo elements to page
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	var quickInfoContainer1 = node.find('#gs-quick-info-container-1');

	// quickStats
	quickInfoContainer1
		.append($('<div/>',	{class: "gs-quickStats"}));
	var quickStats = quickInfoContainer1.children('.gs-quickStats');
	quickStats
		.append($('<div/>',	{class: "gs-container gs-hp-container gs-flex-items"}))
		.append($('<div/>',	{class: "gs-container gs-ac-container"}))
		.append($('<div/>',	{class: "gs-container gs-intv-container gs-flex-items"}));

	// HP
	var hpContainer = quickStats.children('.gs-hp-container');
	hpContainer
		.append($('<div/>',	{class: "gs-hp-label",		html: "Hit Points"}))
		.append($('<div/>',	{class: "gs-hp-box gs-diamond-bg gs-flex-items"	}));

	var hpBox = hpContainer.children('.gs-hp-box');
	hpBox
		.append($('<div/>',	{class: "gs-hp-value gs-flex-values"}))
	var healthValue= hpBox.children('.gs-hp-value');
	healthValue
		.append($('<div/>',	{class: "gs-hp-number",		html: character.currentHP}))
		.append($('<div/>',	{class: "gs-hp-sep", 		html: "/"}))
		.append($('<div/>', 	{class: "gs-hp-number",		html: character.maxHP}));

	// AC
	var acContainer = quickStats.children('.gs-ac-container');
	acContainer
		.append($('<div/>',	{class: "gs-ac-box gs-sheild-bg gs-flex-items"}));
	var acBox = acContainer.children('.gs-ac-box');
	acBox
		.append($('<div/>',	{class: "gs-ac-label",		html: "Armor"}))
		.append($('<div/>',	{class: "gs-ac-value",		html: character.ac}))
		.append($('<div/>',	{class: "gs-ac-label",		html: "Class"}));

	// Initive
	var intvContainer = quickStats.children('.gs-intv-container');
	intvContainer
		.append($('<div/>',	{class: "gs-intv-label",	html: "Initiative"}))
		.append($('<div/>',	{class: "gs-intv-box gs-diamond-bg gs-flex-items"	}));

	var intvBox = intvContainer.children('.gs-intv-box');
	intvBox
		.append($('<div/>',	{class: "gs-intv-value gs-flex-values"}))
	var intvValue= intvBox.children('.gs-intv-value');
	intvValue
		.append($('<div/>',	{class: "gs-intv-sign",		html: character.initiative.sign}))
		.append($('<div/>', 	{class: "gs-intv-number",	html: character.initiative.number}));

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //        Adding main abilities elements to page
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	var qsContainer1 = node.find('#genStats-container-1');
	qsContainer1
		.append($('<div/>',	{class: "gs-main-able gs-line-container"}));
	var mainAble = qsContainer1.children('.gs-main-able');

	Object.keys(character.abilities).forEach(function (abbr) {
		console.log(character.abilities[abbr]);
		mainAble
			.append($('<div/>',	{class: 'gs-able-container gs-container gs-able-'+abbr+'-container gs-flex-items'}))
		var ableContainer = mainAble.children('.gs-able-'+abbr+'-container ');
		ableContainer
			.append($('<div/>',	{class: 'gs-able-label gs-'+abbr+'-label',		html: abbr}))
			.append($('<div/>',	{class: 'gs-able-value gs-'+abbr+'-value gs-flex-values'}));

		var modAble = '(' + character.abilities[abbr].sign + character.abilities[abbr].mod + ')';
		var ableValue= ableContainer.children('.gs-'+abbr+'-value');
		ableValue
			.append($('<div/>',	{class: 'gs-able-number gs-'+abbr+'-number',	html: character.abilities[abbr].number}))
			.append($('<div/>',	{class: 'gs-able-mod gs-'+abbr+'-mod', 			html: modAble}));


	})

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //        Adding saving throw elements to page
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	var qsContainer2 = node.find('#genStats-container-2');
	qsContainer2
		.append($('<div/>',	{class: "gs-main-saves gs-line-container"}));
	var mainSaves = qsContainer2.children('.gs-main-saves');

	Object.keys(character.savingThrows).forEach(function (label) {
        console.log(character.savingThrows[label]);
		mainSaves
			.append($('<div/>',	{class: 'gs-saves-container gs-container gs-saves-'+label+'-container gs-flex-items'}))
		var savesContainer = mainSaves.children('.gs-saves-'+label+'-container ');
		savesContainer
			.append($('<div/>',	{class: 'gs-saves-label gs-'+label+'-label',		html: label}))
			.append($('<div/>',	{class: 'gs-saves-value gs-'+label+'-value gs-flex-values'}));

		var modSaves = '(' + character.savingThrows[label].sign + character.savingThrows[label].number + ')';
		var savesValue= savesContainer.children('.gs-'+label+'-value');
		savesValue
			.append($('<div/>',	{class: 'gs-saves-number gs-'+label+'-sign',	html: character.savingThrows[label].sign}))
			.append($('<div/>',	{class: 'gs-saves-mod gs-'+label+'-number', 	html: character.savingThrows[label].number}));
	})

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //        Start adding elements to page
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  node.find('#genStats-container-3').append(passiveSkillsModule.replace("sensesText", character.senses)); //add player senses to general stats div
  node.find('#genStats-container-3').append(speedModule); //add player walking speed to general stats div
  node.find('#genStats-container-3').append(saveDcModule); //add player Save DC to front of general stats div

  // These next few lines checks if the character has a spell save DC. If it doesn't it replaces the number with a 0 and changes the class to no save.
  if (Object.keys(character.spellSaveDC).length !== 0 && character.spellSaveDC.constructor === Object) {
    Object.keys(character.spellSaveDC).forEach(function (item) { // iterates through each item in the object and adds it to the spell save module
      var saveItem = saveDcItemModule
        .replace("saveNumber", character.spellSaveDC[item]) //adds the save dc number
        .replace("saveClass", item) //Adds the spell save class
      node.find('.genStats__saveGroup').append(saveItem) // adds item to the character card
    })
  } else {
    var saveItem = saveDcItemModule
        .replace("saveNumber", "0")
        .replace("saveClass", "No Save")
    node.find('.genStats__saveGroup').append(saveItem)
  }
  //Adds character speeds to the speed module

  Object.keys(character.speed).forEach(function (item) {
    var speedItem = speedItemModule
      .replace("speedLabel", item)
      .replace("speedNumber", character.speed[item])
    node.find('.genStats__speedGroup').append(speedItem)
  })

  Object.keys(character.passiveSkills).forEach(function (skill) {
    var stat = skill
    var passiveItem = passiveSkillsItemModule
      .replace("passiveStat", stat)
      .replace("passiveNumber", character.passiveSkills[skill])
    node.find('.genStats__passiveSkillsGroup').append(passiveItem)
  })
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start PreRender Function
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function prerender(character, node, times) { //Prerender logic - needs to be commented further
    if (!isNaN(character.ac)) {render(character, node);}
    else {
        console.warn("Character AC Not found, retrying");
        times += 1;
        if (times < 80) {setTimeout(function() {prerender(character, node, times);}, 500);};
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        Start iFrame Logic
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

(function() { //iFrame Logic - Needs to be commented further
  console.log("init");
  $('#site').after('<div id="iframeDiv" style="opacity: 0; position: absolute;"></div>'); //visibility: hidden;
  let chars = $('.ddb-campaigns-detail-body-listing-active').find('.ddb-campaigns-character-card-footer-links-item-view');
  chars.each(function(index, value) {
      let node = $(this).parents('.ddb-campaigns-character-card-wrapper');
      console.log($(this));
      let name = node.find('.ddb-campaigns-character-card-header-upper-character-info-primary').text();
      let character = new Character(name);
      let newIframe = document.createElement('iframe');
      //after loading iframe, wait for a second to let JS create content.
      newIframe.onload = function(){prerender(character, node, 0)};
      newIframe.id = `frame-${character.id}`;
      newIframe.style = "position: absolute;"; //visibility: hidden;
      newIframe.width = 1000;
      newIframe.height = 200;
      newIframe.seamless = "";
      newIframe.src = $(this).attr('href');
      document.body.appendChild(newIframe);
      $('#iframeDiv').append(newIframe);
    }
  );
  //$('head').append('<link rel="stylesheet" href="https://raw.githack.com/lothsun/ddb-dm-screen/master/style.css" type="text/css" />')//development css sheet
  $('head').append('<link rel="stylesheet" href="https://rawcdn.githack.com/lothsun/ddb-dm-screen/742360e72e74c4e74fa132bb921370545b17de25/style.css" type="text/css" />') //production css sheet
})();

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//        CSS Style Editing
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


GM_addStyle ( `
    .ddb-campaigns-character-card-header {
        padding: 5px;
		flex-grow: 1;
    }
	.ddb-campaigns-character-card-wrapper {
		width: unset;
		max-width: unset;
		display: flex;
	}
	.rpgcharacter-listing {
		flex-direction: column;
	}
	.ddb-campaigns-character-card {
		display: flex;
		flex-direction: column;
		min-width: 230px;
		width: 30%;
	}
	.gs-flex-values {
		display: flex;
		align-items: center;
		justify-content: center;
		align-content: center;
	}
	.gs-flex-items {
		display: flex;
		flex-direction: column;
		justify-content: center
	}
	.gs-sheild-bg {
		width: 79px;
		height: 90px;
		background: 50% transparent url(https://www.dndbeyond.com/Content/Skins/Waterdeep/images/character-sheet/content-frames/ac.svg) no-repeat;
		background-size: auto;
		background-size: contain;
	}
	.gs-diamond-bg {
		width: 70px;
		height: 45px;
		background: 50% transparent url(https://www.dndbeyond.com/Content/Skins/Waterdeep/images/character-sheet/content-frames/initiative.svg) no-repeat;
		background-size: auto;
		background-size: contain;

	}
	.gs-box{
		margin: 2px;
	}
	.gs-quickStats {
		display:flex;
		justify-content: space-around;
		position: relative;
		z-index: 1;
	}
	.gs-hp-container {
		line-height: 1.2;
		text-align: center;
		text-transform: uppercase;
		color: #000;
		display: flex;
	}

	.gs-hp-value {
		font-size: 18px;
		font-weight: 200;
		letter-spacing: -0.75px;
	}
	.gs-hp-sep {
		padding: 0 0.5px
		color: #d8d8d8;
	}
	.gs-hp-label {
		font-family: Roboto Condensed,Roboto,Helvetica,sans-serif;
		font-weight: 700;
		/*position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 6px;*/
		color: #fff;
		margin-bottom: 3px;
	}
	.gs-ac-container {
		font-weight: 700;
		text-align: center;
		text-transform: uppercase;
		line-height: 1;
		color: #000;
	}
	.gs-ac-label {
		color: #838383;
		font-size: 10px;
	}
	.gs-ac-value {
		font-size: 26px;
		letter-spacing: -1px;
	}
	.gs-intv-container {
		line-height: 1.2;
		text-align: center;
		text-transform: uppercase;
		color: #000;
		display: flex;
	}

	.gs-intv-value {
		font-size: 26px;
		font-weight: 700;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: -1px;
	}
	.gs-intv-sign {
		font-size: 20px;
		position: absolute;
		right: 100%;
		font-size: 12px;
		color: #838383;
		margin-right: 1px;
	}
	.gs-intv-label {
		font-family: Roboto Condensed,Roboto,Helvetica,sans-serif;
		font-weight: 700;
		/*position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 6px;*/
		color: #fff;
		margin-bottom: 3px;
	}
	.gs-able-container .gs-able-label::before, .gs-saves-container .gs-saves-label::before{
		content: '';
		background-size: cover;
		background-position: center center;
		display: inline-block;
		margin-right: 5px;
		height: 16px;
		width: 16px;
		margin-bottom: -2px;
	}
	.gs-str-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/strength.svg);
	}
	.gs-dex-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/dexterity.svg);
	}
	.gs-con-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/constitution.svg);
	}
	.gs-int-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/intelligence.svg);
	}
	.gs-wis-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/wisdom.svg);
	}
	.gs-cha-label::before {
		background-image: url(../Content/1-0-638-0/Skins/Waterdeep/images/icons/abilities/charisma.svg);
	}
	.gs-main-able {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: baseline;
	}
	.gs-line-container {
		background: #fff;
		color: #000;
		border-bottom: #bc0f0f solid 3px;
		padding: 5px 2px;
	}
	.gs-line-container {
		font-size: 18px;
	}
	.gs-main-saves {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: baseline;
	}
	#genStats-container-3{
		display:flex;
		justify-content: space-evenly;
	}
` );
