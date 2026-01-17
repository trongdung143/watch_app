import { px } from "@zos/utils";
import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

export const CHAT_BUTTON = {
  x: px(DEVICE_WIDTH - px(64)) / 2,
  y: px(380),
  w: px(64),
  h: px(64),
  normal_src: "chat.png",
  press_src: "chat.png",
};

export const AUDIO_BUTTON = {
  x: px(30),
  y: px(380),
  w: px(52),
  h: px(52),
  text_size: 10,
  text: "ON",
  normal_src: "audio.png",
  press_src: "audio.png"
};
export const CLEAR_BUTTON = {
  x: px(DEVICE_WIDTH - px(82)),
  y: px(380),
  w: px(52),
  h: px(52),
  normal_src: "clear.png",
  press_src: "clear.png"
};



export const RESULT_TEXT = {
  x: px(20),
  y: px(60),
  w: px(DEVICE_WIDTH - px(40)),
  h: px(300),
  color: 0xffffff,
  text_size: px(30),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.WRAP,
  text: "",
};

export const AI_IMG = {
  x: px((DEVICE_WIDTH - 128) / 2),
  y: px((DEVICE_HEIGHT - 128) / 2),
  w: px(128),
  h: px(128),
  src: 'ai.png',
}
