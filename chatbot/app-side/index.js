import { BaseSideService } from "@zeppos/zml/base-side";

let url = "https://watch-app-lyj2.onrender.com" // http://192.168.1.100:8080

function fetchWithTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT")), ms)
        ),
    ])
}

async function pingServer(res) {
    try {
        const response = await fetchWithTimeout(
            fetch({
                url: `${url}/health`,
                method: 'GET',
            }),
            2000
        )

        const resBody =
            typeof response.body === 'string'
                ? JSON.parse(response.body)
                : response.body

        res(null, {
            type: "PING",
            running: true,
        })
    } catch (error) {
        res(null, {
            type: "PING",
            running: false,
            result: "TIMEOUT_OR_ERROR_PING",
        })
    }
}

async function chatAI(res, data) {
    try {
        const response = await fetch({
            url: `${url}/chat`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })

        const resBody =
            typeof response.body === 'string'
                ? JSON.parse(response.body)
                : response.body


        res(null, {
            type: "CHAT",
            result: resBody.answer || "NONE",
            audio: resBody.audio || "NONE",
        })
    } catch (error) {
        res(null, {
            type: "CHAT",
            result: "TIMEOUT_OR_ERROR_CHAT",
        })
    }
}


function downTTS(res) {
    try {
        const task = network.downloader.downloadFile({
            url: `${url}/tts`,
            timeout: 60000,
            filePath: 'data://audio/tts.mp3',
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

async function transTTS(res) {
    try {
        const outbox = transferFile.getOutbox()
        const fileObject = outbox.enqueueFile('data://download/audio/tts.mp3', { type: "audio", name: "tts.mp3" })

        fileObject.on('progress', (event) => {

        })

        fileObject.on('change', (event) => {
            if (event.data.readyState === 'transferred')
                res(null, {
                    type: "TRANS.TTS",
                    isTransSucc: true,
                })
            else if (event.data.readyState === 'error')
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

AppSideService(
    BaseSideService({
        onRequest(req, res) {
            switch (req.method) {
                case "CHAT":
                    chatAI(res, req.data)
                    break

                case "PING":
                    pingServer(res)
                    break

                case "DOWN.TTS":
                    downTTS(res)
                    break

                case "TRANS.TTS":
                    transTTS(res)
                    break

                default:
                    break;
            }

        },
    })
)