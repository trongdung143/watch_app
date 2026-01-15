import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { create, id } from '@zos/media'
import {
  CHAT_BUTTON,
  AUDIO_BUTTON,
  RESULT_TEXT,
} from "zosLoader:./index.[pf].layout.js";

let textWidget;
let btnChatWidget;
let btnAudioWidget;
let wordTimer = null
let isTyping = false

const player = create(id.PLAYER)

Page(
  BasePage({
    state: {
      // isDownload: false,
      // isTransfer: false,
      // filePath: "",
      // fileName: "",
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
          this.destroyKeyboard()
          onDone("")
        },
        text: ''
      })
    },

    async pingServer() {
      try {
        const data = await this.request({ method: "PING" })

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
          data: { message: msg, audio: this.state.isTTS },
        })
        if (data.result === "NONE") {
          textWidget.setProperty(hmUI.prop.TEXT, "out of tokens")
          return
        }
        //showWords(data.result, textWidget, 180)
        textWidget.setProperty(hmUI.prop.TEXT, data.result)
        if (this.state.isTTS && await this.downTTS() && await this.transTTS()) {
          player.setSource(player.source.FILE, { file: 'data://download/tts.mp3' })
          player.prepare()
        }
      } catch (error) {
        return false
      }
    },

    // destroy keyboard
    destroyKeyboard() {
      hmUI.deleteKeyboard()
    },

    async build() {
      if (!btnChatWidget)
        btnChatWidget = hmUI.createWidget(hmUI.widget.BUTTON, CHAT_BUTTON);
      if (!textWidget)
        textWidget = hmUI.createWidget(hmUI.widget.TEXT, RESULT_TEXT)
      if (!btnAudioWidget)
        btnAudioWidget = hmUI.createWidget(hmUI.widget.BUTTON, AUDIO_BUTTON);

      btnAudioWidget.addEventListener(hmUI.event.CLICK_UP, async () => {
        if (this.state.isTTS)
          this.state.isTTS = false
        else
          this.state.isTTS = true
      })

      btnChatWidget.addEventListener(hmUI.event.CLICK_UP, async () => {
        //this.stopShowWords(textWidget)
        textWidget.setProperty(hmUI.prop.TEXT, "")
        player.stop()
        if (await this.pingServer()) {
          this.createKeyboard(async (message) => {
            if (message)
              await this.chatAI(message)
          })
        }
      })
    },
  })
);


