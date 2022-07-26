const axios = require("axios");
const fs = require("fs");
const getEvent = require("./event");
const { getMonths } = require("../funs");

// Gaming / games design / Serious or educational games*
// *
// Theatre / arts festival / community arts*
// Music*
// Publishing / creative writing /*
// PR / media*
//*

let fileName = "./meetup/data/events/art(meetup).json";

const err = (error) => {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response);
        console.log(error.response.headers);
    }
    // else if (error.request) {
    //     console.log(error.request);
    // }
    else {
        console.log("Error", error.message);
    }
};
const getData = async (organizations) => {
    // @ts-ignore
    // get the data from the meetup api

    function fixedEncodeURI(str) {
        return encodeURI(decodeURIComponent(str));
    }
    let data = await axios
        // @ts-ignore
        .all([
            ...organizations.map((organization_id) =>
                // @ts-ignore
                axios(fixedEncodeURI(`https://api.meetup.com/${organization_id}/events?desc=true&scroll=since:2022-07-24T09:00:00.000-07:00&has_ended=true&page=50&status=upcoming,past,cancelled`))
            ),
            ...organizations.map((organization_id) =>
                // @ts-ignore
                axios(fixedEncodeURI(`https://api.meetup.com/${organization_id}/events?desc=false&scroll=since:2022-07-23T09:00:00.000-07:00&has_ended=false&page=50&status=upcoming,cancelled`))
            ),
        ])
        .then((res) => {
            // push the data to the future array
            let allEvents = [];
            // console.log(res);
            res.map(({ data }) => {
                allEvents.push(...data);
                return data;
            });
            // fs.appendFileSync(fileName, JSON.stringify(allEvents));
            setVenues(
                allEvents.filter((event) => {
                    // filter out events that are 12 months or more in the past
                    return getMonths(event.local_date) <= 12;
                })
            );
        })
        .catch(err);
    return data;
};

//get the difference in months between two dates

// insect the id here

function setVenues(events) {
    // console.log(events);
    axios
        // @ts-ignore
        .all(
            events.map((event) => {
                return getEvent(event.id).catch(err);
            })
        )

        .then((response) => {
            console.log(response.length);
            return response
                .map((event, i) => {
                    let temp;
                    if (event && event.data && event.data.data && event.data.data.event.venue) {
                        temp = {
                            ...events[i],
                            venue: event.data.data.event.venue,
                        };
                    } else {
                        temp = false;
                    }
                    return temp;
                })
                .filter((event, i) => {
                    if (!event) {
                        console.log("hi");
                    }
                    return event;
                });
        })
        .then((events) => {
            console.log(events.length);
            if (events.length > 0) {
                // fs.writeFileSync(fileName, "[");
                console.log(events.length, events[0]);
                events.map((event, i) => {
                    // if (i === events.length - 1) {
                    // fs.appendFileSync(fileName, JSON.stringify(event) + "]");
                    // } else {
                    fs.appendFileSync(fileName, JSON.stringify(event) + ",");
                    // }
                });
            }
        })
        .then(() => {
            console.log(upper, lower, "done");
        })
        .catch(err);
}

let organizations = JSON.parse(fs.readFileSync("./meetup/data/orgs/Arts-organizations.json", "utf8"));

console.log(organizations.length);
let upper = 7,
    lower = 0;
const run = setInterval(() => {
    getData(
        organizations.splice(lower, upper).map((organization) => {
            return organization.link.split("https://www.meetup.com/")[1];
        })
    ).catch(err);
    if (upper >= organizations.length) {
        clearInterval(run);
    }
    upper += 7;
    lower += 7;
}, 3600000);
