const axios = require("axios");
const { parse } = require("json2csv");
const fs = require("fs");
const getEvent = require("./event");

let future = [],
    past = [];

const getData = async (organization_id) => {
    let pastURL = `https://api.meetup.com/${organization_id}/events?desc=true&scroll=since%3A2022-07-23T09%3A00%3A00.000-07%3A00&has_ended=true&page=50&status=upcoming%2Cpast%2Ccancelled`;
    let FutureURL = `https://api.meetup.com/${organization_id}/events?desc=false&scroll=since%3A2022-07-23T09%3A00%3A00.000-07%3A00&has_ended=false&page=50&status=upcoming%2Ccancelled`;

    // @ts-ignore
    // get the data from the meetup api
    let data = await axios
        // @ts-ignore
        .all([axios(FutureURL), axios(pastURL)])
        .then((res) => {
            // push the data to the future array
            future.push(...res[0].data);
            res[0].data.forEach((event) => {
                getEvent(event.id);
            });
            past.push(
                // push the data to the past array
                ...res[1].data.filter((event) => {
                    // filter out events that are 12 months or more in the past
                    return getMonths(event.local_date) <= 12;
                })
            );
            // @ts-ignore
            setVenues(future, "future");
            setVenues(past, "past");
        })

        .catch((error) => {
            console.log("Failed to fetch page: ", error);
        });
    return data;
};

//get the difference in months between two dates
const getMonths = (start) => {
    let months = [];
    let startDate = new Date(start);
    let endDate = new Date();
    let currentDate = startDate;
    while (currentDate <= endDate) {
        months.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months.length;
};

// insect the id here
getData("sahaja-yoga-accra");

const createFile = () => {
    // headers for the csv file
    const fields = ["id", "group.id", "name", "local_date", "group.localized_location", "group.lon", "group.lat", "description", "link", "venue.lng", "venue.lat"];
    const opts = { fields };
    //create a csv file with the future events
    let futureCSV = parse(future, opts);
    fs.writeFileSync(`meetup-Future(organization=${future[0].group.name}).csv`, futureCSV);
    console.log(future.length);

    // create a csv file with the past events
    let pastCSV = parse(past, opts);
    fs.writeFileSync(`meetup-Past(organization=${past[0].group.name}).csv`, pastCSV);
    console.log(past.length);
};

function setVenues(list, type) {
    axios
        // @ts-ignore
        .all(
            list.map((event) => {
                return getEvent(event.id);
            })
        )
        .then((response) => {
            return response.map((event, i) => {
                if (type === "past") {
                    past[i].venue = event.data.data.event.venue;
                } else {
                    future[i].venue = event.data.data.event.venue;
                }
            });
        })
        .then(() => {
            createFile();
        })
        .catch((error) => {
            console.log(error);
        });
}
