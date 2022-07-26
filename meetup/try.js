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

let fileName = "./meetup/data/events/witting(meetup).json";

const err = (error) => {
    if (error.response) {
        console.log(error.response.data);
        // console.log(error.response.headers);
    }
    // else if (error.request) {
    //     console.log(error.request);
    // }
    else {
        console.log("Error", error.message);
    }
};
const getData = async (organization_id) => {
    // @ts-ignore

    let data = JSON.stringify({
        query: `{
        group(id: ${organization_id}) {
          pastEvents(input: {first: 50}) {
            count
            edges {
              cursor
              node {
                id
                title
                eventUrl
                description
                dateTime
                duration
                host {
                  id
                  name
                }
                group {
                  id
                  name
                  urlname
                }
                venue {
                  lat
                  lng
                }
              }
            }
          }
          upcomingEvents(input: {first: 100}) {
            count
            edges {
              cursor
              node {
                id
                title
                eventUrl
                description
                dateTime
                duration
                host {
                  id
                  name
                }
                group {
                  id
                  name
                  urlname
                }
                venue {
                  lat
                  lng
                }
              }
            }
          }
        }
      }`,
        letiables: {},
    });

    let config = {
        method: "post",
        url: "https://www.meetup.com/gql",
        headers: {
            "Content-Type": "application/json",
        },
        timeout: 100000,
        data: data,
    };
    return await // @ts-ignore
    axios(config)
        .then((res) => {
            let aLLEvents = [
                ...res.data.data.group.pastEvents.edges
                    .map((event) => {
                        return event.node;
                    })
                    .filter((event) => {
                        // filter out events that are 12 months or more in the past
                        return getMonths(event.local_date) <= 12 && event.venue;
                    }),
                ...res.data.data.group.upcomingEvents.edges
                    .map((event) => {
                        return event.node;
                    })
                    .filter((event) => {
                        return event.venue;
                    }),
            ];
            console.log(res.data.data.group.pastEvents.edges.length, res.data.data.group.upcomingEvents.edges.length, aLLEvents.length);
            aLLEvents.map((event, i) => {
                fs.appendFileSync(fileName, JSON.stringify(event) + ",");
            });
        })
        .catch(err);
};



let organizations = JSON.parse(fs.readFileSync("./meetup/data/orgs/writing-organizations.json", "utf8"));

fs.writeFileSync(fileName, "[");
organizations.map((organization) => {
    return getData(organization.id).catch(err);
});
console.log(organizations.length);
