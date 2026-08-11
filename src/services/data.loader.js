const fs = require("fs/promises");
const path = require("path");

const loadDataset = async (fileName) => {
    const filePath = path.join(__dirname, "../data", fileName);

    const file = await fs.readFile(filePath, "utf-8");

    return JSON.parse(file);
};

module.exports = {
    loadDataset
};