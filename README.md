# Multi-Page Data Scraper for Flight Planner project
* [Flight Planner](https://github.com/samboosa5k/Flight_Planner) - Link to my repo

## Stack
Javascript

## Additional libraries needed
* node-fetch = so node can process the fetching
* node 'fs' = so the files can be writtent to disk
* jsdom = DOM parser for node

### Process

#### Iterate through an array of pages

* For each page:
** Fetch text
** Parse text with 'jsdom'
** Select specific Dom elements & text content (can be multiple)
** For each of multiple data, add it to an object
** Parse this object into Json
** Save the current object to disk with 'fs'
** Repeat...

### Installation

Run this:

```
npm i
```

### Usage

* Open a terminal in root
* Use this command:

```
node collectIATA.js
```

* Check the folder where all your files are :D
