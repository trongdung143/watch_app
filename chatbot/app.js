import { BaseApp } from "@zeppos/zml/base-app";
import { mkdirAudio } from "./utils/config/device";

App(
  BaseApp({
    globalData: {},
    onCreate(options) {
      console.log("app on create invoke");
      mkdirAudio()
    },

    onDestroy(options) {
      console.log("app on destroy invoke");
    },
  })
);
