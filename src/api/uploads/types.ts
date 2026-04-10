export interface Upload {
    _id: string;
    uri: string;
    contentType: string;
    uploadId: string;
}

export interface UploadCreateData {
    key: string;
    contentType: string;
}

export interface UploadUpdateData {
    partNumber: number;
    uploadId: string;
    key: string;
    content: Buffer;
}

export interface UploadPartResponse {
    ETag: string;
}

export interface UploadCompleteData {
    uploadId: string;
    key: string;
    parts: {
        ETag: string;
        PartNumber: number;
    }[];
}
