import Toast from 'react-native-toast-message'

export function toastSucesso(mensagem: string, titulo = 'Sucesso') {
    Toast.show({
        type: 'success',
        text1: titulo,
        text2: mensagem,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
    })
}

export function toastErro(mensagem: string, titulo = 'Erro') {
    Toast.show({
        type: 'error',
        text1: titulo,
        text2: mensagem,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
    })
}

export function toastInfo(mensagem: string, titulo = 'Atenção') {
    Toast.show({
        type: 'info',
        text1: titulo,
        text2: mensagem,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
    })
}