const {
    Annotation,
    StateGraph,
    START,
    END
} = require("@langchain/langgraph");


const { driftNode } =
    require("./nodes/drift.node");

const { impactNode } =
    require("./nodes/impact.node");

const { retrievalNode } =
    require("./nodes/retrieval.node");

const { recommendationNode } =
    require("./nodes/recommendation.node");

const { retryRecommendationNode } =
    require("./nodes/retryRecommendation.node");

const { errorAnalysisNode } =
    require("./nodes/errorAnalysis.node");

const { validationNode } =
    require("./nodes/validation.node");

const { reportNode } =
    require("./nodes/report.node");


const GraphState = Annotation.Root({

    previousDataset: Annotation(),

    currentDataset: Annotation(),

    driftEvents: Annotation(),

    impactAnalysis: Annotation(),

    retrievedContext: Annotation(),

    recommendations: Annotation(),

    recommendationAttempts: Annotation(),

    recommendationError: Annotation(),

    errorAnalysis: Annotation(),

    validationResult: Annotation(),

    finalReport: Annotation()
});


const routeAfterImpact = (state) => {

    if (state.impactAnalysis?.severity === "HIGH") {
        return "retrieval";
    }

    return END;
};


const routeAfterRecommendation = (state) => {

    // Recommendation failed
    if (state.recommendationError) {

        if ((state.recommendationAttempts || 0) < 2) {
            return "retryRecommendation";
        }

        return "analyzeError";
    }

    // Recommendation succeeded
    return "validation";
};


const workflow = new StateGraph(GraphState)

    // =========================
    // NODES
    // =========================

    .addNode(
        "drift",
        driftNode
    )

    .addNode(
        "impact",
        impactNode
    )

    .addNode(
        "retrieval",
        retrievalNode
    )

    .addNode(
        "recommendation",
        recommendationNode
    )

    .addNode(
        "retryRecommendation",
        retryRecommendationNode
    )

    .addNode(
        "analyzeError",
        errorAnalysisNode
    )

    .addNode(
        "validation",
        validationNode
    )

    .addNode(
        "report",
        reportNode
    )


    // =========================
    // MAIN FLOW
    // =========================

    // START → Drift
    .addEdge(
        START,
        "drift"
    )

    // Drift → Impact
    .addEdge(
        "drift",
        "impact"
    )

    // Impact → Retrieval OR END
    .addConditionalEdges(
        "impact",
        routeAfterImpact
    )

    // Retrieval → Recommendation
    .addEdge(
        "retrieval",
        "recommendation"
    )

    // Recommendation →
    // Validation / Retry / Error Analysis
    .addConditionalEdges(
        "recommendation",
        routeAfterRecommendation
    )

    // Retry → Recommendation
    .addEdge(
        "retryRecommendation",
        "recommendation"
    )

    // Validation → Report
    .addEdge(
        "validation",
        "report"
    )

    // Report → END
    .addEdge(
        "report",
        END
    )

    // Error Analysis → END
    .addEdge(
        "analyzeError",
        END
    )


    .compile();


module.exports = workflow;