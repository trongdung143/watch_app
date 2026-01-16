export function splitWords(text) {
    if (typeof text !== "string")
        return []

    return text
        .trim()
        .match(/[A-Za-zÀ-ỹ0-9]+|\.{3}|[.,!?…:;]/g) || []
}


export function isPunctuation(word) {
    return /^[.,!?…]$/.test(word)
}

