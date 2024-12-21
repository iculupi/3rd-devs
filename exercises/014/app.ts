import { config } from 'dotenv';
config();

import { OpenAI } from "openai";
import { promises as fs } from "fs";
import path from "path";
import axios from "axios";
import { SystemPrompts } from "../../utils/prompts/systemPrompts";
import { CentralaHandler } from "../../utils/api/handlers/CentralaHandler";

// Typy
interface InfoList {
  people: string[];
  places: string[];
}

type AList = Record<string, string[]>;

const openai = new OpenAI();
const model = "gpt-4";
const logsDir = path.join(__dirname, 'logs');

// Funkcje pomocnicze
function removePolishCharacters(text: string): string {
  return text
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_') // zamień wszystkie znaki specjalne na _
    .replace(/_+/g, '_')         // zamień wielokrotne _ na pojedyncze
    .replace(/^_|_$/g, '')       // usuń _ z początku i końca
    .toLowerCase();
}

async function ensureLogsDir() {
  await fs.mkdir(logsDir, { recursive: true });
}

async function logToFile(filename: string, data: any) {
  const sanitizedFilename = sanitizeFileName(filename);
  const logPath = path.join(logsDir, sanitizedFilename);
  await fs.writeFile(logPath, JSON.stringify(data, null, 2));
  console.log(`Logged to ${sanitizedFilename}`);
}

// Główne funkcje
async function getInitialInfoList(): Promise<InfoList> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SystemPrompts.AI_DEVS_3_TASK_014.SYSTEM },
      { role: "user", content: SystemPrompts.AI_DEVS_3_TASK_014.USER_1 },
    ]
  });

  await logToFile('initial_gpt_response.json', response);

  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    await logToFile('initial_info_list.json', result);
    return result;
  } catch (error) {
    console.error("Error parsing GPT response:", error);
    return { people: [], places: [] };
  }
}

async function queryDatabase(name: string, query: string): Promise<string[]> {
  query = removePolishCharacters(query.toUpperCase());
  console.log(`Querying database for ${name} with query: ${query}`);
  
  const requestData = {
    apikey: process.env.PERSONAL_API_KEY,
    query
  };

  await logToFile(`query_${name}_${query}.request.json`, requestData);
  
  try {
    const response = await axios.post(`https://centrala.ag3nts.org/${name}`, requestData, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    await logToFile(`query_${name}_${query}.response.json`, response.data);

    let message = response.data.message.replaceAll("[**RESTRICTED DATA**]", "**RESTRICTED_DATA**");
    let split = message.split(" ");
    return split;
  } catch (error) {
    console.error("Error querying database:", (error as any).response?.data?.message || error);
    await logToFile(`query_${name}_${query}.error.json`, error);
    return [];
  }
}

async function processDatabaseQueries(input: Record<string, string[]>): Promise<Record<string, Record<string, string[]>>> {
  await logToFile('process_queries_input.json', input);
  
  let output: Record<string, Record<string, string[]>> = {};
  for (let key in input) {
    output[key] = {};
    let value = input[key];
    await Promise.all(value.map(async v => {
      let result = await queryDatabase(key, v);
      output[key][v] = result;
    }));
  }

  await logToFile('process_queries_output.json', output);
  return output;
}

function distributeSearchResults(
  alreadySearched: AList, 
  searchResult: Record<string, AList>,
  barbaraLocations: string[]
): InfoList {
  const logData = {
    input: {
      alreadySearched,
      searchResult
    }
  };

  let toSearch: AList = {};
  for(let typ in searchResult) {
    for(let key in searchResult[typ]) {
      let value = searchResult[typ][key];
      for(let v of value) {
        if(v === "BARBARA") {
          barbaraLocations.push(key);
          console.log(`!!!!Barbara was in ${key}!`);
        }
        if(alreadySearched[typ] && alreadySearched[typ].includes(v))
          continue;
        if(v === "**RESTRICTED_DATA**")
          continue;
        alreadySearched[typ] = alreadySearched[typ] || [];
        alreadySearched[typ].push(v);
        toSearch[typ] = toSearch[typ] || [];
        toSearch[typ].push(v);
      }
    }
  }

  const result = {
    places: toSearch.people || [],
    people: toSearch.places || []
  };

  logData.output = {
    result,
    alreadySearched,
    barbaraLocations
  };

  logToFile('distribute_search_results.json', logData);
  return result;
}

async function main() {
  try {
    await ensureLogsDir();
    console.log("Starting investigation...");
    
    let toBeSearched: InfoList = await getInitialInfoList();
    let alreadySearched: InfoList = { people: [], places: [] };
    let barbaraLocations: string[] = [];

    for(let i = 0; i < 20; i++) {
      await logToFile(`iteration_${i}_start.json`, {
        toBeSearched,
        alreadySearched,
        barbaraLocations
      });

      let searchResult = await processDatabaseQueries(toBeSearched);
      console.log(`searchResult: ${JSON.stringify(searchResult)}`);
      
      toBeSearched = distributeSearchResults(alreadySearched, searchResult, barbaraLocations);
      console.log(`toBeSearched: ${JSON.stringify(toBeSearched)}`);

      await logToFile(`iteration_${i}_end.json`, {
        searchResult,
        toBeSearched,
        alreadySearched,
        barbaraLocations
      });

      if(toBeSearched.people.length === 0 && toBeSearched.places.length === 0) {
        break;
      }
    }

    console.log(`Barbara was found in: ${JSON.stringify(barbaraLocations)}`);
    
    // Użyj CentralaHandler do raportowania
    const centralaHandler = new CentralaHandler(__dirname);
    
    for(let place of barbaraLocations) {
      try {
        const reportResult = await centralaHandler.report("loop", place);
        await logToFile(`report_${place}_response.json`, reportResult);
      } catch (error) {
        console.error(`Error reporting location ${place}:`, error);
        await logToFile(`report_${place}_error.json`, error);
      }
    }

  } catch (error) {
    console.error("Error in main process:", error);
    await logToFile('error.json', error);
  }
}

main();