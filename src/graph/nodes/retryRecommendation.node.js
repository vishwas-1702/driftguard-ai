const retryRecommendationNode = async (state) => {

    const attempts = state.recommendationAttempts || 0;

    return {
        recommendationAttempts: attempts + 1,
        recommendationError: null
    };
};

module.exports = {
    retryRecommendationNode
};