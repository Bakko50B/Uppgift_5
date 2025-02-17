"use strict";

const MyDateEl = document.getElementById("date");
const today = new Date();
const date = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0'); // Månaderna är 0-indexerade, så vi lägger till 1
const year = today.getFullYear();

const fullDate = `${year}-${month}-${date}`;


MyDateEl.innerHTML =
`    
    Dagens datum:   <br>
    ${fullDate}
`;