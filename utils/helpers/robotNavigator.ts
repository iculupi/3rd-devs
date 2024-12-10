import axios from 'axios';
import type { RobotResponse, Position, StepInfo } from '../types';

export class RobotHelper {
    static calculateNewPosition(currentPosition: Position, step: string): Position {
        const { x, y } = currentPosition;
        switch (step) {
            case 'UP': return { x, y: y + 1 };
            case 'DOWN': return { x, y: y - 1 };
            case 'LEFT': return { x: x - 1, y };
            case 'RIGHT': return { x: x + 1, y };
            default: return { x, y };
        }
    }

    static getPositionDescription(position: Position): string {
        return `(${position.x},${position.y})`;
    }

    static trackSteps(steps: string[]): StepInfo[] {
        let currentPosition: Position = { x: 0, y: 0 };
        const stepDetails: StepInfo[] = [];

        steps.forEach((step, index) => {
            const newPosition = this.calculateNewPosition(currentPosition, step);
            stepDetails.push({
                step,
                position: newPosition,
                description: `Step ${index + 1}: ${step} -> ${this.getPositionDescription(newPosition)}`
            });
            currentPosition = newPosition;
        });

        return stepDetails;
    }

    static formatStepDetails(stepDetails: StepInfo[]): string {
        return stepDetails.map(detail => detail.description).join('\n');
    }

    static async sendStepsToRobot(url: string, steps: string[]): Promise<{success: boolean, response?: any}> {
        try {
            const response = await axios.post(url, { steps });
            console.log('Server response:', {
                data: response.data,
                status: response.status,
                headers: response.headers
            });
            return {
                success: response.data.success === true,
                response
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Robot navigation error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                return {
                    success: false,
                    response: error.response
                };
            } else {
                console.error('Unexpected error:', error);
                return {
                    success: false
                };
            }
        }
    }

    static getGuidedDescription(previousAttempts: string = '', previousSteps?: StepInfo[]): string {
        const base = `You are a robot in a warehouse. You need to reach the computer with factory data.
        You can only use these commands: UP, DOWN, LEFT, RIGHT.
        The path to the computer is: go right twice, then up three times, then right once more.
        Your previous attempts have failed, so try to find a different approach.
        Consider walls and obstacles that might have blocked your path.
        Return ONLY the steps array in JSON format.`;

        let description = base;
        if (previousSteps?.length) {
            description += `\n\nYour last attempt failed at position ${this.getPositionDescription(previousSteps[previousSteps.length - 1].position)}`;
            description += `\n\nStep by step details:\n${this.formatStepDetails(previousSteps)}`;
        }
        if (previousAttempts) {
            description += `\n\nPrevious attempts and outcomes:\n${previousAttempts}`;
        }

        return description;
    }

    static getAutonomousDescription(previousAttempts: string = '', previousSteps?: StepInfo[]): string {
        const base = `You are an autonomous robot in a warehouse. Your goal is to reach the computer with factory data.
        The warehouse layout:
        - You start at position (0,0) in the bottom-left corner
        - The computer is at position (3,3)
        - You can only move using: UP, DOWN, LEFT, RIGHT commands
        - The warehouse is a 4x4 grid
        - There are no obstacles
        Consider previous attempts and their outcomes to improve your path.
        Plan your path and return the steps in JSON format.`;

        let description = base;
        if (previousSteps?.length) {
            description += `\n\nLast attempt step by step:\n${this.formatStepDetails(previousSteps)}`;
        }
        if (previousAttempts) {
            description += `\n\nPrevious attempts:\n${previousAttempts}`;
        }

        return description;
    }
} 