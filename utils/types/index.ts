export interface TestItem {
    question: string;
    answer?: number | string;
    test?: {
        q: string;
        a: string;
    };
}

export interface TaskSubmission {
    task: string;
    apikey: string;
    answer: JsonData;
}

export interface JsonData {
    apikey: string;
    description: string;
    copyright: string;
    'test-data': TestItem[];
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
} 