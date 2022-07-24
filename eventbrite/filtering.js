const fs = require("fs");
const { parse } = require("json2csv");

let filter = "media";
let filterPoints = ["media","Public relations","Public relation"];

//open the file and read it
let events = JSON.parse(fs.readFileSync("london-events.json", "utf8"));
let filtered = events.filter((event) => {
    try {
        return filterPoints.some((point) => {
            return (
                (event.name && event.name.toLowerCase().includes(point.toLowerCase())) ||
                (typeof event.description === "string" && event.description.toLowerCase().includes(point.toLowerCase())) ||
                (event.category && event.category.name.toLowerCase().includes(point.toLowerCase())) ||
                (event.summary && event.summary.toLowerCase().includes(point.toLowerCase()))
            );
        });
    } catch (error) {
        console.log(error, event);
    }
});
// .filter((event) => {
//     try {
//         return event.venue && event.venue.address.country.toLowerCase() === "gb" && event.venue.address.city && event.venue.address.city.toLowerCase().includes("london");
//     } catch (error) {
//         console.log(error, event);
//     }
// });
// fs.writeFileSync(`london-events.json`, JSON.stringify(filtered));

// Gaming / games design / Serious or educational games
// Film / TV / video production / Augmented Reality
// Theatre / arts festival / community arts
// Music
// Publishing / creative writing /
// PR / media
// Heritage venues
fs.writeFileSync(`${filter}-events.json`, JSON.stringify(filtered));
console.log(filtered.length);
