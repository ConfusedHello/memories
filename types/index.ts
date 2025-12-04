export type ImageItem = {
    src: string;
    alt: string;
    author?: string;
    key?: string;
    size?: number;
    originSrc?: string;
};

export interface UploadResult {
    success: boolean;
    error?: string;
}
