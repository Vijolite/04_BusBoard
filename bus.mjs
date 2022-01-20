import { builtinModules } from "module";
import fetch from "node-fetch";

async function fetchAsync (url){
    let response = await fetch(url);
    let data = await response.json();
    
    console.log(data);
    console.log("sorting");
    data.sort(function (a,b) {
        if (a.expectedArrival<b.expectedArrival) return -1;
        if (a.expectedArrival>b.expectedArrival) return 1; 
        if (a.expectedArrival==b.expectedArrival) return 0;}
        );

    for (let record in data) {
        console.log( "line nr = "+data[record].lineName+" time = "+data[record].expectedArrival);
    }
    
    return data;
}

const busStopCode="490008660N";
const url = "https://api.tfl.gov.uk/StopPoint/"+busStopCode+"/Arrivals?api_key=4c2ec6355dc441148aedf4a24a48bb8c";
// fetch(url)
//     .then(response => response.json())
//     .then(body => console.log(body));

// console.log('aaa');
// console.log(fetch.response);

const records = fetchAsync (url);
console.log(records);