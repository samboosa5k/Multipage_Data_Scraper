/* 
    Imports
    - node-fetch so node can process the fetching
    - node 'fs' so the files can be writtent to disk
*/
const nFetch = require('node-fetch');
const fs = require('fs'); 

/* 
    Collect IATA codes from Wikipedia
    - Adapter design pattern
    - DOMParser tip came from Stackoverflow: https://stackoverflow.com/questions/36631762/returning-html-with-fetch
*/
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const url = "https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_";

//  collectHTML & parseHTML - LOOP START
const collectHTML = async (letter) => {
    const response = await fetch(url+letter);
    const data = await response.text();

    return data;
}

const parseHTML = async (incoming, letter) => {
    //  Prepare data for use
    const data = await incoming;
    const parser = new DOMParser;
    const doc = parser.parseFromString(data, "text/html");
    //  Select all that is relevant
    const all_IATA = doc.querySelectorAll('tr td:first-child');
    const all_airports = doc.querySelectorAll('tr td:nth-child(3)');
    const all_locations = doc.querySelectorAll('tr td:nth-child(4)');
    //  Setup storage
    const rawJSON = {[letter]: []};
    //  Build usable JSON, baby!
    for(let i = 0; i<all_IATA.length; i++){
        rawJSON[letter].push(
            {
                "key": all_IATA[i].innerText,
                "airport": all_airports[i].innerText,
                "location": all_locations[i].innerText,
            }
        );
    }
    return rawJSON;
}
//  collectHTML & parseHTML - LOOP END

//  Combine all the scraped data per page object
const combineJSON = async (alphabet) => {
    const combined = [];
    for(let i = 0; i<alphabet.length; i++){
        const html = await collectHTML(alphabet[i]);
        const json = await parseHTML(html, alphabet[i]);
        combined.push(json);
    }
    return combined;
}

//  Make the data actually usable
const genJSON = async (incoming) => {
    const raw = await incoming;
    const useable = JSON.stringify(raw);
    return useable;
}

//  Initiate
const startProcess = async (alphabet) => {
    /* const html = await collectHTML('A');
    const json = await parseHTML(html, 'A'); */
    //  collect/parse loop goes here
    const combined = await combineJSON(alphabet);
    const useable = await genJSON(combined)

    //  This will open a new JSON window which I can save directly
    const rawJSONWindow = window.open("data:application/json," + encodeURIComponent(useable), "_blank");
    rawJSONWindow.focus();
}

startProcess(alphabet);

