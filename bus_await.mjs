import { builtinModules } from "module";
import fetch from "node-fetch";

import ps from 'prompt-sync'; // >> npm install prompt-sync
const prompt = ps();

const API_KEY="4c2ec6355dc441148aedf4a24a48bb8";


async function fetchBusses (){
    const busStopCode="490008660N";
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


// fetch(url)
//     .then(response => response.json())
//     .then(body => console.log(body));

//fetchBusses ();

async function fetchBusStopsByPostCode (){
    console.log("Enter post code: ");
    const postCode=prompt(); // NW51TL // SW1A2AA  //AL4 0JA - no stops
    const url_postCode = "http://api.postcodes.io/postcodes/"+postCode;
    
    const response_postCode = await fetch(url_postCode);
    // if (!response_postCode.ok) {
    //     console.log('Wrong Post Code!!!')
    // } else 
    try {
        const data_postCode = await response_postCode.json();
        const longitude = data_postCode.result.longitude;
        const latitude = data_postCode.result.latitude;

        console.log(longitude);
        console.log(latitude);

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
        
        const url_busStops = `https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=${joinedTypes}`;

        const response_busStops = await fetch(url_busStops);
        const busStops = await response_busStops.json();

        if (busStops.stopPoints.length===0) {
            console.log("Cannot find bus stops close to the post code "+postCode);
        } else {
            busStops.stopPoints.sort((stop1, stop2) => stop1.distance - stop2.distance );

            for (const stop of busStops.stopPoints) { 
                console.log(
                    "Bus Stop " +
                    stop.commonName +
                    " is " +
                    stop.distance.toFixed(2) +
                    "m away.");
            }
        }
        
    }
    catch (err) {
        console.log("Cannot find post code "+postCode);
    }
}

fetchBusStopsByPostCode ()


