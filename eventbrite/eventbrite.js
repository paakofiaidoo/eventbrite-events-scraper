// this script is to get all events from a country in eventbrite

const axios = require("axios");
const fs = require("fs");

let country = "united-kingdom--london";

const getData = async (page = 1) => {
    let url = page === 1 ? `https://www.eventbrite.com/d/${country}/all-events` : `https://www.eventbrite.com/d/${country}/all-events/?page=${page}`;
    // @ts-ignore
    let data = await axios(url)
        .then((response) => {
            // When the page is loaded convert it to text
            return response.data;
        })
        .then((html) => {
            let startString = `window.__SERVER_DATA__ =`;
            let start = html.search(startString);
            let end = html.search(`window.__REACT_QUERY_STATE__ =`);
            let data = html.slice(start + startString.length, end);
            data = data.slice(0, data.lastIndexOf(`;`));
            data = JSON.parse(data);
            data = data["search_data"].events;
            return data;
        })
        .catch(function (err) {
            console.log("Failed to fetch page: ", err);
        });
    return data;
};

let events = [];

getData().then((data) => {
    events.push(...getEventsData(data.results));
    if (data.pagination.page_count > 1) {
        let temp = [];
        for (let i = 2; i <= data.pagination.page_count; i++) {
            temp.push(i);
            getData(i)
                .then((data) => {
                    events.push(...getEventsData(data.results));
                    temp.pop();
                })
                .then(() => {
                    if (temp.length === 0) {
                        // fs.writeFileSync(`${country}.csv`, ConvertToCSV(events));
                        fs.writeFileSync(`${country}(organizations).json`, JSON.stringify(removeDuplicates(events)));
                    }
                });
        }
    }
});

const getEventsData = (events) => {
    return events.map((event) => {
        return event.primary_organizer_id;
    });
};

// id  primary_organizer_id  name  summary
function ConvertToCSV(objArray) {
    let csv = "Event_Id,Event_Name,Event_Summary,Event_Organizer,start_date,url,is_online_event\n";

    objArray.map((obj) => {
        csv += `${obj.id ? obj.id : null},${obj.name ? obj.name : null},${obj.summary ? obj.summary : null},${obj.organizer ? obj.organizer : null},${obj.start_date ? obj.start_date : null},${
            obj.url ? obj.url : null
        },${obj.is_online_event}\n`;
    });
    return csv;
}

//function to remove duplicates objects with same id from an array
function removeDuplicates(arr) {
    let unique_array = [];
    for (let i = 0; i < arr.length; i++) {
        if (
            unique_array.findIndex((obj) => {
                return obj === arr[i];
            }) === -1
        ) {
            unique_array.push(arr[i]);
        }
    }
    return unique_array;
}
