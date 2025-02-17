"use strict";

window.onload = () => {
    getInfo();
    
}

let applicants = [];   //  Global variabel för all data
let top6Courses = [];   // innehåller de 6 mest sökta kurserna
let top5Programs = [];  // innehåller de 5 mest sökta programmen


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

        const filteredPrograms= applicants.filter(course => course.type === "Program");    // filtrerar ut programmen
        // Sortera de filtrerade kurserna efter antal sökande
        const sortedPrograms = filteredPrograms.sort((a, b) => b.applicantsTotal - a.applicantsTotal);
        top5Programs = sortedPrograms.slice(0, 5)
        console.table(top5Programs);
    }
    catch (error) {
        console.error(error);
        // document.querySelector("#errormessage").innerHTML = "<p>Fel vid hämntning av informationen!</p>";
    }
}