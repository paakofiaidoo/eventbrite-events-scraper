const axios = require("axios");
const { parse } = require("json2csv");
const fs = require("fs");
const { format } = require("path");

fs.writeFileSync("eventbrite.json", "[");
let track = [],
    index = 0;

const getData = async (page, organization_id, type) => {
    let temp = [];
    // @ts-ignore
    // get the data from the eventbrite api
    let data = await axios(`https://www.eventbrite.co.uk/org/${organization_id}/showmore/?page_size=30&type=${type}&page=${page}`)
        .then((response) => {
            temp.push(1);
            if (response.data.data.has_next_page) {
                temp.push(page + 1);
                // get the next page of data
                getData(page + 1, organization_id, type);
            }
            if (type === "future") {
                // push the data to the future array
                // future.push(...response.data.data.events);
                return response.data.data.events;
            } else {
                return response.data.data.events.filter((event) => {
                    // filter out events that are 12 months or more in the past
                    return getMonths(event.start.local) <= 12;
                });
            }
        })
        .then((events) => {
            console.log(events.length, type);
            track.pop();
            if (events.length > 0) {
                events.forEach((event, i) => {
                    if (track.length === 0 && i === events.length - 1) {
                        fs.appendFileSync("eventbrite.json", JSON.stringify(getEventsData(event)) + "]");
                    } else {
                        fs.appendFileSync("eventbrite.json", JSON.stringify(getEventsData(event)) + ",");
                    }
                });
            }
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

// // insect the id here
// track.push(1);
// getData(1, "20229697518", "future");
// track.push(1);
// getData(1, "20229697518", "past");

let organizations = JSON.parse(fs.readFileSync("./eventbrite/united-kingdom--london(organizations).json", "utf8"));

organizations.forEach((organization) => {
    track.push(organization.id);
    getData(1, organization, "future");
    track.push(organization.id);
    getData(1, organization, "past");
});
//remove all properties that are null
function removeNullProperties(obj) {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null) {
            delete obj[key];
        }
    });
    return obj;
}
const getEventsData = (event) => {
    if (!event.id || !event.name) {
        console.log("event", event);
        return event;
    }

    return removeNullProperties({
        ...event,
        index: index++,
        locale: null,
        subcategory_id: null,
        rank: null,
        currency: null,
        logo: null,
        ticket_availability: null,
        show_pick_a_seat: null,
        is_externally_ticketed: null,
        is_series_parent: null,
        id: null,
        event_id: !!event.id ? event.id : null,
        name: !!event.name.text ? event.name.text : event.name,
        summary: !!event.summary ? event.summary.split("\n").join(" ").split(",").join(" ") : null,
        category: {
            name: event.category.name,
            subcategories: event.category.subcategories,
            format: event.format.name,
        },
        organizer: {
            website: event.organizer.website,
            organization_id: event.organizer.organization_id,
            url: event.organizer.url,
            id: event.organizer.id,
            name: event.organizer.name,
        },
        venue_id: null,
        user_id: null,
        source: null,
        show_seatmap_thumbnail: null,
        inventory_type: null,
        show_colors_in_seatmap_thumbnail: null,
        description: event.description.text ? event.description.text : event.description,
        listed: null,
        is_series: null,
        hide_end_date: null,
        _type: null,
        start_date: event.start.local,
        logo_id: null,
        end_date: event.end.local,
        format_id: null,
        tld: null,
        shareable: null,
        style_id: null,
        online_event: false,
        survey_type: null,
        end: null,
        format: null,
        start: null,
    });
};
module.exports = getData;
