// [파일 이름: /api/translate.js] - OpenAI API를 활용한 번역 프록시

const { OpenAI } = require('openai');

module.exports = async (request, response) => {
    // Vercel 환경 변수에서 키를 가져옵니다.
    const apiKey = process.env.OPENAI_API_KEY;
    const { text, targetLang } = request.query;

    if (!apiKey || !text || !targetLang) {
        return response.status(400).json({ error: "Missing required parameters or API Key" });
    }

    try {
        const openai = new OpenAI({ apiKey });
        
        // ChatGPT 4o 모델을 사용하여 번역 요청 (HTML 원본 유지)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                {
                    role: "system", 
                    content: `You are an expert translator. Translate the following Korean HTML text into ${targetLang}. Preserve all HTML tags (<h1>, <h2>, <h3>, <strong>, <li>, <ul>, <p>, etc.) and emojis. Only translate the Korean text inside the tags. Do not add any extra commentary, just the translated HTML output.`
                },
                {
                    role: "user", 
                    content: text 
                }
            ],
            temperature: 0.1, // 정확도를 높임
        });
        
        const translatedText = completion.choices[0].message.content.trim();
        
        // 번역된 텍스트를 프론트엔드로 전달
        response.status(200).json({ translatedText });

    } catch (error) {
        console.error("Translation API Error:", error);
        response.status(500).json({ error: "Failed to communicate with the translation service." });
    }
};
