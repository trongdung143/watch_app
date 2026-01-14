import { BasePage } from "@zeppos/zml/base-page";
import * as hmUI from "@zos/ui";

import {
  ASK_BUTTON,
  RESULT_TEXT,
} from "zosLoader:./index.[pf].layout.js";

let textWidget;
let buttonWidget;
Page(
  BasePage({
    // call API to fetch data
    fetchData(message) {
      this.request({
        method: "CHAT",
        data: { 'message': message }
      })
        .then((data) => {
          console.log("Fetch chat result:", JSON.stringify(data));
          if (!textWidget) {
            textWidget = hmUI.createWidget(hmUI.widget.TEXT, RESULT_TEXT)
          }

          textWidget.setProperty(hmUI.prop.TEXT, data.result)

        })
        .catch((res) => {
        });
    },

    pingServer() {
      this.request({
        method: "PING",
      })
        .then((data) => {

          if (!textWidget) {
            textWidget = hmUI.createWidget(hmUI.widget.TEXT, RESULT_TEXT)
          }

          if (data.running) {
            textWidget.setProperty(
              hmUI.prop.TEXT,
              ""
            )
            this.createKeyboard()
          } else {
            textWidget.setProperty(
              hmUI.prop.TEXT,
              data.result
            )
          }
        })
        .catch((res) => {
        });
    },

    // keyboard event handlers
    // create keyboard
    createKeyboard() {
      hmUI.createKeyboard({
        inputType: hmUI.inputType.CHAR,
        onComplete: (_, result) => {
          this.destroyKeyboard()
          this.fetchData(result.data)
        },
        onCancel: (_, result) => {
          this.destroyKeyboard()
        },
        text: ''
      })
    },

    // destroy keyboard
    destroyKeyboard() {
      hmUI.deleteKeyboard()

    },

    state: {},
    onInit() {
    },
    build() {
      if (!buttonWidget)
        buttonWidget = hmUI.createWidget(hmUI.widget.BUTTON, ASK_BUTTON);
      buttonWidget.addEventListener(hmUI.event.CLICK_UP, () => {
        buttonWidget.setProperty(hmUI.prop.MORE, { color: 0x4A90E2 });
        this.pingServer()
      });
    },
  })
);


