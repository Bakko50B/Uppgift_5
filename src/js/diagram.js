"use strict";

import Chart from 'chart.js/auto';

import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrera pluginet
Chart.register(ChartDataLabels);

window.onload = () => {
    getInfo();
}
/**
 * Global variabel för att lagra all data om kurser och program.
 * 
 * @global
 * @type {Array<Object>}
 */
let applicants = [];

/**
 * Global variabel för att lagra all data de 6 mest sökta kurserna
 *<br>
 * Urvalet sker i getinfo()
 * 
 * @global
 * @type {Array<Object>}
 */
let top6Courses = [];

/**
 * Global variabel för att lagra all data de 5 mest sökta programmen
 *<br>
 * Urvalet sker i getinfo()
 * 
 * @global
 * @type {Array<Object>}
 */
let top5Programs = [];

/**
 * Hämta information om kurser och program från en API-endpoint och bearbeta data.
 * 
 * Funktionen hämtar data om kurser och program från en specifik API-endpoint, filtrerar och sorterar data,
 * och sparar de mest sökta kurserna och programmen i globala variabler. Funktionen skapar också stapel- och pajdiagram
 * baserat på de bearbetade uppgifterna.
 * 
 * @async
 * @function getInfo
 * @throws {Error} Om API-förfrågan misslyckas.
 * @returns {void}
 */
async function getInfo() {
    try {
        const response = await fetch("https://studenter.miun.se/~mallar/dt211g/");
        if (!response.ok) {
            throw new Error("Fel vid anslutningen!");
        }
        applicants = await response.json();        //data till globala variabeln

        const filteredCourses = applicants.filter(course => course.type === "Kurs");   // filtrerar ut kurserna
        const sortedCourses = filteredCourses.sort((a, b) => b.applicantsTotal - a.applicantsTotal); // sorterar i stroleksordning på flest totala söknade
        top6Courses = sortedCourses.slice(0, 6); // Ta de 6 mest sökta kurserna

        const filteredPrograms = applicants.filter(course => course.type === "Program");    // filtrerar ut programmen
        const sortedPrograms = filteredPrograms.sort((a, b) => b.applicantsTotal - a.applicantsTotal);// Sortera de filtrerade kurserna efter antal sökande
        top5Programs = sortedPrograms.slice(0, 5) // Ta de 5 mest sökta programmen

        //Skapa stapeldiagrammet
        createStapleChart();
        //Skapa cirkeldiagrammet 
        createPieChart();
    }
    catch (error) {
        console.error(error);
        document.querySelector("#errormessage").innerHTML = "<p>Fel vid hämtning av informationen!</p>";
        document.querySelector("#info").style.display = "none";
    }
}

/**
 * Bestäm dynamisk fontstorlek baserat på fönstrets bredd.
 * <br>
 * Funktionen returnerar olika fontstorlekar beroende på fönstrets bredd.
 * 
 * @function getFontSize
 * @returns {number} Fontstorleken i pixlar baserat på fönstrets bredd.
 */

function getFontSize() {
    if (window.innerWidth < 600) { // Mindre fontstorlek för mobiler
        return 12;
    } else if (window.innerWidth < 900) { // Mellanstor font för tablets
        return 17;
    } else { // Standard fontstorlek för desktops
        return 20;
    }
}


// Lyssna på fönstrets storleksändring och uppdatera diagrammet
window.addEventListener('resize', function () {
    createStapleChart();
    createPieChart();
});

/**
 * variabel för att visa stapeldiagrammet på webbsidan
 */
const ctx = document.getElementById('stapeldiagram');

/**
 * En instans av ett StapelChart som används för att visa data i ett stapeldigram
 * <br>
 * Den sätts vid instansiering av ett stapeldiagram
 * @type {Chart}
 */
let chartInstance;

/**
 * Skapa ett stapeldiagram med data från top6Courses.
 * 
 * Funktionen hämtar kursnamn och antalet sökande från den filtrerade och sorterade arrayen top6Courses,
 * och skapar ett stapeldiagram med hjälp av Chart.js. Om ett diagram redan existerar, förstörs det innan ett nytt skapas.
 * 
 * @function createStapleChart
 * @returns {void}
 * @param {HTMLElement} ctx - Canvas element där diagrammet ska ritas.
 * @param {Object} config - Konfiguration för diagrammet.
 */
function createStapleChart() {

    // Labels med kursnamn    
    const StapelLabels = top6Courses.map(course => course.name);

    //Sätter antalet totalsökande till arrayen StapelData mha .mapfunktionen.   
    const StapelData = top6Courses.map(course => course.applicantsTotal);

    const fontSize = getFontSize();

    // Döda "instansen" om den finns så chart.js kan skapa nytt diagram vid ändring av storleken av skärm
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: StapelLabels,
            datasets: [{
                label: 'Totalt antal sökande',
                backgroundColor: 'rgb(249, 53, 95)', // Färg på staplarna
                borderColor: 'rgb(9, 9, 9)', // Borderfärg på staplarna
                borderWidth: 1,
                data: StapelData,
                // För att visa texten inne i staplarna använder jag ett plugin 
                datalabels: {
                    color: 'black', // Färg på texten
                    align: 'center',
                    anchor: 'center',
                    font: {
                        weight: 'bold',
                        size: fontSize // Använd dynamisk fontstorlek
                    },
                    rotation: -90, // Vrid texten 90 grader
                    formatter: function (value, context) {
                        // Dela upp texten i flera rader om den är för lång
                        const label = StapelLabels[context.dataIndex];
                        const maxLength = 36; // Max antal tecken per rad
                        if (label.length > maxLength) {
                            const chunks = label.match(new RegExp('.{1,' + maxLength + '}', 'g'));  // Dela upp etiketten i bitar ('g' hela strängen)
                            return chunks.join('\n');                                               // Sätt ihop bitarna ochh lägg till radbrytning mellan bitarna
                        }
                        return label;
                    },
                    wordWrap: true
                }

            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        display: false // Dölj vanliga x-axelns etiketter så de inte krockar med texten inne i staplarna
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...StapelData),
                    ticks: {
                        stepSize: 100, // Mindre steglängd för fler steg
                        color: 'rgb(0, 0, 0)' // Färg på y-axelns etiketter
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

/**
 * En instans av ett PieChart som används för att visa data i ett cirkeldiagram.
 * <br>
 * Sätter den vid skapande av Chart
 * @type {Chart}
 */
let piechartInstance;

/**
 * Skapa ett pajdiagram med data från top5Programs.
 * 
 * Funktionen hämtar programnamn och antalet sökande från den filtrerade och sorterade arrayen top5Programs,
 * och skapar ett pajdiagram med hjälp av Chart.js. Om ett diagram redan existerar, förstörs det innan ett nytt skapas.
 * 
 * @function createPieChart
 * @returns {void}
 */

function createPieChart() {
    // Hämta programnamn och sökandeantal från top5Programs
    const labels = top5Programs.map(program => program.name);
    const data = top5Programs.map(program => program.applicantsTotal);

    const ctx = document.getElementById('piediagram').getContext('2d');

    if (piechartInstance) {
        piechartInstance.destroy();
    }

    const fontSize = getFontSize();

    piechartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels, // Etiketter för varje segment i cirkeldiagrammet
            datasets: [{
                data: data, // Antal sökande för varje program
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // Positionera legenden
                    labels: {
                        color: 'rgba(0, 0, 0, 0.85)', // Färg på texten i legenden
                        font: {
                            size: fontSize
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return label + ': ' + value + ' sökande';
                        }
                    }
                },
                datalabels: {
                    color: 'black', // Färg på texten
                    font: {
                        weight: 'bold',
                        size: fontSize // Använd dynamisk fontstorlek
                    },
                    formatter: function (value, context) {
                        // Anpassa texten som visas på cirkeldiagrammet
                        return value;
                    },
                    anchor: 'end',
                    align: 'start',
                    textAlign: 'center'
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}   