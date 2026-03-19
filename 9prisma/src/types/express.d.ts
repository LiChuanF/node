import 'express';

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            name: string;
            iat?: number;
            exp?: number;
        }
    }
}
