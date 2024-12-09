export interface Test {
    id?: string;
    q?: string;
    a?: string;
    calculation?: string;
    expected?: number;
}

export interface JsonData {
    tests: Test[];
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
} 