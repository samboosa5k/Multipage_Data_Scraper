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
const alphabet = ['B','M'];
const url = "https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_";

/* 
    Test Counter: I seem to be missing some airports...
*/
let collectCount = 0;
let adaptCount = 0;

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

const parseHTML = async (incoming) => {
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
    collectCount = collectCount+rawJSON.length;

    console.log(rawJSON.length);
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
let storeIATA = [];

const collectIATA = async (alphabet, storage) => {
    for(let i = 0; i<alphabet.length; i++){
        //  Collect & parse IATA based on ALphabet-letter
        const html = await collectHTML(alphabet[i]);
        const json = await parseHTML(html);
        
        //  Push to storeIATA array for use by adaptIATA
        storeIATA = [...storeIATA,...json];
        
        //  Create usable IATA Grouped JSON
        const iataGrouped = await genJSON(json);
        
    }
}

const adaptIATA = async (alphabet, storage) => {  
    const json = storeIATA;
    for(let i = 0; i<alphabet.length; i++){
        // Combined airport list

        //  Filter combined list and group alphabetically by location name
        const locationGrouped = await genJSON(json.filter((obj)=>{
            if(obj.location.includes('Manama')) {
                console.log(`Manama SPLIT location starts with ${alphabet[i]}? `, obj.location.split('')[0].startsWith(alphabet[i]));
                console.log(`Manama SPLIT location 0-index = ${alphabet[i]}? `, obj.location.split('')[0]===alphabet[i]);
                return obj;
            }
        }));
        
        //console.log(`LOCATION group ${alphabet[i]}: `, locationGrouped);
    }
}


/* 
    INIT
    - First collect all IATA codes, then sort them into separate files
    - Total of 9012 IATA codes
    
    Bug:
    - Strangely, after writing out the files, the ones grouped by alphabetical location are about 50% the size
    - This IS partly because some foreign characters of location names are not being matched
    - UPDATE: fs.appendFile was adding new json to some files I accidentally left behind
*/
const startProcess = async () => {
    collectIATA(alphabet, storeIATA)
        .then(() => { adaptIATA(alphabet, storeIATA) })
}

startProcess();
