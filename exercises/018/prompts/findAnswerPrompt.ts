export default (question: string) => `
<objective>Find the answer to the question: ${question}</objective>
<rules>
- you will be given a markdown scrap of a webpage as input
- try to find answer to given question on that page
- if you can't find the answer set "isOk" field to false
- for email addresses:
  - return EXACTLY the email as found on the page, without any modifications
  - do not change or format the email address
- for web interfaces:
  - return ONLY the URL, nothing else
- for ISO certificates:
  - return array of certificate numbers ["ISO XXX", "ISO YYY"]
  - or return comma-separated string "ISO XXX, ISO YYY"
</rules>
<response>
Respond in JSON format DON'T WRAP IT IN MARKDOWN!:
{
  "thinking": (Provide some context on how you are trying to find the answer),
  "isOk": (set to true if you found the answer, false otherwise),
  "answer": (The answer to the question, if can't find the answer set it to null)
}
</response>

<examples>
{
  "thinking": "Found email address in contact section",
  "isOk": true,
  "answer": "kontakt@softoai.whatever"
}

{
  "thinking": "Found web interface URL in portfolio section",
  "isOk": true,
  "answer": "https://banan.ag3nts.org"
}

{
  "thinking": "Found ISO certificates in about section",
  "isOk": true,
  "answer": ["ISO 9001", "ISO/IEC 27001"]
}
</examples>
`;