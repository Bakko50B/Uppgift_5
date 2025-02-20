"use strict";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrera pluginet
Chart.register(ChartDataLabels);

window.onload = () => {
    getInfo();
}

let applicants = [];    // Global variabel för all data
let top6Courses = [];   // Innehåller de 6 mest sökta kurserna

let StapelLabels = [];  //top6Courses.map(course => course.name);
let StapelData = [];    // Array för att ta emot top6Courses.map(course => course.applicantsTotal)

let top5Programs = [];  // Innehåller de 5 mest sökta programmen

async function getInfo() {
    try {
        const response = await fetch("https://studenter.miun.se/~mallar/dt211g/");
        if (!response.ok) {
            throw new Error("Fel vid anslutningen!");
        }
        applicants = await response.json();        //data till globala variabeln

        const filteredCourses = applicants.filter(course => course.type === "Kurs");   // filtrerar ut kurserna
        // Sortera de filtrerade kurserna efter antal sökande
        const sortedCourses = filteredCourses.sort((a, b) => b.applicantsTotal - a.applicantsTotal);
        // Ta de 6 mest sökta kurserna
        top6Courses = sortedCourses.slice(0, 6);

       
        console.table(top6Courses);
        // console.table(courses);

        const filteredPrograms = applicants.filter(course => course.type === "Program");    // filtrerar ut programmen
        // Sortera de filtrerade kurserna efter antal sökande
        const sortedPrograms = filteredPrograms.sort((a, b) => b.applicantsTotal - a.applicantsTotal);
        top5Programs = sortedPrograms.slice(0, 5)
        // console.table(top5Programs);
        createStapleChart();
        createPieChart();
    }
    catch (error) {
        console.error(error);
        // document.querySelector("#errormessage").innerHTML = "<p>Fel vid hämntning av informationen!</p>";
    }
}

/**
 * Funktion för att sätta dynamisk fontstorlek
 * Man kan inte påverka detta visa (s)css
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
window.addEventListener('resize', function() {
    createStapleChart();
    createPieChart();
});
/**
 * variabel för att visa stapeldiagrammet på webbsidan
 */
const ctx = document.getElementById('stapeldiagram');

/**
 * variabel för att hantera instansen av chart. Den måste förstöras om storleksändring av skärmen sker
 * 
 */
let chartInstance;  

function createStapleChart() {

    StapelLabels = top6Courses.map(course => course.name);              // Hämtar ut kursnamnet från den filtrerade och sorterade arrayen top6Courses och sätter den till Labels (array)
    StapelData = top6Courses.map(course => course.applicantsTotal);     // På samma sätt som ovan. Sätter antalet totalsökande till arrayen StapelData mha .mapfunktionen. 


    const fontSize = getFontSize();

    /** 
     * Döda "instansen" om den finns så chart.js kan skapa nytt diagram vid ä
     * ändring av stolrken av skärm
    */
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
                        size: fontSize // Använd dynamisk fontstorle
                    },
                    rotation: -90, // Vrid texten 90 grader
                    formatter: function(value, context) {
                        // Dela upp texten i flera rader om den är för lång
                        const label = StapelLabels[context.dataIndex];
                        const maxLength = 36; // Max antal tecken per rad
                        if (label.length > maxLength) {
                            const chunks = label.match(new RegExp('.{1,' + maxLength + '}', 'g')); // Dela upp etiketten i bitar ('g' hela strängen)
                            return chunks.join('\n'); // Sätt ihop bitarna ochh lägg till radbrytning mellan bitarna
                        }
                        return label;
                    },
                                        /** Lägg till för att bryta texten om den är för lång
                                         * Inaktivera automatiskt textbrytande
                                        */
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

let piechartInstance;

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
                        label: function(context) {
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
                    formatter: function(value, context) {
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