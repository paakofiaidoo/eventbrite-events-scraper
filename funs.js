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
module.exports = {
    removeDuplicates,
    removeNullProperties,
    removeDuplicatesByID,
    getMonths,
};
