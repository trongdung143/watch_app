import { BaseSideService } from "@zeppos/zml/base-side";

let url = "http://192.168.1.100:8080" // http://192.168.1.100:8080

async function fetchData(res, data) {
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
            type: "CHAT_RESPONSE",
            result: resBody.answer || resBody.error,
        })
    } catch (error) {
        res(null, {
            type: "CHAT_RESPONSE",
            result: "TIMEOUT_OR_ERROR_CHAT",
        })
    }
}

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
            type: "PING_RESPONSE",
            running: true,
        })
    } catch (error) {
        res(null, {
            type: "PING_RESPONSE",
            running: false,
            result: "TIMEOUT_OR_ERROR_PING",
        })
    }
}

async function textToSpeech(res, data) {
    try {
        const response = await fetch({
            url: `${url}/tts`,
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

        if (resBody.status === "READY") {
            console.log("TTS ready, downloading audio...")
            try {
                downloadFile({
                    url: `${url}/tts`,
                    headers: {},
                    timeout: 60000,
                    filePath: 'data://download/tts.mp3'
                })

                res(null, {
                    type: "TTS_RESPONSE",
                    result: "DONE_TTS",
                })
            }
            catch (error) {
                res(null, {
                    type: "TTS_RESPONSE",
                    result: "ERROR_TTS",
                })
            }
        }
        else {
            res(null, {
                type: "TTS_RESPONSE",
                result: "ERROR_TTS",
            })
        }

    } catch (error) {
        res(null, {
            type: "TTS_RESPONSE",
            result: "TIMEOUT_OR_ERROR_TTS",
        })
    }
}



AppSideService(
    BaseSideService({
        onRequest(req, res) {
            console.log("Received request:", JSON.stringify(req))
            if (req.method === "CHAT") {
                fetchData(res, req.data)
            }
            else if (req.method === "PING") {
                pingServer(res)

            }
            else if (req.method === "TTS") {
                textToSpeech(res, req.data)
            }
        },
    })
)