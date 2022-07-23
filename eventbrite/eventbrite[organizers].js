const axios = require("axios");
const { parse } = require("json2csv");
const fs = require("fs");

fs.writeFileSync("eventbrite.json", "[{}");

const getData = async (page, organization_id, type) => {
    let temp = [];
    // @ts-ignore
    // get the data from the eventbrite api
    let data = await axios(`https://www.eventbrite.co.uk/org/${organization_id}/showmore/?page_size=30&type=${type}&page=${page}`)
        .then((response) => {
            temp.push(1);
            if (type === "future") {
                // push the data to the future array
                // future.push(...response.data.data.events);
                response.data.data.events.forEach((event) => {
                    fs.appendFileSync("eventbrite.json", "," + JSON.stringify(event));
                });
            } else {
                response.data.data.events
                    .filter((event) => {
                        // filter out events that are 12 months or more in the past
                        return getMonths(event.start.local) <= 12;
                    })
                    .forEach((event) => {
                        fs.appendFileSync("eventbrite.json", "," + JSON.stringify(event));
                    });
            }
            //check if there are more pages of data
            if (response.data.data.has_next_page) {
                temp.push(page + 1);
                // get the next page of data
                getData(page + 1, organization_id, type);
            }
            return response.data.data.events;
        })
        // .then((data) => {
        //     temp.pop();
        //     if (temp.length === 0) {
        //         // headers for the csv file
        //         const fields = [
        //             "id",
        //             "name.text",
        //             "organizer.name",
        //             "category.name",
        //             "format.name",
        //             "start.local",
        //             "venue.name",
        //             "venue.address.localized_address_display",
        //             "venue.longitude",
        //             "venue.latitude",
        //             "summary",
        //             "organization_id",
        //         ];
        //         const opts = { fields };
        //         if (type === "future") {
        //             //create a csv file with the future events
        //             // let futureCSV = parse(future, opts);
        //             // fs.writeFileSync(`eventbrite-Future(organization=${data[0].organizer.name}).csv`, futureCSV);
        //             console.log(future.length);

        //             return future;
        //         } else {
        //             // create a csv file with the past events
        //             let pastCSV = parse(past, opts);
        //             // fs.writeFileSync(`eventbrite-Past(organization=${data[0].organizer.name}).csv`, pastCSV);
        //             console.log(past.length);
        //             return past;
        //         }
        //     }
        // })

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
getData(1, "20229697518", "future");
getData(1, "20229697518", "past");

let organizations = JSON.parse(fs.readFileSync("./eventbrite/united-kingdom--london(organizations).json", "utf8"));

// organizations.forEach((organization) => {
//     fs.writeFileSync("eventbrite.json","[")
//     getData(1, organization, "future");
//     getData(1, organization, "past");
// });

module.exports = getData;
