const llmClient = require("../llm/client");
const { generateImpactAnalysisPrompt } = require("../llm/prompts");

const analyzeImpact = async (events) => {

    const simplifiedEvents = events.map(event => ({
        field: event.field,
        previousValue: event.previousValue,
        currentValue: event.currentValue
    }));

    const prompt = generateImpactAnalysisPrompt(simplifiedEvents);

    const analysis = await llmClient.generate(prompt);

    return analysis;
};

module.exports = {
    analyzeImpact
};