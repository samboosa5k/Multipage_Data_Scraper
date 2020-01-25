const nFetch = require('node-fetch');
const fs = require('fs'); 
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/* 
    Constants: these will never change
*/
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const url = "https://en.wikipedia.org/wiki/List_of_airline_codes_";


/* 
    Functions:
    - Fetching
    - Parsing
*/
//  collectHTML & parseHTML - LOOP START
const collectHTML = async (letter) => {
    const response = await nFetch(`${url}(${letter})`);
    const data = await response.text();

    return data;
}

const parseHTML = async (incoming, letter) => {
    //  Prepare data for use
    const data = await incoming;
    const doc = new JSDOM(data);
    //  Select all that is relevant
    const all_IATA = doc.window.document.querySelectorAll('tr td:first-child');
    const all_airlines = doc.window.document.querySelectorAll('tr td:nth-child(3)');

    //  Setup storage
    const rawJSON = [];
    //  Build usable JSON, baby!
    for(let i = 0; i<all_IATA.length; i++){
        if(all_IATA[i].textContent.length > 1){
            rawJSON.push(
                {
                    "key": all_IATA[i].textContent.replace( "\n", "" ),
                    "airline": all_airlines[i].textContent.replace( "\n", "" )
                }
            );
        }
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
*/
let storeIATA = [];

const collectIATA = async (alphabet) => {
    for ( let i = 0; i < alphabet.length; i++){
        // console.log('collectIATA status: ', `Collection started of ${alphabet[i]}`);
        //  Collect & parse IATA based on ALphabet-letter
        const html = await collectHTML(alphabet[i]);
        const json = await parseHTML(html, alphabet[i]);
        
        //  Expand storeIATA array for COMBINED LIST
        storeIATA = [...storeIATA,...json];
    }

    //  Sort airlines alphabetically
    storeIATA.sort( ( a, b ) => {
        if(a.key < b.key) return -1;
        if(a.key > b.key) return 1;
    } )
    
    //  Create usable JSON airlines list
    const allAirlinesIata = await genJSON( storeIATA );

    // File-writing: IATA-grouped 
    fs.appendFile( `db_AIRLINES/iata_airlines.json`, allAirlinesIata, ( err ) => {
        if ( err ) throw err;
        console.log( 'File saved = ', `db_AIRLINES/iata_airlines.json` );
    } )
}


/* 
    INIT
    - Collect all airline IATA codes and store in single file
*/
const startProcess = async () => {
    collectIATA(alphabet);
}

startProcess();
