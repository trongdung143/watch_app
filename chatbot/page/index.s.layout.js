import { px } from "@zos/utils";
import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

export const CHAT_BUTTON = {
  x: px(DEVICE_WIDTH - px(64 * 2)),
  y: px(380),
  w: px(64),
  h: px(64),
  normal_src: 'chat.png',
  press_src: 'chat.png',
};

export const AUDIO_BUTTON = {
  x: px(64),
  y: px(380),
  w: px(64),
  h: px(64),
  normal_src: 'audio.png',
  press_src: 'audio.png',
};


export const RESULT_TEXT = {
  x: px(20),
  y: px(60),
  w: px(DEVICE_WIDTH - px(40)),
  h: px(DEVICE_HEIGHT - px(100)),
  color: 0xffffff,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  text_style: hmUI.text_style.WRAP,
};