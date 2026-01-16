import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { create, id } from '@zos/media'
import {
  CHAT_BUTTON,
  AUDIO_BUTTON,
  RESULT_TEXT,
} from "zosLoader:./index.[pf].layout.js";
import { splitWords, isPunctuation } from "./utils";

let textWidget;
let btnChatWidget;
let btnAudioWidget;
let wordTimer;
const player = create(id.PLAYER)

Page(
  BasePage({
    state: {
      // isDownload: false,
      // isTransfer: false,
      // filePath: "",
      // fileName: "",
      isBusy: false,
      answer: "",
      answerWords: null,
      isTTS: true,
    },
    onInit() {
      player.addEventListener(player.event.PREPARE, function (result) {
        if (result) {
          player.start()
        } else {
        }
      })

      player.addEventListener(player.event.COMPLETE, function (result) {
        player.stop()
      })

    },

    // keyboard event handlers
    // create keyboard
    createKeyboard(onDone) {
      hmUI.createKeyboard({
        inputType: hmUI.inputType.CHAR,
        onComplete: (_, result) => {
          this.destroyKeyboard()
          onDone(result.data || "")
        },
        onCancel: (_, result) => {
          this.state.isBusy = false
          this.destroyKeyboard()
          onDone("")
        },
        text: ''
      })
    },

    startWordAnimation(data) {
      this.state.answerWords = splitWords(data.result)
      this.state.answer = ""
      if (wordTimer) {
        clearInterval(wordTimer)
        wordTimer = null
      }
      wordTimer = setInterval(() => {
        if (this.state.answerWords.length === 0) {
          clearInterval(wordTimer)
          this.state.answer = this.state.answer.trimEnd()
          textWidget.setProperty(hmUI.prop.TEXT, this.state.answer)
          wordTimer = null
          return
        }

        const word = this.state.answerWords.shift()
        if (isPunctuation(word))
          this.state.answer = this.state.answer.trimEnd()
        this.state.answer += word + " "

        textWidget.setProperty(hmUI.prop.TEXT, this.state.answer)
      }, 50)
    },


    async pingServer() {
      try {
        const data = await this.request({ method: "PING" })
        // console.log(JSON.stringify(data))
        if (data.running)
          return true

        textWidget.setProperty(hmUI.prop.TEXT, data.result)
        return false
      } catch (error) {
        return false
      }
    },


    async downTTS() {
      try {
        const data = await this.request({
          method: "DOWN.TTS",
        })
        if (data.isDownSucc)
          return true
        return false
      } catch (error) {
        return false
      }
    },

    async transTTS() {
      try {
        const data = await this.request({
          method: "TRANS.TTS",
        })
        // console.log(JSON.stringify(data))
        if (data.isTransSucc)
          return true
        return false
      } catch (error) {
        return false
      }
    },

    async chatAI(msg) {
      try {
        const data = await this.request({
          method: "CHAT",
          data:
          {
            message: msg,
            audio: this.state.isTTS,
            model: "",
            google_api: "",
            elevenlabs_api: ""
          },
        })
        if (data.result === "NONE") {
          textWidget.setProperty(hmUI.prop.TEXT, "out of tokens")
          return
        }

        //textWidget.setProperty(hmUI.prop.TEXT, data.result)
        this.startWordAnimation(data)
        if (this.state.isTTS && await this.downTTS() && await this.transTTS()) {
          player.setSource(player.source.FILE, { file: 'data://download/tts.mp3' })
          player.prepare()
        }

      } catch (error) {
        return false
      } finally {
        this.state.isBusy = false
      }
    },

    // destroy keyboard
    destroyKeyboard() {
      hmUI.deleteKeyboard()
    },

    async build() {
      if (!btnChatWidget) {
        btnChatWidget = hmUI.createWidget(hmUI.widget.BUTTON, CHAT_BUTTON)
        btnChatWidget.addEventListener(hmUI.event.CLICK_DOWN, async () => {
          if (!this.state.isBusy) {
            this.state.isBusy = true
            if (wordTimer) {
              clearInterval(wordTimer)
              wordTimer = null
            }
            player.stop()
            textWidget.setProperty(hmUI.prop.TEXT, "")
            this.state.answer = ""
            if (await this.pingServer()) {
              this.createKeyboard(async (message) => {
                if (message)
                  await this.chatAI(message)
                else
                  this.state.isBusy = false
              })
            }
            else
              this.state.isBusy = false
          }
        })
      }
      if (!textWidget)
        textWidget = hmUI.createWidget(hmUI.widget.TEXT, RESULT_TEXT)
      if (!btnAudioWidget) {
        btnAudioWidget = hmUI.createWidget(hmUI.widget.BUTTON, AUDIO_BUTTON)

        btnAudioWidget.addEventListener(hmUI.event.CLICK_DOWN, () => {
          if (this.state.isTTS)
            this.state.isTTS = false
          else
            this.state.isTTS = true
        })
      }


    },

    onDestroy() {
      if (wordTimer) {
        clearInterval(wordTimer)
        wordTimer = null
      }
      player.stop()
      this.deleteKeyboard()
    },
  })
);


