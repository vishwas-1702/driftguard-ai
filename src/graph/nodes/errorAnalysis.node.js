const { analyzeError } =
    require("../../agents/errorAnalysis.agent");

const errorAnalysisNode = async (state) => {

    const errorAnalysis = await analyzeError(
        state.recommendationError,
        state.impactAnalysis
    );

    return {
        errorAnalysis
    };
};

module.exports = {
    errorAnalysisNode
};