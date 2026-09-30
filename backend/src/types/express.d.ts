declare global {
    namespace Express {
        interface Request {
            identity?: {
                id: number;
                userId: string;
                firstname: string;
                lastname: string;
                role: "voter" | "admin";
                status: "active" | "disabled";
            };
        }
    }
}

export {};