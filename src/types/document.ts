export interface Document {
    id: string;
    name: string;
    content: string;
    isModified: boolean;
    isManuallyNamed: boolean;
    source: 'local' | 'github';
    githubInfo?: GitHubFileInfo;
    cursor: CursorPosition;
    scroll: ScrollPosition;
    createdAt: Date;
    updatedAt: Date;
}

export interface GitHubFileInfo {
    owner: string;
    repo: string;
    path: string;
    sha: string;
    branch: string;
}

export interface CursorPosition {
    line: number;
    column: number;
}

export interface ScrollPosition {
    line: number;
    percentage: number;
}

export interface Version {
    id: string;
    documentId: string;
    content: string;
    label?: string;
    createdAt: Date;
}

export interface DocumentStats {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    lines: number;
    readingTime: number;
}
