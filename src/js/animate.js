"use strict";


/**
 * Eventlyssnare för knappen start som sköter animeringen
 * @event
 */
document.getElementById('animatestart').addEventListener('click', function() {
    const element = document.getElementById('animatedElement');
    element.classList.toggle('animate');
});
