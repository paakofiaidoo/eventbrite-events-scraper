const axios = require("axios");
const fs = require("fs");
const getEvent = require("./event");
const { getMonths } = require("../funs");



let file = "Arts";
let fileName = `./meetup/data/events/${file}(meetup).json`;

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
const getData = async (organization_id, i) => {
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
                  city
                  country
                  postalCode
                  address
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
                  city
                  country
                  postalCode
                  address
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
        timeout: 1000000,
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
            console.log(res.data.data.group.pastEvents.edges.length, res.data.data.group.upcomingEvents.edges.length, aLLEvents.length, `upper:${upper} lower:${lower} i:${i}`);
            aLLEvents.map((event, i) => {
                fs.appendFileSync(fileName, JSON.stringify(event) + ",");
            });
        })
        .catch(err);
};

let organizations = JSON.parse(fs.readFileSync(`./meetup/data/orgs/${file}-organizations.json`, "utf8"));

fs.writeFileSync(fileName, "[");

let upper = 30,
    lower = 0;
console.log(organizations.length);
const run = setInterval(() => {
    organizations.splice(lower, upper).map((organization, i) => {
        return getData(organization.id, i + lower).catch(err);
    });
    if (lower > organizations.length) {
        console.log(upper, lower);
        clearInterval(run);
    }
    upper += 30;
    lower += 30;
}, 20000);
