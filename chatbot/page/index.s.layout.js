import { px } from "@zos/utils";
import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

export const LINE_HEIGHT = px(38)

export const CHAT_BUTTON = {
  x: px(DEVICE_WIDTH - px(64)) / 2,
  y: px(0),
  w: px(64),
  h: px(64),
  normal_src: "chat.png",
  press_src: "chat.png",
};

export const AUDIO_BUTTON = {
  x: px(30),
  y: px(0),
  w: px(52),
  h: px(52),
  text_size: 10,
  text: "ON",
  normal_src: "audio.png",
  press_src: "audio.png"
};
export const CLEAR_BUTTON = {
  x: px(DEVICE_WIDTH - px(82)),
  y: px(0),
  w: px(52),
  h: px(52),
  normal_src: "clear.png",
  press_src: "clear.png"
};

export const RESULT_TEXT = {
  x: px(20),
  y: px(60),
  w: px(DEVICE_WIDTH - px(40)),
  h: px(304),
  color: 0xffffff,
  text_size: px(26),
  text_style: hmUI.text_style.WRAP,
  align_h: hmUI.align.CENTER_H,
  text: "",
};

export const LOG_TEXT = {
  x: px(20),
  y: px(0),
  w: px(DEVICE_WIDTH - px(40)),
  h: px(364),
  color: 0xffffff,
  text_size: px(26),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text: "",
};


export const AI_IMG = {
  x: px((DEVICE_WIDTH - 128) / 2),
  y: px((DEVICE_HEIGHT - 128) / 2),
  w: px(128),
  h: px(128),
  src: 'ai.png',
}


export const RESULT_VIEW_CONTAINER = {
  x: px(0),
  y: px(0),
  w: px(DEVICE_WIDTH),
  h: px(364),
}


export const BUTTONS_VIEW_CONTAINER = {
  x: 0,
  y: px(380),
  w: px(DEVICE_WIDTH),
  h: px(DEVICE_HEIGHT - px(380)),
  scroll_enable: false
}