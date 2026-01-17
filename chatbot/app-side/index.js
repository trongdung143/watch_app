import { BaseSideService } from "@zeppos/zml/base-side";

let serverUrl = "http://192.168.1.100:8080" // https://watch-app-lyj2.onrender.com 
let googleApiKey = ""
let modelName = "gemini-2.5-flash-lite"
let elevenlabsApiKey = ""
let listenerValuesAdded = false

async function pingServer(res) {
    try {
        const response = await fetch({
            url: `${serverUrl}/health`,
            method: "GET",
        })

        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body

        res(null, {
            type: "PING",
            running: true,
            serverName: serverUrl,
        })

    } catch (error) {
        res(null, {
            type: "PING",
            running: false,
            result: "TIMEOUT_OR_ERROR_PING",
            serverName: serverUrl,
        })
    }
}

async function chatAI(res, data) {
    try {
        if (!googleApiKey || !modelName) {
            return res(null, { type: "CHAT", result: "NONE_02" })
        }

        if (data.audio && !elevenlabsApiKey) {
            return res(null, { type: "CHAT", result: "NONE_03" })
        }
        data.google_api_key = googleApiKey || ""
        data.model_name = modelName || ""
        data.elevenlabs_api_key = elevenlabsApiKey || ""
        const response = await fetch({
            url: `${serverUrl}/chat`,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })

        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body

        if (resBody.answer === "NONE")
            resBody.answer = "NONE_01"

        res(null, {
            type: "CHAT",
            result: resBody.answer,
            audio: resBody.audio,
        })

    } catch (error) {
        res(null, {
            type: "CHAT",
            result: "NONE_01",
        })
    }
}


function downTTS(res, data) {
    try {
        const task = network.downloader.downloadFile({
            url: `${serverUrl}/tts?uuid=${data.uuid}`,
            timeout: 60000,
            filePath: `data://audio/${data.uuid}.mp3`,
        })

        task.onSuccess = (event) => {
            res(null, {
                type: "DOWN.TTS",
                isDownSucc: true,
                path: event.filePath,
            })
        }

        task.onFail = (event) => {

            res(null, {
                type: "DOWN.TTS",
                isDownSucc: false,
            })
        }
    } catch (error) {
        res(null, {
            type: "DOWN.TTS",
            isDownSucc: false,
        })
    }
}

async function transTTS(res, data) {
    try {
        const outbox = transferFile.getOutbox()
        const fileObject = outbox.enqueueFile(`data://download/audio/${data.uuid}.mp3`, { type: "audio", name: `${data.uuid}.mp3` })

        fileObject.on("progress", (event) => {

        })

        fileObject.on("change", (event) => {
            if (event.data.readyState === "transferred")
                res(null, {
                    type: "TRANS.TTS",
                    isTransSucc: true,
                })
            else if (event.data.readyState === "error")
                res(null, {
                    type: "TRANS.TTS",
                    isTransSucc: false,
                })

        })

    } catch (error) {
        res(null, {
            type: "TRANS.TTS",
            isTransSucc: false,
        })
    }
}

async function clearMessages() {
    try {
        const response = await fetch({
            url: `${serverUrl}/clear-messages`,
            method: "GET",
        })


    } catch (error) {

    }
    finally {
        settings.settingsStorage.setItem("clear", "0")
    }
}

function updateValues() {
    if (!googleApiKey)
        googleApiKey = settings.settingsStorage.getItem("googleApiKey") || ""

    if (!modelName)
        modelName = settings.settingsStorage.getItem("modelName") || ""

    if (!elevenlabsApiKey)
        elevenlabsApiKey = settings.settingsStorage.getItem("elevenlabsApiKey") || ""

    if (!serverUrl)
        serverUrl = settings.settingsStorage.getItem("serverUrl") || ""

    if (!listenerValuesAdded) {
        settings.settingsStorage.addListener("change", ({ key, newValue, oldValue }) => {
            switch (key) {
                case "googleApiKey":
                    googleApiKey = newValue || oldValue
                    break

                case "modelName":
                    modelName = newValue || oldValue
                    break

                case "elevenlabsApiKey":
                    elevenlabsApiKey = newValue || oldValue
                    break

                case "serverUrl":
                    serverUrl = newValue || oldValue
                    break

                case "clear":
                    if (newValue === "1")
                        clearMessages()
                    break

                default:
                    break
            }

        })
        listenerValuesAdded = true
    }
}

AppSideService(
    BaseSideService({

        onInit() {
            updateValues()
        },

        onRequest(req, res) {
            switch (req.method) {
                case "CHAT":
                    chatAI(res, req.data)
                    break

                case "PING":
                    pingServer(res)
                    break

                case "DOWN.TTS":
                    downTTS(res, req.data)
                    break

                case "TRANS.TTS":
                    transTTS(res, req.data)
                    break

                default:
                    break;
            }

        },
    })
)