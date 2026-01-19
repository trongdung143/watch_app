import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";
import { create, id } from "@zos/media"
import {
  CHAT_BUTTON,
  AUDIO_BUTTON,
  RESULT_TEXT,
  AI_IMG,
  CLEAR_BUTTON,
  RESULT_VIEW_CONTAINER,
  LINE_HEIGHT,
  LOG_TEXT,
  BUTTONS_VIEW_CONTAINER
} from "zosLoader:./index.[pf].layout.js";
import { splitWords, isPunctuation } from "./utils";
import { DEVICE_UUID } from "../utils/config/device";
import { setPageBrightTime, resetPageBrightTime } from "@zos/display"
import { createModal, MODAL_CONFIRM } from "@zos/interaction"

let textResult;
let textLog;
let viewContainerResult;
let btnChat;
let btnAudio;
let btnClearMessages;
let dialogClearMessages;
let wordTimer;
let imgWidget;
let viewContainerBtn;
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
      setPageBrightTime({
        brightTime: 60000,
      })

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
        text: ""
      })
    },

    startWordAnimation(data, onDone) {
      if (!textResult)
        textResult = hmUI.createWidget(hmUI.widget.TEXT, RESULT_TEXT)
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
          textResult.text = this.state.answer
          wordTimer = null
          if (typeof onDone === "function") {
            onDone()
          }
          return
        }

        const word = this.state.answerWords.shift()
        if (isPunctuation(word))
          this.state.answer = this.state.answer.trimEnd()
        this.state.answer += word + " "

        const { width, height } = hmUI.getTextLayout(this.state.answer, {
          text_size: RESULT_TEXT.text_size,
          text_width: RESULT_TEXT.w,
          wrapped: 1
        })
        if (height > RESULT_TEXT.h) {
          textResult.h = height
          textResult.y = RESULT_TEXT.y - LINE_HEIGHT * Math.floor((height - RESULT_TEXT.h) / LINE_HEIGHT)
        }
        textResult.text = this.state.answer
      }, 50)
    },


    async pingServer() {
      try {
        const data = await this.request({ method: "PING" })
        console.log(JSON.stringify(data))
        if (data.running)
          return true

        textResult.text = data.result

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

    async clearMessages() {
      try {
        if (viewContainerResult) {
          hmUI.deleteWidget(viewContainerResult)
          viewContainerResult = null
        }
        const data = await this.request({
          method: "CLEAR.MESSAGES",
          data: { uuid: DEVICE_UUID }
        })

        this.textLogShow(data.result)
      } catch (error) {

      }
    },

    answerCompleted() {
      this.state.isBusy = false

      if (textResult) {
        hmUI.deleteWidget(textResult)
        textResult = null
      }

      if (!viewContainerResult)
        viewContainerResult = hmUI.createWidget(
          hmUI.widget.VIEW_CONTAINER,
          RESULT_VIEW_CONTAINER
        )

      const { height } = hmUI.getTextLayout(this.state.answer, {
        text_size: RESULT_TEXT.text_size,
        text_width: RESULT_TEXT.w,
        wrapped: 1
      })

      viewContainerResult.createWidget(hmUI.widget.TEXT, {
        ...RESULT_TEXT,
        text: this.state.answer,
        h: height,
      })
    },

    textLogShow(log) {
      if (!textLog)
        textLog = hmUI.createWidget(hmUI.widget.TEXT, LOG_TEXT)
      textLog.text = log
    },

    textLogHide() {
      if (textLog) {
        hmUI.deleteWidget(textLog)
        textLog = null
      }
    },

    async chatAI(msg) {
      try {
        if (viewContainerResult) {
          hmUI.deleteWidget(viewContainerResult)
          viewContainerResult = null
        }
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
            this.textLogShow("Out of tokens")
            this.state.isBusy = false
            return

          case "NONE_02":
            this.textLogShow("Missing LLM API key or model name")
            this.state.isBusy = false
            return

          case "NONE_03":
            this.textLogShow("Missing TTS API key")
            this.state.isBusy = false
            return
        }
        if (imgWidget) {
          hmUI.deleteWidget(imgWidget)
          imgWidget = null
        }

        if (viewContainerResult) {
          hmUI.deleteWidget(viewContainerResult)
          viewContainerResult = null
        }


        this.startWordAnimation(data, () => {
          this.answerCompleted()
        })

        if (this.state.isTTS && await this.downTTS() && await this.transTTS()) {
          player.setSource(player.source.FILE, { file: `data://download/${DEVICE_UUID}.mp3` })
          player.prepare()
        }

      } catch (error) {
        return false
      } finally {
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
      //hmUI.setStatusBarVisible(false)

      if (!viewContainerBtn)
        viewContainerBtn = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, BUTTONS_VIEW_CONTAINER)
      if (!btnChat) {
        btnChat = viewContainerBtn.createWidget(hmUI.widget.BUTTON, {
          ...CHAT_BUTTON, click_func: async () => {
            console.log("chat")

            if (!this.state.isBusy) {
              this.textLogHide()
              this.state.isBusy = true

              if (wordTimer) {
                clearInterval(wordTimer)
                wordTimer = null
              }

              player.stop()



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
          }
        })
      }
      if (!btnAudio) {
        btnAudio = viewContainerBtn.createWidget(hmUI.widget.BUTTON, {
          ...AUDIO_BUTTON, click_func: () => {
            console.log("audio")
            if (this.state.isTTS) {
              this.state.isTTS = false
              btnAudio.text = "OFF"
            }
            else {
              this.state.isTTS = true
              btnAudio.text = "ON"
            }
          }
        })
      }
      if (!btnClearMessages) {
        btnClearMessages = viewContainerBtn.createWidget(hmUI.widget.BUTTON, {
          ...CLEAR_BUTTON, click_func: async () => {
            if (!this.state.isBusy) {

              this.textLogHide()
              console.log("clear")
              if (!dialogClearMessages) {
                dialogClearMessages = createModal({
                  content: "Are you sure you want to delete the conversation?",
                  autoHide: false,
                  onClick: async (keyObj) => {
                    const { type } = keyObj
                    if (type === MODAL_CONFIRM) {
                      if (await this.pingServer())
                        this.clearMessages()
                    }
                    dialogClearMessages.show(false)

                  },
                })
                dialogClearMessages.show(true)
              }
              else
                dialogClearMessages.show(true)
            }
          }
        })

      }
      // if (!btnChat) {

      //   btnChat = hmUI.createWidget(hmUI.widget.BUTTON, CHAT_BUTTON)
      //   btnChat.addEventListener(hmUI.event.CLICK_DOWN, async () => {
      //     console.log("chat")

      //     if (!this.state.isBusy) {
      //       this.textLogHide()
      //       this.state.isBusy = true

      //       if (wordTimer) {
      //         clearInterval(wordTimer)
      //         wordTimer = null
      //       }

      //       player.stop()

      //       if (viewContainerResult) {
      //         hmUI.deleteWidget(viewContainerResult)
      //         viewContainerResult = null
      //       }

      //       if (await this.pingServer()) {
      //         this.createKeyboard(async (message) => {
      //           if (message)
      //             await this.chatAI(message)

      //           else
      //             this.state.isBusy = false
      //         })
      //       }
      //       else
      //         this.state.isBusy = false
      //     }
      //   })
      // }

      // if (!btnAudio) {
      //   btnAudio = hmUI.createWidget(hmUI.widget.BUTTON, AUDIO_BUTTON)

      //   btnAudio.addEventListener(hmUI.event.CLICK_DOWN, () => {
      //     console.log("audio")
      //     if (this.state.isTTS) {
      //       this.state.isTTS = false
      //       btnAudio.text = "OFF"
      //     }
      //     else {
      //       this.state.isTTS = true
      //       btnAudio.text = "ON"
      //     }
      //   })
      // }

      // if (!btnClearMessages) {
      //   btnClearMessages = hmUI.createWidget(hmUI.widget.BUTTON, CLEAR_BUTTON)
      //   btnClearMessages.addEventListener(hmUI.event.CLICK_DOWN, () => {
      //     if (!this.state.isBusy) {

      //       this.textLogHide()
      //       console.log("clear")
      //       if (!dialogClearMessages) {
      //         dialogClearMessages = createModal({
      //           content: "Are you sure you want to delete the conversation?",
      //           autoHide: false,
      //           onClick: async (keyObj) => {
      //             const { type } = keyObj
      //             if (type === MODAL_CONFIRM) {
      //               if (await this.pingServer())
      //                 this.clearMessages()
      //             }
      //             dialogClearMessages.show(false)

      //           },
      //         })
      //         dialogClearMessages.show(true)
      //       }
      //       else
      //         dialogClearMessages.show(true)
      //     }
      //   })
      // }
    },

    onDestroy() {
      resetPageBrightTime()
    },
  })
);


