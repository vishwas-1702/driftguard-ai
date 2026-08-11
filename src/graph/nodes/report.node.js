const reportNode = async (state) => {

    const {
        impactAnalysis,
        recommendations,
        validationResult
    } = state;


    if (!validationResult?.valid) {

        return {
            finalReport: {
                status: "VALIDATION_FAILED",
                validationErrors:
                    validationResult?.errors || []
            }
        };
    }


    return {
        finalReport: {

            status: "ACTION_REQUIRED",

            priority:
                recommendations.priority,

            severity:
                impactAnalysis.severity,

            confidence:
                impactAnalysis.confidence,

            summary:
                impactAnalysis.summary,

            recommendedActions:
                recommendations.recommendedActions,

            reason:
                recommendations.reason
        }
    };
};


module.exports = {
    reportNode
};