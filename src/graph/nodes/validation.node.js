const validationNode = async (state) => {

    const recommendations = state.recommendations;

    if (!recommendations) {
        return {
            validationResult: {
                valid: false,
                reason: "No recommendation was generated."
            }
        };
    }

    const {
        priority,
        recommendedActions,
        reason
    } = recommendations;


    const errors = [];


    // Validate priority
    if (!["P1", "P2", "P3"].includes(priority)) {
        errors.push(
            "Priority must be P1, P2, or P3."
        );
    }


    // Validate actions
    if (
        !Array.isArray(recommendedActions) ||
        recommendedActions.length === 0
    ) {
        errors.push(
            "At least one recommended action is required."
        );
    }


    // Validate reason
    if (
        typeof reason !== "string" ||
        reason.trim().length === 0
    ) {
        errors.push(
            "Recommendation reason is missing."
        );
    }


    return {
        validationResult: {
            valid: errors.length === 0,
            errors
        }
    };
};


module.exports = {
    validationNode
};