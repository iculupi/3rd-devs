import axios from 'axios';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function solveCaptchaQuestion(question: string): Promise<number> {
  const completion = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a helper that answers questions with only numbers. No explanation, just the number." 
      },
      { 
        role: "user", 
        content: question 
      }
    ],
    model: "gpt-4-turbo",
  });

  const answer = completion.choices[0].message.content;
  return parseInt(answer || '0', 10);
}

async function loginToWebsite() {
  try {
    // Step 1 & 2: Load the website and find the question
    const response = await axios.get('https://xyz.ag3nts.org/');
    const $ = cheerio.load(response.data);
    const question = $('#human-question').text().replace('Question:', '').trim();

    // Step 3 & 4: Get the answer using OpenAI
    const answer = await solveCaptchaQuestion(question);

    // Step 5: Send POST request with credentials and answer
    const loginData = new URLSearchParams({
      username: 'tester',
      password: '574e112a',
      answer: answer.toString()
    }).toString();

    const loginResponse = await axios.post('https://xyz.ag3nts.org/', loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Step 6: Log the response
    console.log('Login response:', loginResponse.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the login process
loginToWebsite();