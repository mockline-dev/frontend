'use server'

import { appRoutes } from '@/config/appRoutes'
import { UserData } from '@/containers/auth/types'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface SignInRes {
  error?: string
}

const SAVED_PROMPT_KEY = 'savedPrompt'

export async function signIn(data: UserData): Promise<SignInRes> {
  const { feathersId, firstName, lastName, jwt, userMeta } = data

  if (!feathersId || !jwt) {
    return { error: 'Invalid sign in data' }
  }

  const cookiesStore = await cookies()

  cookiesStore.set('jwt', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  })

  cookiesStore.set(
    'currentUser',
    JSON.stringify({
      feathersId,
      firstName,
      lastName,
      userMeta,
      jwt
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    }
  )

  // Check if there's a saved prompt in localStorage (via a cookie)
  // Note: We can't access localStorage in server actions, but we can check a cookie
  // that was set when the prompt was saved
  const savedPromptCookie = cookiesStore.get(SAVED_PROMPT_KEY)

  // Redirect to home if there's a saved prompt, otherwise go to dashboard
  if (savedPromptCookie) {
    // Clear the cookie
    cookiesStore.delete(SAVED_PROMPT_KEY)
    redirect(appRoutes.home.root)
  }

  redirect(appRoutes.home.dashboard)
}
