export default (question: string) => `
<objective>Answer the following question based on the provided text: ${question}</objective>

<rules>
1. Base your answer only on the provided text
2. Be specific and concise
3. If the answer is not in the text, say so
4. Include relevant quotes or references if helpful
5. Format dates as YYYY-MM-DD
</rules>

<response>
{
  "thinking": "Explain your reasoning process",
  "answer": "Your final answer",
  "confidence": "High/Medium/Low based on available information"
}
</response>
`;