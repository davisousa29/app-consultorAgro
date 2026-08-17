import { useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import Constants from 'expo-constants'

WebBrowser.maybeCompleteAuthSession()

const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string
const iosClientId = Constants.expoConfig?.extra?.googleIosClientId as string

export function useGoogleAuth(onToken: (accessToken: string) => void) {
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId,
        iosClientId,
    })

    useEffect(() => {
        if (response?.type === 'success') {
            const accessToken = response.authentication?.accessToken
            if (accessToken) {
                onToken(accessToken)
            }
        }
    }, [response])

    return {
        pronto: !!request,
        login: () => promptAsync(),
    }
}