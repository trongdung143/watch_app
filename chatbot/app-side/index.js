import { BaseSideService } from "@zeppos/zml/base-side";

let serverUrl = "" // server URL
let googleApiKey = ""
let modelName = "gemini-2.5-flash-lite"
let elevenlabsApiKey = ""
let listenerValuesAdded = false

async function pingServer(res) {
    try {
        const response = await fetch({
            url: `${serverUrl}/health`,
            method: "GET",
            timeout: 5000,
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
            timeout: 20000,
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

async function clearMessages(res, data) {
    try {
        const response = await fetch({
            url: `${serverUrl}/clear-messages?uuid=${data.uuid}`,
            method: "GET",
        })

        res(null, {
            type: "CLEAR.MESSAGES",
            result: "Clear messages",
        })
    } catch (error) {
        res(null, {
            type: "CLEAR.MESSAGES",
            result: false,
        })
    }
}

function updateValues() {

    googleApiKey = settings.settingsStorage.getItem("googleApiKey") || googleApiKey

    modelName = settings.settingsStorage.getItem("modelName") || modelName

    elevenlabsApiKey = settings.settingsStorage.getItem("elevenlabsApiKey") || elevenlabsApiKey

    serverUrl = settings.settingsStorage.getItem("serverUrl") || serverUrl

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
                    //return 
                    chatAI(res, req.data)
                    break

                case "PING":
                    // return 
                    pingServer(res)
                    break

                case "DOWN.TTS":
                    // return 
                    downTTS(res, req.data)
                    break

                case "TRANS.TTS":
                    //return 
                    transTTS(res, req.data)
                    break

                case "CLEAR.MESSAGES":
                    clearMessages(res, req.data)
                    break

                default:
                    break;
            }

        },
    })
)