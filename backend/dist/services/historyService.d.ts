export declare const historyService: {
    getAllByUser: (userId: string) => Promise<unknown[]>;
    create: (userId: string, content: string, type: "text" | "file", fileName?: string, mimeType?: string) => Promise<{} | null>;
    deleteById: (userId: string, id: string) => Promise<void>;
    setAsLatest: (userId: string, id: string) => Promise<{}>;
    getById: (id: string) => Promise<{} | null>;
};
//# sourceMappingURL=historyService.d.ts.map