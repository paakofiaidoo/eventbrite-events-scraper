const fs = require("fs");
const { parse } = require("json2csv");

let filter = "Gaming";
let filterPoints = ["game", "gaming", "games"];

//open the file and read it
let events = JSON.parse(fs.readFileSync("eventbrite.json", "utf8"));
let filtered = events
    // .filter((event) => {
    //     try {
    //         return filterPoints.some((point) => {
    //             return (
    //                 (event.name && event.name.toLowerCase().includes(point)) ||
    //                 (typeof event.description === "string" && event.description.toLowerCase().includes(point)) ||
    //                 (event.category && event.category.name.toLowerCase().includes(point)) ||
    //                 (event.summary && event.summary.toLowerCase().includes(point))
    //             );
    //         });
    //     } catch (error) {
    //         console.log(error, event);
    //     }
    // })
    .filter((event) => {
        try {
            return (event.venue && event.venue.address.country.toLowerCase() === "gb") || (event.venue && event.venue.city === "london");
        } catch (error) {
            console.log(error, event);
        }
    });
// Gaming / games design / Serious or educational games
// Film / TV / video production / Augmented Reality
// Theatre / arts festival / community arts
// Music
// Publishing / creative writing /
// PR / media
// Heritage venues
fs.writeFileSync(`london-events.json`, JSON.stringify(filtered));
console.log(filtered.length);
