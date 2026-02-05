import feathersClient, { checkAuth } from '@/services/featherClient'

export interface AIFile {
  _id: string
  projectId: string
  path: string
  r2Key: string
  language: string
  size: number
  currentVersion: number
  createdAt: number
  updatedAt: number
}

export interface FileContent {
  content: string
  metadata?: {
    contentType: string
    size: number
    lastModified: string
  }
}

export const aiFilesService = {
  async find(query?: any): Promise<{ data: AIFile[]; total: number; limit: number; skip: number }> {
    await feathersClient.authenticate()
    return await feathersClient.service('ai-files').find({ query })
  },

  async get(id: string): Promise<AIFile> {
    await feathersClient.authenticate()
    return await feathersClient.service('ai-files').get(id)
  },

  async getByProjectId(projectId: string): Promise<AIFile[]> {
    await feathersClient.authenticate()
    const result = await feathersClient.service('ai-files').find({
      query: { projectId }
    })
    return result.data
  }
}

export const r2Service = {
  async getFile(key: string): Promise<FileContent> {
    await feathersClient.authenticate()
    return await feathersClient.service('r2').get(key)
  },

  async uploadFile(key: string, content: string, contentType: string): Promise<any> {
    await feathersClient.authenticate()
    return await feathersClient.service('r2').create({
      key,
      content,
      contentType
    })
  },

  async deleteFile(key: string): Promise<any> {
    await feathersClient.authenticate()
    return await feathersClient.service('r2').remove(key)
  },

  async listFiles(prefix: string): Promise<any> {
    await feathersClient.authenticate()
    return await feathersClient.service('r2').find({
      query: { prefix }
    })
  },

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<{ url: string }> {
    await feathersClient.authenticate()
    return await feathersClient.service('r2').presignedUrl({ key, expiresIn })
  }
}