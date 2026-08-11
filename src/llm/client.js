const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

const generate = async (prompt) => {

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

        temperature: 0.2,

        response_format: {
            type: "json_object"
        }

    });

    return JSON.parse(response.choices[0].message.content);

};

module.exports = {
    generate
};