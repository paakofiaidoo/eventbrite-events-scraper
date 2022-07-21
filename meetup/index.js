const axios = require("axios");
const { parse } = require("json2csv");
const fs = require("fs");

let future = [],
    past = [];

const getData = async (organization_id, type) => {
    let pastURL = `https://api.meetup.com/${organization_id}/events?desc=true&scroll=since%3A2022-07-21T09%3A00%3A00.000-07%3A00&has_ended=true&page=50&status=upcoming%2Cpast%2Ccancelled`;
    let FutureURL = `https://api.meetup.com/${organization_id}/events?desc=false&scroll=since%3A2022-07-21T09%3A00%3A00.000-07%3A00&has_ended=false&page=50&status=upcoming%2Ccancelled`;

    // @ts-ignore
    // get the data from the meetup api
    let data = await axios
        // @ts-ignore
        .all([axios(FutureURL), axios(pastURL)])
        .then((res) => {
            console.log(res[0].data[0]);
            if (type === "future") {
                // push the data to the future array
                future.push(...res[0].data);
            } else {
                past.push(
                    // push the data to the past array
                    ...res[1].data.filter((event) => {
                        // filter out events that are 12 months or more in the past
                        return getMonths(event.local_date) <= 12;
                    })
                );
            }
            // headers for the csv file
            const fields = [
                "id",
                "name",
                "local_date",
                "group.localized_location",
                "group.lon",
                "group.lat",
                "description",
                "link",
            ];
            const opts = { fields };

            //create a csv file with the future events
            let futureCSV = parse(future, opts);
            fs.writeFileSync(`meetup-Future(organization=${future[0].group.name}).csv`, futureCSV);
            console.log(future.length);

            // create a csv file with the past events
            let pastCSV = parse(past, opts);
            fs.writeFileSync(`meetup-Past(organization=${past[0].group.name}).csv`, pastCSV);
            console.log(past.length);
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
getData("www-visaliadowntowntoastmasters-com", "future");
getData("www-visaliadowntowntoastmasters-com", "past");
