/* 
    Collect IATA codes from Wikipedia
    - Adapter design pattern
    - DOMParser tip came from Stackoverflow: https://stackoverflow.com/questions/36631762/returning-html-with-fetch
*/

/* 
    Imports
    - node-fetch = so node can process the fetching
    - node 'fs' = so the files can be writtent to disk
    - jsdom = DOM parser for node
*/
const nFetch = require('node-fetch');
const fs = require('fs'); 
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/* 
    Constants: these will never change
*/
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const url = "https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_";

/* 
    Functions:
    - Fetching
    - Parsing
*/
//  collectHTML & parseHTML - LOOP START
const collectHTML = async (letter) => {
    const response = await nFetch(url+letter);
    const data = await response.text();

    return data;
}

const parseHTML = async (incoming, letter) => {
    //  Prepare data for use
    const data = await incoming;
    const doc = new JSDOM(data);
    //  Select all that is relevant
    const all_IATA = doc.window.document.querySelectorAll('tr td:first-child');
    const all_airports = doc.window.document.querySelectorAll('tr td:nth-child(3)');
    const all_locations = doc.window.document.querySelectorAll('tr td:nth-child(4)');
    //  Setup storage
    const rawJSON = [];
    //  Build usable JSON, baby!
    for(let i = 0; i<all_IATA.length; i++){
        rawJSON.push(
            {
                "key": all_IATA[i].textContent,
                "airport": all_airports[i].textContent,
                "location": all_locations[i].textContent,
            }
        );
    }

    return rawJSON;
}
//  collectHTML & parseHTML - LOOP END


//  Make the data actually usable
const genJSON = async (incoming) => {
    const raw = await incoming;
    const useable = JSON.stringify(raw);

    return useable;
}

/* 
    Processes:
    - storeIATA = not a process or function, just a storage for combined json
    - collectIATA = collects and writes list of airports to disk, grouped alphabetically based on IATA
    - adaptIATA = filters/regroups the collected data, writing list of airports to disk, grouped alphabetically absed on Location
*/
const storeIATA = [];

const collectIATA = async (alphabet, storage) => {
    for(let i = 0; i<alphabet.length; i++){
        console.log('collectIATA status: ', `Collection started of ${alphabet[i]}`);
        //  Collect & parse IATA based on ALphabet-letter
        const html = await collectHTML(alphabet[i]);
        const json = await parseHTML(html, alphabet[i]);
        
        //  Push to storeIATA array for use by adaptIATA
        storage.push(json);

        //  Create usable IATA Grouped JSON
        const iataGrouped = await genJSON(json);

        // File-writing: IATA-grouped 
        fs.appendFile(`db_IATA/${alphabet[i]}_airports.json`, iataGrouped, (err)=>{
            if (err) throw err;
            console.log('File saved = ', `db_IATA/${alphabet[i]}_airports.js`);
        })
    }
}

const adaptIATA = async (alphabet, storage) => {
    //  Temp storage for Location Grouped JSON
    let locationGrouped = {};
    
    console.log('adaptIATA status: ', 'IATA collection reached end, now split into location groups...');
    
    for(let i = 0; i<alphabet.length; i++){
        //  Filter combined list and group alphabetically by location name
        locationGrouped = await genJSON(storage[i].filter((obj)=>{
            return obj.location.startsWith(alphabet[i]) === true;
        }));

        // File-writing: Location-grouped
        fs.appendFile(`db_LOCATION/${alphabet[i]}_airports.json`, locationGrouped, (err)=>{
            if (err) throw err;
            console.log('File saved = ', `db_LOCATION/${alphabet[i]}_airports.js`);
        })
    }
    
}


/* 
    INIT
*/
const startProcess = async () => {
    collectIATA(alphabet, storeIATA)
        .then(() => { adaptIATA(alphabet, storeIATA) });
}

startProcess();
