'use server'

import authentication from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import rest, { RestService } from '@feathersjs/rest-client'
import { cookies } from 'next/headers'

export const createFeathersServerClient = async () => {
  type ServiceTypes = {
    users: RestService
    'ai-projects': RestService
    'ai-files': RestService
    'ai-file-versions': RestService
    'ai-models': RestService
    conversations: RestService
    messages: RestService
    projects: RestService
    files: RestService
    'file-stream': RestService
    'ai-service': RestService
    endpoints: RestService
  }

  const app = feathers<ServiceTypes>()
  const restClient = rest(process.env.NEXT_PUBLIC_SOCKET_URL).fetch(fetch)
  const jwt = (await cookies()).get('jwt')?.value

  app.configure(restClient)

  app.configure(
    authentication({
      storage: {
        async getItem() {
          return jwt || null
        },
        async setItem() {},
        async removeItem() {}
      }
    })
  )

  if (jwt) {
    try {
      await app.authenticate({
        strategy: 'jwt',
        accessToken: jwt
      })
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return app
}

// Export a function to create a new authenticated instance for each request
// This ensures proper authentication for each user's request
export const feathersServer = async () => {
  // Always create a new instance to ensure proper authentication
  // with the current user's JWT token
  return await createFeathersServerClient()
}
