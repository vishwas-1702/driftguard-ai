const { LocalVectorStore } = require("./vectorStore");

const retrieveRelevantRules = async (
    query,
    topK = 3
) => {

    const vectorStore = new LocalVectorStore();

    vectorStore.load();

    const results =
        await vectorStore.search(
            query,
            topK
        );

    return results;
};

module.exports = {
    retrieveRelevantRules
};