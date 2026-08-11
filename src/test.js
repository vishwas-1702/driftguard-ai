require("dotenv").config();
const workflow = require("./graph/workflow");
const { loadDataset } = require("./services/data.loader");

(async () => {

    const previousDataset = await loadDataset("dataset-v1.json");
    const currentDataset = await loadDataset("dataset-v2.json");

    const result = await workflow.invoke({

        previousDataset,

        currentDataset

    });

    console.log(JSON.stringify(result, null, 2));

})();