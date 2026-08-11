const llmClient = require("../llm/client");
const { generateErrorAnalysisPrompt } = require("../llm/prompts");

const analyzeError = async (error, impactAnalysis) => {

    const prompt = generateErrorAnalysisPrompt(
        error,
        impactAnalysis
    );

    return await llmClient.generate(prompt);
};

module.exports = {
    analyzeError
};