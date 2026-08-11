const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const generateRecommendationPrompt = (
    impactAnalysis,
    retrievedContext
) => `

You are a Senior Banking Risk Decision Agent.

Your job is to recommend appropriate actions
for detected SCD drift.

Use the retrieved business rules as the primary
source for your recommended actions.

Rules:

- Return ONLY valid JSON.
- Do not invent specific internal policies.
- Do not recommend actions that contradict the
  retrieved business rules.
- You may combine multiple retrieved business rules
  when multiple drift events are related.
- Priority must be P1, P2, or P3.
- Recommendations should be practical and directly
  related to the detected drift.

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

${JSON.stringify(
    impactAnalysis,
    null,
    2
)}

Retrieved Business Rules:

${JSON.stringify(
    retrievedContext,
    null,
    2
)}
`;


const generateRecommendation = async (
    impactAnalysis,
    retrievedContext
) => {

    const prompt =
        generateRecommendationPrompt(
            impactAnalysis,
            retrievedContext
        );


    const response =
        await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.2
        });


    const content =
        response.choices[0].message.content;


    return JSON.parse(content);
};


module.exports = {
    generateRecommendation
};