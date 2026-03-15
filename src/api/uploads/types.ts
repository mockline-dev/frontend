export interface Upload {
    _id: string;
    uri: string;
    size: number;
    contentType: string;
    createdAt: number;
    updatedAt: number;
}

export interface UploadCreateData {
    uri?: string;
    key: string;
    content: string;
    contentType: string;
    projectId: string;
}

export type UploadUpdateData = Partial<UploadCreateData>;
export type UploadCompleteData = UploadCreateData;
