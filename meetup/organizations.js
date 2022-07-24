const axios = require("axios");
const fs = require("fs");
const { removeDuplicatesByID, removeNullProperties } = require("./funs");

let topicCategoryId = "";

let cat = [
    // {
    //     id: 521,
    //     name: "Arts and Culture",
    // },
    // {
    //     id: 395,
    //     name: "Music",
    // },
    {
        id: 535,
        name: "gaming",
        queries: ["gaming", "game"],
    },
];
const getOrgs = ({ id, name, queries }) => {
    const config = (id, query) => {
        let con = {
            method: "post",
            url: "https://www.meetup.com/gql",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                operationName: "rankedGroups",
                variables: {
                    city: "London",
                    country: "gb",
                    first: 500,
                    lat: 51.45000076293945,
                    lon: -0.23999999463558197,
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
        con.data = JSON.stringify(con.data);
        return con;
    };

    axios
        // @ts-ignore
        .all([axios(config(id)), ...queries.map((q) => axios(config(id, q))), ...queries.map((q) => axios(config(null, q)))])

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
            ret = removeDuplicatesByID(ret);
            console.log(name, ret.length);
            fs.writeFileSync(`${name}-organizations.json`, JSON.stringify(ret));
            return ret;
        })
        .catch((error) => {
            console.log(error);
        });
};

cat.forEach((c) => {
    getOrgs(c);
});
