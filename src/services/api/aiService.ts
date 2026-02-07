import feathersClient from '@/services/featherClient'

export interface AIServiceRequest {
  projectId: string
  prompt: string
  context?: string
  temperature?: number
  maxTokens?: number
  generateFiles?: boolean
}

export interface AIServiceResponse {
  success: boolean
  response: string
  generatedFiles?: GeneratedFile[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export interface GeneratedFile {
  filename: string
  originalFilename?: string
  content: string
  type: string
  fileId?: string
  fileUrl?: string
  size?: number
  uploadSuccess?: boolean
  uploadTime?: string
  error?: string
}

export interface AIServiceInfo {
  service: string
  status: string
  model?: {
    name: string
    size: number
    modifiedAt: string
  }
  capabilities?: string[]
  supportedFeatures?: string[]
  maxTokens?: number
  defaultTemperature?: number
  maxFileSize?: number
  error?: string
}

export const aiService = {
  async create(data: AIServiceRequest): Promise<AIServiceResponse> {
    await feathersClient.authenticate()
    return await feathersClient.service('ai-service').create(data)
  },

  async find(): Promise<AIServiceInfo> {
    await feathersClient.authenticate()
    return await feathersClient.service('ai-service').find()
  }
}
