var axios = require("axios");
// event(id: "${eventId}") {
//     title
//     description
//     dateTime
//     venue {
//         lat
//         lng
//         }
//   }

const getEvent = (eventId) => {
    var data = JSON.stringify({
        query: `query {
      event(id: "${eventId}") {
        venue {
            lat
            lng
            }
      }
    }`,
        variables: {},
    });

    var config = {
        method: "post",
        url: "https://www.meetup.com/gql",
        headers: {
            "Content-Type": "application/json",
        },
        timeout: 1000000,
        data: data,
    };
    // @ts-ignore
    return axios(config)
};

module.exports = getEvent;
