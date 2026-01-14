import { px } from "@zos/utils";
import * as hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

export const ASK_BUTTON = {
  x: (DEVICE_WIDTH - px(52)) / 2,
  y: px(380),
  w: px(52),
  h: px(52),
  normal_src: 'enter.png',
  press_src: 'enter.png',
};


export const RESULT_TEXT = {
  x: px(20),
  y: px(20),
  w: DEVICE_WIDTH - px(40),
  h: px(DEVICE_HEIGHT - px(110)),
  color: 0xffffff,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};