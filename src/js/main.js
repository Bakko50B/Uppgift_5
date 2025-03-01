"use strict";
/**
 * Denna fil används i footer för att ange dagens datum
 * 
 */
const MyDateEl = document.getElementById("date");
const today = new Date();
const date = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0'); // Månaderna är 0-indexerade, så vi lägger till 1
const year = today.getFullYear();

/**
 *Anvönde de uträknade variablerna för att sätta till fullDate som sedan används i myDateEl.
 */
const fullDate = `${year}-${month}-${date}`;


MyDateEl.innerHTML =
`    
    Dagens datum:   <br>
    ${fullDate}
`;