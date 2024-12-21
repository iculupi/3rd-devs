import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";

export async function mapFiles(params: {
    sourceDir: string;
    sourceFilter?: (file: string) => boolean;
    cacheFile: string;
    systemPromptFile: string;
    model?: string;
    contentProcessor?: (fileName: string, content: string) => Promise<string>;
    __dirname: string;
}): Promise<Record<string, string>> {
    let result: Record<string, string> = {};
    const openai = new OpenAI();
    const model = params.model || "gpt-4-turbo-preview";
    const dirname = params.__dirname;
    const contentProcessor = params.contentProcessor || (async (fileName, content) => content);
    const cacheFilePath = path.join(dirname, params.cacheFile);
    const sourceFilter = params.sourceFilter || (() => true);

    try {
        // Próbuj wczytać z cache
        const data = await fs.readFile(cacheFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.log(`${params.cacheFile} not found. Processing files...`);
        
        // Wczytaj pliki
        const files = await fs.readdir(params.sourceDir);
        const system = await fs.readFile(
            path.join(dirname, params.systemPromptFile),
            "utf-8"
        );

        // Przetwórz pliki
        const pairs = await Promise.all(
            files
                .filter(sourceFilter)
                .map(async (file) => {
                    let content = await fs.readFile(
                        path.join(params.sourceDir, file),
                        "utf-8"
                    );
                    content = await contentProcessor(file, content);
                    
                    const response = await openai.chat.completions.create({
                        model,
                        messages: [
                            { role: "system", content: system },
                            { role: "user", content },
                        ],
                    });
                    
                    const processed = response.choices[0].message.content || "";
                    return { file, content: processed };
                })
        );

        // Zapisz wyniki
        pairs.forEach((pair) => {
            if (pair.content) {
                result[pair.file] = pair.content;
            }
        });

        // Zapisz cache
        await fs.writeFile(cacheFilePath, JSON.stringify(result, null, 2), "utf-8");
        return result;
    }
}

export async function extractPerson(content: string, openai: OpenAI): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You will be given a text which mentions some suspicious person. Please extract just the name of that person. No additional text. If there is no person mentioned return nothing."
            },
            {
                role: "user",
                content
            }
        ],
        temperature: 0.1
    });
    return response.choices[0].message.content?.trim() || '';
}

export async function generateMetadata(
    fileName: string,
    content: string,
    personData: string,
    openai: OpenAI
): Promise<string> {
    const prompt = `
<record_name>
${fileName}
</record_name>
<person_data>
${personData}
</person_data>
<investigation_data>
${content}
</investigation_data>`;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: `Provide a set of most important keywords from given data of both person_data and investigation_data.
- the given words have to be nouns in polish language
- always provide nouns in nominative singular form i.e. "sportowiec" not "sportowca" or "język" not "języki" etc.
- respond only with keywords, no additional text
- in section record_name you will be given location name. Provide it as one of the keywords i.e. "sektor C4"
- pay attention to programming languages. If some is mentioned, provide is as keyword
- separate given words by commas`
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.1
    });

    return response.choices[0].message.content?.trim() || '';
} 