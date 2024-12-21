import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { CentralaHandler } from '../../utils/api/handlers/CentralaHandler';
import axios from 'axios';

config();

// Interfejsy
interface User {
    id: number;
    username: string;
}

interface Connection {
    user1_id: number;
    user2_id: number;
}

interface GraphNode {
    id: number;
    name: string;
    connections: number[];
}

// Stałe konfiguracyjne
const PATHS = {
    DATA_DIR: path.join(__dirname, 'data'),
    LOGS_DIR: path.join(__dirname, 'logs')
};

const API_CONFIG = {
    BASE_URL: 'https://centrala.ag3nts.org/apidb',
    API_KEY: process.env.PERSONAL_API_KEY
};

// Klasa grafu w pamięci
class InMemoryGraph {
    private nodes: Map<number, GraphNode> = new Map();
    private idToName: Map<number, string> = new Map();
    private nameToId: Map<string, number> = new Map();

    addNode(id: number, name: string): void {
        this.nodes.set(id, { id, name, connections: [] });
        this.idToName.set(id, name);
        this.nameToId.set(name, id);
    }

    addConnection(fromId: number, toId: number): void {
        const node = this.nodes.get(fromId);
        if (node) {
            node.connections.push(toId);
        }
    }

    findShortestPath(startName: string, endName: string): string[] {
        const startId = this.nameToId.get(startName);
        const endId = this.nameToId.get(endName);

        if (!startId || !endId) {
            throw new Error('Start or end node not found');
        }

        // BFS implementation
        const queue: number[] = [startId];
        const visited = new Set<number>([startId]);
        const parent = new Map<number, number>();

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (currentId === endId) {
                // Reconstruct path
                const path: string[] = [];
                let current = endId;
                while (current !== startId) {
                    path.unshift(this.idToName.get(current)!);
                    current = parent.get(current)!;
                }
                path.unshift(startName);
                return path;
            }

            const node = this.nodes.get(currentId);
            if (node) {
                for (const neighborId of node.connections) {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        parent.set(neighborId, currentId);
                        queue.push(neighborId);
                    }
                }
            }
        }

        throw new Error('No path found');
    }
}

// Funkcje pomocnicze
async function ensureDirectories(): Promise<void> {
    await Promise.all([
        fs.mkdir(PATHS.DATA_DIR, { recursive: true }),
        fs.mkdir(PATHS.LOGS_DIR, { recursive: true })
    ]);
}

async function logToFile(filename: string, data: any): Promise<void> {
    await fs.writeFile(
        path.join(PATHS.LOGS_DIR, filename),
        JSON.stringify(data, null, 2)
    );
}

// Funkcje główne
async function fetchMySQLData(): Promise<{ users: User[], connections: Connection[] }> {
    const usersQuery = "SELECT id, username FROM users";
    const connectionsQuery = "SELECT user1_id, user2_id FROM connections";

    const [usersResponse, connectionsResponse] = await Promise.all([
        axios.post(API_CONFIG.BASE_URL, {
            task: "database",
            apikey: API_CONFIG.API_KEY,
            query: usersQuery
        }),
        axios.post(API_CONFIG.BASE_URL, {
            task: "database",
            apikey: API_CONFIG.API_KEY,
            query: connectionsQuery
        })
    ]);

    return {
        users: usersResponse.data.reply,
        connections: connectionsResponse.data.reply
    };
}

async function buildGraph(data: { users: User[], connections: Connection[] }): Promise<InMemoryGraph> {
    const graph = new InMemoryGraph();

    // Add nodes
    for (const user of data.users) {
        graph.addNode(user.id, user.username);
    }

    // Add connections
    for (const conn of data.connections) {
        graph.addConnection(conn.user1_id, conn.user2_id);
    }

    return graph;
}

async function main() {
    try {
        // 1. Przygotuj katalogi
        await ensureDirectories();

        // 2. Pobierz dane z MySQL
        console.log('Fetching MySQL data...');
        const data = await fetchMySQLData();
        await logToFile('mysql_data.json', data);

        // 3. Zbuduj graf
        console.log('Building graph...');
        const graph = await buildGraph(data);

        // 4. Znajdź najkrótszą ścieżkę
        console.log('Finding shortest path...');
        const path = graph.findShortestPath('Rafał', 'Barbara');
        console.log('Path found:', path);

        // 5. Zapisz wynik
        const result = path.join(', ');
        await logToFile('path_result.json', { path: result });

        // 6. Wyślij raport
        console.log('Sending report...');
        const centrala = new CentralaHandler(__dirname);
        const response = await centrala.sendAndLog({
            task: "connections",
            apikey: process.env.PERSONAL_API_KEY,
            answer: result
        });

        console.log('Response:', response);

    } catch (error) {
        console.error('Error:', error);
        await logToFile('error.json', error);
        process.exit(1);
    }
}

main();