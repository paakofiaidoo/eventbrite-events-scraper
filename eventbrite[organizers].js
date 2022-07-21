const axios = require("axios");
// const { Parser } = require("json2csv");
const { parse } = require("json2csv");
const fs = require("fs");

let future = [],
    past = [];
const getData = async (page, organization_id, type) => {
    let temp = [];
    // @ts-ignore
    let data = await axios(`https://www.eventbrite.co.uk/org/${organization_id}/showmore/?page_size=30&type=${type}&page=${page}`)
        .then((response) => {
            temp.push(1);
            if (type === "future") {
                future.push(...response.data.data.events);
            } else {
                past.push(
                    ...response.data.data.events.filter((event) => {
                        console.log(getMonths(event.start.local),getMonths(event.start.local) <= 12);
                        return getMonths(event.start.local) <= 12;
                    })
                );
            }
            if (response.data.data.has_next_page) {
                temp.push(page + 1);
                getData(page + 1, organization_id, type);
            }
            return response.data.data.events;
        })
        .then((data) => {
            temp.pop();
            if (temp.length === 0) {
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
                if (type === "future") {
                    let futureCSV = parse(future, opts);
                    fs.writeFileSync(`eventbrite-Future(organization=${data[0].organizer.name}).csv`, futureCSV);
                    console.log(future.length);
                } else {
                    let pastCSV = parse(past, opts);
                    fs.writeFileSync(`eventbrite-Past(organization=${data[0].organizer.name}).csv`, pastCSV);
                    console.log(past.length);
                }
            }
        })

        .catch((error) => {
            console.log("Failed to fetch page: ", error);
        });
    return data;
};



//get the diffrence in months between two dates
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
getData(1, "20229697518", "future");
getData(1, "20229697518", "past");