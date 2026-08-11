const {
    loadDataset
} = require("./data.loader");


const getPreviousDataset = async () => {

    return await loadDataset(
        "dataset-v1.json"
    );
};


const getCurrentDataset = async () => {

    return await loadDataset(
        "dataset-v2.json"
    );
};


module.exports = {
    getPreviousDataset,
    getCurrentDataset
};