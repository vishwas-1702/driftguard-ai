const {
    retrieveRelevantRules
} = require("../../rag/retriever");


const retrievalNode = async (state) => {

    const query = `
Find the business rules relevant to these
detected SCD changes.

Detected changes:

${JSON.stringify(
    state.driftEvents,
    null,
    2
)}
`;


    const results =
        await retrieveRelevantRules(
            query,
            4
        );


    const retrievedContext =
        results.map(result => ({

            id: result.id,

            content: result.content,

            score: result.score,

            metadata: result.metadata

        }));


    return {
        retrievedContext
    };
};


module.exports = {
    retrievalNode
};