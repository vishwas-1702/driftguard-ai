const generateImpactAnalysisPrompt = (events) => `
You are a Senior Banking Risk Analyst.

You are given drift events detected between two customer datasets.

Analyze ONLY the business impact.

Instructions:

- Return ONLY valid JSON.
- Do NOT return markdown.
- Severity must be one of:
  LOW
  MEDIUM
  HIGH

Return exactly this schema:

{
  "severity":"HIGH",
  "confidence":0.95,
  "summary":"...",
  "businessImpact":[
      "...",
      "..."
  ],
  "reasoning":[
      "...",
      "..."
  ]
}

Drift Events:

${JSON.stringify(events, null, 2)}
`;

const generateRecommendationPrompt = (impactAnalysis) => `
You are a Senior Banking Risk Decision Agent.

Based on the following impact analysis, recommend appropriate actions.

Rules:

- Return ONLY valid JSON.
- Do not invent specific internal policies.
- Recommend practical actions based on the detected risk.
- Priority must be P1, P2, or P3.

Return exactly:

{
  "priority": "P1",
  "recommendedActions": [
    "...",
    "..."
  ],
  "reason": "..."
}

Impact Analysis:

${JSON.stringify(impactAnalysis, null, 2)}
`;


const generateErrorAnalysisPrompt = (error, impactAnalysis) => `
You are a Senior AI System Error Analysis Agent.

A recommendation agent failed after multiple retry attempts.

Analyze the failure and determine:

1. What type of error occurred.
2. The likely cause.
3. Whether the error is recoverable.
4. What action should be taken next.

Return ONLY valid JSON.

Return exactly:

{
    "errorType": "LLM_ERROR",
    "cause": "...",
    "recoverable": true,
    "suggestedAction": "..."
}

Error:

${error}

Impact Analysis:

${JSON.stringify(impactAnalysis, null, 2)}
`;
module.exports = {
    generateImpactAnalysisPrompt,
    generateRecommendationPrompt,
    generateErrorAnalysisPrompt
};