import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { create, id } from '@zos/media'
import {
  CHAT_BUTTON,
  AUDIO_BUTTON,
  RESULT_TEXT,
  AI_IMG
} from "zosLoader:./index.[pf].layout.js";
import { splitWords, isPunctuation } from "./utils";
import { DEVICE_UUID } from "../utils/config/device";

let textWidget;
let btnChatWidget;
let btnAudioWidget;
let wordTimer;
let imgWidget;
const player = create(id.PLAYER)

Page(
  BasePage({
    state: {
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
          data: { uuid: DEVICE_UUID }
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
          data: { uuid: DEVICE_UUID }
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
        imgWidget = hmUI.createWidget(hmUI.widget.IMG, AI_IMG)
        const data = await this.request({
          method: "CHAT",
          data:
          {
            uuid: DEVICE_UUID,
            message: msg,
            audio: this.state.isTTS,
          },
        })
        switch (data.result) {
          case "NONE_01":
            textWidget.setProperty(hmUI.prop.TEXT, "Out of tokens")
            return

          case "NONE_02":
            textWidget.setProperty(hmUI.prop.TEXT, "Missing LLM API key or model name")
            return

          case "NONE_03":
            textWidget.setProperty(hmUI.prop.TEXT, "Missing TTS API key")
            return
        }

        this.startWordAnimation(data)
        if (this.state.isTTS && await this.downTTS() && await this.transTTS()) {
          player.setSource(player.source.FILE, { file: `data://download/${DEVICE_UUID}.mp3` })
          player.prepare()
        }

      } catch (error) {
        return false
      } finally {
        this.state.isBusy = false
        if (imgWidget) {
          hmUI.deleteWidget(imgWidget)
          imgWidget = null
        }
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
          console.log("chat")
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
          console.log("audio")
          if (this.state.isTTS) {
            this.state.isTTS = false
            btnAudioWidget.setProperty(hmUI.prop.TEXT, {
              text: "OFF",
            })
          }
          else {
            this.state.isTTS = true
            btnAudioWidget.setProperty(hmUI.prop.TEXT, {
              text: "ON"
            })
          }
        })
      }


    },

    onDestroy() {

    },
  })
);


