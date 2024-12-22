export default () => `
<objective>Extract text from the provided image</objective>

<rules>
1. Extract all visible text from the image
2. Maintain the original formatting where possible
3. Include any handwritten text
4. Preserve numbers and special characters
5. Return text in the original language
</rules>

<response>
Return only the extracted text, no additional formatting or commentary.
</response>
`;