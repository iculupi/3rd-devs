import OpenAI from 'openai';
import dotenv from 'dotenv';
import { SystemPrompts } from '../../utils/prompts/systemPrompts';
import { LogManager } from '../../utils/helpers/logManager';
import { RobotHelper } from '../../utils/helpers/robotNavigator';
import type { RobotResponse, NavigationLog, StepInfo, Position } from '../../utils/types';
import * as path from 'path';
import * as fs from 'fs/promises';

dotenv.config();

class RobotNavigator {
    private readonly openai: OpenAI;
    private readonly API_URL = 'https://banan.ag3nts.org/';
    private readonly logManager: LogManager;
    private currentPosition: Position = { x: 0, y: 0 };
    private showVisualization: boolean;

    constructor(options: { showVisualization?: boolean } = {}) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.logManager = new LogManager(__dirname, 'navigation_logs.json');
        this.logManager.loadLogs();
        this.showVisualization = options.showVisualization || false;
    }

    private visualizePosition(): void {
        if (!this.showVisualization) return;

        const grid = Array(4).fill(0).map(() => Array(4).fill('·'));
        grid[this.currentPosition.y][this.currentPosition.x] = 'R';
        grid[3][3] = 'T'; // Target position

        console.log('\nCurrent position:');
        console.log('┌──────────────┐');
        grid.reverse().forEach(row => {
            console.log('│ ' + row.join(' ') + ' │');
        });
        console.log('└──────────────┘');
        console.log('R - Robot, T - Target, · - Empty space\n');
    }

    private async getNavigationSteps(mapDescription: string): Promise<RobotResponse> {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: SystemPrompts.ROBOT_NAVIGATOR
                },
                {
                    role: "user",
                    content: mapDescription
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const response = JSON.parse(completion.choices[0].message.content || '{}');
        return {
            steps: response.steps.split(', ')
        };
    }

    public async navigate(useAutonomousMode: boolean = false): Promise<void> {
        try {
            this.currentPosition = { x: 0, y: 0 };
            this.visualizePosition();

            const recentLogs = this.logManager.getRecentLogs();
            const previousAttempts = this.logManager.formatLogsForPrompt(recentLogs);
            const lastLog = recentLogs[recentLogs.length - 1];
            
            const mapDescription = useAutonomousMode ? 
                RobotHelper.getAutonomousDescription(previousAttempts, lastLog?.stepDetails) : 
                RobotHelper.getGuidedDescription(previousAttempts, lastLog?.stepDetails);

            console.log('🤖 Getting navigation steps...');
            const { steps, thoughts } = await this.getNavigationSteps(mapDescription);
            
            if (thoughts) {
                console.log('🤔 Robot thoughts:', thoughts);
            }

            console.log('📍 Navigation steps:', steps);
            
            // Track steps
            const stepDetails: StepInfo[] = [];
            for (const step of steps) {
                this.currentPosition = RobotHelper.calculateNewPosition(this.currentPosition, step);
                if (this.showVisualization) {
                    console.log(`\nExecuting step: ${step}`);
                    this.visualizePosition();
                }
                
                stepDetails.push({
                    step,
                    position: { ...this.currentPosition },
                    description: `${step} -> ${RobotHelper.getPositionDescription(this.currentPosition)}`
                });
            }

            const { success, response } = await RobotHelper.sendStepsToRobot(this.API_URL, steps);

            // Jeśli mamy odpowiedź, zapisz ją
            if (response) {
                await this.saveApiResponse(response);
            }

            await this.logManager.saveLog({
                timestamp: new Date().toISOString(),
                thoughts: thoughts || 'No thoughts provided',
                steps,
                stepDetails,
                success,
                finalPosition: this.currentPosition
            });

            if (!success) {
                console.log('❌ Navigation failed, will try different approach next time');
            } else {
                console.log('✅ Navigation completed successfully');
            }

        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    private async saveApiResponse(response: any): Promise<void> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const responsePath = path.join(
                __dirname, 
                'api_responses',
                `response_${timestamp}.json`
            );

            // Upewnij się, że folder api_responses istnieje
            await fs.mkdir(path.join(__dirname, 'api_responses'), { recursive: true });

            // Zapisz odpowiedź
            await fs.writeFile(
                responsePath,
                JSON.stringify({
                    timestamp,
                    response: response.data,
                    requestDetails: {
                        status: response.status,
                        headers: response.headers,
                        currentPosition: this.currentPosition
                    }
                }, null, 2)
            );
            console.log('💾 API Response saved to:', responsePath);
        } catch (error) {
            console.error('Error saving API response:', error);
        }
    }
}

// Zmodyfikuj wykonanie
if (require.main === module) {
    const navigator = new RobotNavigator({
        showVisualization: process.argv.includes('--visualize')
    });
    const useAutonomousMode = process.argv.includes('--autonomous');
    
    navigator.navigate(useAutonomousMode)
        .then(() => {
            // Nie wyświetlaj dodatkowego komunikatu
        })
        .catch(console.error);
}

export default RobotNavigator; 