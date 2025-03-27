async function fetchNewQuestions(difficulty) {
    const API_KEY = "YOUR_GEMINI_API_KEY";  // Replace with actual key
    const prompt = `Generate 10 quiz questions on Theory of Computation with ${difficulty} difficulty in JSON format with question, options, and answer.`;

    const response = await fetch("https://api.gemini.com/v1/text-generation", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const newQuestions = JSON.parse(data.text);

    // Store questions for next quiz
    localStorage.setItem("adaptiveQuizQuestions", JSON.stringify(newQuestions));
}
