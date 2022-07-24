const axios = require("axios");
const fs = require("fs");
const { removeDuplicatesByID, removeNullProperties } = require("../funs");

// @ts-ignore
let topicCategoryId = "";
// Gaming / games design / Serious or educational games*
// Film / TV / video production / Augmented Reality*
// Theatre / arts festival / community arts*
// Music*
// Publishing / creative writing /*
// PR / media*
// Heritage venues*
let cat = [
    {
        id: 521,
        name: "Arts",
        queries: ["Art", "Theatre", "arts festival", "community arts"],
    },
    {
        id: 395,
        name: "Music",
        queries: ["Music", "singing", "songs"],
    },
    {
        id: 535,
        name: "gaming",
        queries: ["gaming", "game"],
    },
    {
        id: 467,
        name: "writing",
        queries: ["Publishing", "writing", "creative writing"],
    },
    {
        name: "media",
        queries: ["public relation", "media"],
    },
    {
        name: "Heritage",
        queries: ["Heritage"],
    },
    {
        name: "Film",
        queries: ["Film", "TV", "video production", "Augmented Reality", "AR"],
    },
];
// @ts-ignore
const getOrgs = ({ id, name, queries }) => {
    const config = (id, query) => {
        let con = {
            method: "post",
            url: "https://www.meetup.com/gql",
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 60000,
            data: {
                operationName: "rankedGroups",
                variables: {
                    city: "London",
                    country: "gb",
                    first: 500,
                    lat: 51.45000076293945,
                    lon: -0.23999999463558197,
                    eventType: "physical",
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: "414e42b2939ef496d32845fb1964c213a239ac82744a9363f912f0c9ac851575",
                    },
                },
            },
        };
        if (id) {
            con.data.variables.topicCategoryId = id;
        }
        if (query) {
            con.data.variables.query = query;
        }
        // @ts-ignore
        con.data = JSON.stringify(con.data);
        return con;
    };
    // @ts-ignore
    let calls = [...queries.map((q) => axios(config(null, q)))];
    if (id) {
        // @ts-ignore
        calls.push(axios(config(id)));
        // @ts-ignore
        queries.map((q) => calls.push(axios(config(id, q))));
    }

    axios

        // @ts-ignore
        .all([...calls])

        .then((response) => {
            // console.log(response);
            return response.map((res) => res.data.data.results.edges);
        })
        .then((data) => {
            let ret = [];
            data.forEach((res) => {
                ret.push(...res.map((edge) => removeNullProperties({ ...edge.node, groupPhoto: null, stats: null, __typename: null })));
            });
            console.log(ret.length);
            ret = removeDuplicatesByID(ret).filter((event) => {
                try {
                    return queries.some((point) => {
                        return (event.name && event.name.toLowerCase().includes(point.toLowerCase())) || (event.description && event.description.toLowerCase().includes(point.toLowerCase()));
                    });
                } catch (error) {
                    console.log(error, event);
                }
            });
            console.log(name, ret.length);
            fs.writeFileSync(`${name}-organizations.json`, JSON.stringify(ret));
            return ret;
        })
        .catch((error) => {
            console.log(error);
        });
    // @ts-ignore
};

cat.forEach((c) => {
    // @ts-ignore
    getOrgs(c);
});
