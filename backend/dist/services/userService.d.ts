export interface User {
    id: string;
    username: string;
    password: string;
}
export declare const userService: {
    findByUsername: (username: string) => Promise<User | null>;
    create: (username: string, hashedPassword: string) => Promise<User>;
    findById: (id: string) => Promise<User | null>;
};
//# sourceMappingURL=userService.d.ts.map