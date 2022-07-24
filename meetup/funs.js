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
function removeDuplicatesByID(arr) {
    let unique_array = [];
    for (let i = 0; i < arr.length; i++) {
        if (
            unique_array.findIndex((obj) => {
                return obj.id === arr[i].id;
            }) === -1
        ) {
            unique_array.push(arr[i]);
        }
    }
    return unique_array;
}
function removeNullProperties(obj) {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null) {
            delete obj[key];
        }
    });
    return obj;
}
module.exports = {
    removeDuplicates,
    removeNullProperties,
    removeDuplicatesByID
};
