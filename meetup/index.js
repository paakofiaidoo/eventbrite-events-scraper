const axios = require("axios");
const fs = require("fs");
const getEvent = require("./event");
const { getMonths } = require("../funs");

fs.writeFileSync("Gaming(meetup).json", "[");

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
                console.log(data);
                allEvents.push(...data);
                return data;
            });
            setVenues(
                allEvents.filter((event) => {
                    // filter out events that are 12 months or more in the past
                    return getMonths(event.local_date) <= 12;
                })
            );
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log("Error", error.message);
            }
        });
    return data;
};

//get the difference in months between two dates

// insect the id here

function setVenues(events) {
    console.log(events);
    axios
        // @ts-ignore
        .all(
            events.map((event) => {
                return getEvent(event.id).catch((error) => {
                    console.log("Failed to fetch page: ", error.data);
                });
            })
        )
        .then((response) => {
            response.map((event, i) => {
                events[i].venue = event.data.data.event.venue;
            });

            return events;
        })
        .then((events) => {
            events.map((event, i) => {
                if (i === events.length - 1) {
                    fs.appendFileSync("Gaming(meetup).json", JSON.stringify(event) + "]");
                } else {
                    fs.appendFileSync("Gaming(meetup).json", JSON.stringify(event) + ",");
                }
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

let organizations = JSON.parse(fs.readFileSync("./meetup/orgs/gaming-organizations.json", "utf8"));

getData(
    organizations.map((organization) => {
        return organization.link.split("https://www.meetup.com/")[1];
    })
    // ["pregnant-new-mums-group"]
).catch((error) => {
    console.log(error);
});
// console.log(
//     organizations.map((organization) => {
//         if (organization.link.split("https://www.meetup.com/")[1].split(" ").length !== 1) {
//             console.log(organization.link.split("https://www.meetup.com/")[1]);
//         }
//         return organization.link.split("https://www.meetup.com/")[1];
//     })
// );
