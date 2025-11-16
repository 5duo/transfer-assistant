export declare const clipboardService: {
    create: (userId: string, content: string, type: "text" | "file", fileName?: string, mimeType?: string) => Promise<{} | null>;
    getLatestByUser: (userId: string) => Promise<{} | null>;
    createGuest: (content: string, type: "text" | "file", fileName?: string, mimeType?: string) => Promise<{} | null>;
    getLatestGuest: () => Promise<{} | null>;
    getById: (id: string) => Promise<{} | null>;
    fixFileNameEncoding: (originalName: string) => string;
    createFile: (userId: string, file: Express.Multer.File) => Promise<{} | null>;
    createGuestFile: (file: Express.Multer.File) => Promise<{} | null>;
};
//# sourceMappingURL=clipboardService.d.ts.map