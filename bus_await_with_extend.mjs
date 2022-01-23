import { builtinModules } from "module";
import fetch from "node-fetch";

import ps from 'prompt-sync'; // >> npm install prompt-sync
const prompt = ps();

const API_KEY="4c2ec6355dc441148aedf4a24a48bb8"; 

async function fetchBusses (busStopCode){
    //const busStopCode="490008660N";
    const url = "https://api.tfl.gov.uk/StopPoint/"+busStopCode+"/Arrivals?api_key="+API_KEY;

    let response = await fetch(url);
    let data = await response.json();
        
    data.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation );

    for (const bus of data) { //for (let bus in data) console.log( "line nr = "+data[bus].lineName+" time = "+data[bus].expectedArrival);
        console.log(
            "Bus to " +
            bus.destinationName +
            " arriving in around " +
            Math.floor(bus.timeToStation/60) +
            " minutes.");
    }
}

async function fetchJourney (postCode, naptanId){
    const url = "https://api.tfl.gov.uk/Journey/JourneyResults/"+postCode+"/to/"+naptanId+"?api_key="+API_KEY;
    //https://api.tfl.gov.uk/Journey/JourneyResults/NW51TL/to/490006943N?api_key=4c2ec6355dc441148aedf4a24a48bb8

    let response = await fetch(url);
    let data = await response.json();
    //console.log(data.journeys);
    let numberOfWays = data.journeys.length;
    let wayNr=1;
    for (let j in data.journeys) {
        //console.log (data.journeys[j].legs);
        if (numberOfWays>0) {
            console.log ("ROUTE NR "+wayNr.toString());
            wayNr++;
        }
        for (const leg of data.journeys[j].legs) {
            console.log ("SUMMARY: "+leg.instruction.summary);
            //console.log(leg.instruction.steps);
            if (leg.instruction.steps.length>0) {
                console.log ("STEPS: ");
                for (let st in leg.instruction.steps) {
                    console.log(leg.instruction.steps[st].descriptionHeading+" "+
                        leg.instruction.steps[st].description);
                }
            }
        }
    }
}

import winston from 'winston';
const logger = winston.createLogger({ 
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

async function journeyBetween2PostCodes () {
    console.log("Enter the 1st post code: ");
    const postCode1=prompt(); // NW51TL // SW1A2AA  /se229hd /
    console.log("Enter the 2nd post code: ");
    const postCode2=prompt(); 
    // const postCode1="SW1A2AA"; 
    // const postCode2="se229hd"; 
    try {
        await fetchJourney (postCode1, postCode2)
    }
    catch (err){
        console.log("Cannot find post code "+postCode1+" or "+postCode2);
        logger.error("Cannot find post code "+postCode1+" or "+postCode2);
    }
    
}

async function fetchBusStopsByPostCode (){
    console.log("Enter post code: ");
    const postCode=prompt(); // NW51TL // SW1A2AA  /se229hd /AL4 0JA - no stops
    //const postCode="SW1A2AA"; 
    const url_postCode = "http://api.postcodes.io/postcodes/"+postCode;
    
    const response_postCode = await fetch(url_postCode);

    try {
        const data_postCode = await response_postCode.json();
        const longitude = data_postCode.result.longitude;
        const latitude = data_postCode.result.latitude;

        const validStop = [
            "CarPickupSetDownArea",
            "NaptanAirAccessArea",
            "NaptanAirEntrance",
            "NaptanAirportBuilding",
            "NaptanBusCoachStation",
            "NaptanBusWayPoint",
            "NaptanCoachAccessArea",
            "NaptanCoachBay",
            "NaptanCoachEntrance",
            "NaptanCoachServiceCoverage",
            "NaptanCoachVariableBay",
            "NaptanFerryAccessArea",
            "NaptanFerryBerth",
            "NaptanFerryEntrance",
            "NaptanFerryPort",
            "NaptanFlexibleZone",
            "NaptanHailAndRideSection",
            "NaptanLiftCableCarAccessArea",
            "NaptanLiftCableCarEntrance",
            "NaptanLiftCableCarStop",
            "NaptanLiftCableCarStopArea",
            "NaptanMarkedPoint",
            "NaptanMetroAccessArea",
            "NaptanMetroEntrance",
            "NaptanMetroPlatform",
            "NaptanMetroStation",
            "NaptanOnstreetBusCoachStopCluster",
            "NaptanOnstreetBusCoachStopPair",
            "NaptanPrivateBusCoachTram",
            "NaptanPublicBusCoachTram",
            "NaptanRailAccessArea",
            "NaptanRailEntrance",
            "NaptanRailPlatform",
            "NaptanRailStation",
            "NaptanSharedTaxi",
            "NaptanTaxiRank",
            "NaptanUnmarkedPoint",
            "TransportInterchange"
        ]
        
        const joinedTypes = validStop.join(',');
        
        const url_busStops = `https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=${joinedTypes}&radius=300`;

        const response_busStops = await fetch(url_busStops);
        const busStops = await response_busStops.json();

        if (busStops.stopPoints.length===0) {
            console.log("Cannot find bus stops close to the post code "+postCode);
        } else {
            //console.log(busStops);
            busStops.stopPoints.sort((stop1, stop2) => stop1.distance - stop2.distance );

            const Arr=[];
            for (const stop of busStops.stopPoints) { 
                if (stop.children.length>0)
                    Arr.push({name:stop.commonName, dist:stop.distance.toFixed(2),naptanId:stop.children[0].id});
            }
            let numberToPrint;
            if (Arr.length>1) numberToPrint=2;
            else if (Arr.length>0) numberToPrint=1;
            else numberToPrint=0;
            
             for (let i=0;i<numberToPrint;i++) {
                 console.log('*******************************************************************');
                 console.log("Bus Stop " + Arr[i].name + " is " + Arr[i].dist + "m away.");
                 //console.log(Arr[i].naptanId);
                 console.log('--------------------------');
                 console.log('Bus Schedule:');
                 await fetchBusses(Arr[i].naptanId);
                 console.log('--------------------------');
                 console.log('How do get to the Bus Stop:');
                 await fetchJourney (postCode, Arr[i].naptanId)
                 

             }
        }
        
    }
    catch (err) {
        console.log("Cannot find post code "+postCode);
        logger.error("Cannot find post code "+postCode);
    }
}

async function main() {
    console.log("1 - the 2 nearest stops + busses from them + how to get there ");
    console.log("2 - How to get from one Post Code to another ");
    const choice=prompt(); // NW51TL // SW1A2AA  /se229hd /AL4 0JA - no stops
    //const postCode="SW1A2AA"; 
    switch(choice) {
        case "1": 
            await fetchBusStopsByPostCode ();
            break;
        case "2": 
            await journeyBetween2PostCodes ();
            break;
        default: 
            console.log ("You should choose from 1 or 2 !!!");
    }

}

main();

