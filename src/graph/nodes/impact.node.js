const { analyzeImpact } = require("../../agents/impactAnalysis.agent");

const impactNode = async (state) => {

    const impactAnalysis = await analyzeImpact(
        state.driftEvents
    );

    return {
        impactAnalysis
    };

};

module.exports = {
    impactNode
};