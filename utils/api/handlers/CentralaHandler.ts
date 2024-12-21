import * as fs from 'fs/promises';
import * as path from 'path';
import { API_ENDPOINTS } from '../../core/constants';
import axios from 'axios';

interface CentralaResponse {
    timestamp: string;
    type: 'response';
    data: any;
}

interface CentralaRequest {
    timestamp: string;
    type: 'request';
    data: any;
}

export class CentralaHandler {
    private readonly taskDir: string;
    private readonly logsDir: string;

    constructor(taskDir: string) {
        this.taskDir = taskDir;
        this.logsDir = path.join(taskDir, 'logs');
    }

    private async ensureDirectories(): Promise<void> {
        await fs.mkdir(this.logsDir, { recursive: true });
    }

    async sendAndLog(requestData: any): Promise<any> {
        await this.ensureDirectories();

        // Prepare request
        const request: CentralaRequest = {
            timestamp: new Date().toISOString(),
            type: 'request',
            data: requestData
        };

        // Log request
        await fs.writeFile(
            path.join(this.logsDir, 'solution_request.json'),
            JSON.stringify(request, null, 2)
        );

        // Send request
        const response = await fetch(
            `${API_ENDPOINTS.REPORT}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            }
        );

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (error) {
            console.error('Failed to parse response:', error);
            throw error;
        }

        // Log response
        const responseLog: CentralaResponse = {
            timestamp: new Date().toISOString(),
            type: 'response',
            data: result
        };

        await fs.writeFile(
            path.join(this.logsDir, 'solution_response.json'),
            JSON.stringify(responseLog, null, 2)
        );

        return result;
    }

    // Nowa metoda do raportowania wyników
    async report(taskId: string, answer: any): Promise<any> {
        const requestData = {
            task: taskId,
            apikey: process.env.PERSONAL_API_KEY,
            answer
        };

        return this.sendAndLog(requestData);
    }

    async getData(fileName: string): Promise<any> {
        const url = `${API_ENDPOINTS.DATA}/${process.env.PERSONAL_API_KEY}/${fileName}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting data:", error);
            throw error;
        }
    }
} 