import { OpenAI } from "openai";

export interface SearchTarget {
  people: string[];
  places: string[];
}

export class InvestigationProcessor {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI();
  }

  async extractSearchTargets(text: string): Promise<SearchTarget> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a precise assistant that extracts names from text. Extract all unique first names of people and city names from the text. Return only names in Polish nominative case without Polish characters. Format: {\"people\": [\"name1\", \"name2\"], \"places\": [\"city1\", \"city2\"]}"
        },
        { role: "user", content: text }
      ]
    });

    try {
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error parsing GPT response:", error);
      return { people: [], places: [] };
    }
  }

  async processSearchResults(
    results: {
      people: Record<string, string[]>,
      places: Record<string, string[]>
    },
    searched: Set<string>,
    barbaraLocations: Set<string>
  ): Promise<SearchTarget> {
    const toSearch: SearchTarget = { people: [], places: [] };
    
    // Przetwarzanie wyników dla osób
    for (const [person, locations] of Object.entries(results.people)) {
      for (const location of locations) {
        if (location === "**RESTRICTED_DATA**") continue;
        if (location === "BARBARA") {
          barbaraLocations.add(person);
          console.log(`!!! Barbara found in connection with ${person}`);
        }
        if (!searched.has(location)) {
          searched.add(location);
          toSearch.places.push(location);
        }
      }
    }
    
    // Przetwarzanie wyników dla miejsc
    for (const [place, people] of Object.entries(results.places)) {
      for (const person of people) {
        if (person === "**RESTRICTED_DATA**") continue;
        if (person === "BARBARA") {
          barbaraLocations.add(place);
          console.log(`!!! Barbara found in ${place}`);
        }
        if (!searched.has(person)) {
          searched.add(person);
          toSearch.people.push(person);
        }
      }
    }
    
    return toSearch;
  }
} 