const {
    generateRecommendation
} = require("../../agents/recommendation.agent");


const recommendationNode = async (state) => {

    try {

        const recommendations =
            await generateRecommendation(
                state.impactAnalysis,
                state.retrievedContext
            );

        return {
            recommendations,
            recommendationError: null
        };

    } catch (error) {

        return {
            recommendationError: error.message
        };
    }
};


module.exports = {
    recommendationNode
};