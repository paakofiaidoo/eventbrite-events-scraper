const axios = require("axios");
// const { Parser } = require("json2csv");
const { parse } = require("json2csv");
const fs = require("fs");
//https://www.eventbrite.co.uk/org/41350641393/showmore/?page_size=30&type=future&page=1
let event = "https://www.eventbrite.co.uk/e/plant-based-social-tickets-294734888987";

const getData = async (page = 1, organization_id, type) => {
    let future, past;
    // @ts-ignore
    let data = await axios(`https://www.eventbrite.co.uk/org/${organization_id}/showmore/?page_size=30&type=${type}&page=${page}`)
        .then((response) => {
            // When the page is loaded convert it to text
            let html = response.data;
            let startString = `<a id="organizer-link-org-panel" href="`;
            let start = html.search(startString);
            html = html.slice(start + startString.length);
            let end = html.search(`"`);
            let url = html.slice(0, end);
            console.log(url);

            return url;
        })
        .then((url) => {
            // @ts-ignore
            axios(url)
                .then((response) => {
                    let html = response.data;
                    let startString = `window.__SERVER_DATA__ =`;
                    let start = html.search(startString);
                    let end = html.search(`window.__REACT_QUERY_STATE__`);
                    let data = html.slice(start + startString.length, end);
                    data = data.slice(0, data.lastIndexOf(`;`));
                    data = JSON.parse(data);
                    data = data["view_data"].events;
                    return data;
                })
                .then((data) => {
                    const fields = [
                        "id",
                        "name.text",
                        "organizer.name",
                        "category.name",
                        "format.name",
                        "start.local",
                        "venue.name",
                        "venue.address.localized_address_display",
                        "venue.longitude",
                        "venue.latitude",
                        "summary",
                        "organization_id",
                    ];
                    const opts = { fields };
                    try {
                         future = parse(data.future_events, opts);
                        fs.writeFileSync("eventbrite-Future(organization=Bohemia Place Market).csv", future);

                         past = parse(data.past_events, opts);
                        fs.writeFileSync("eventbrite-Past(organization=Bohemia Place Market).csv", past);
                    } catch (err) {
                        console.error(err);
                    }
                })
                .catch((error) => {
                    console.log("Failed to fetch page: ", error);
                });
        })
        .catch(function (err) {
            console.log("Failed to fetch page: ", err);
        });
    return data;
};

getData();
