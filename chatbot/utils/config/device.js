import { getDeviceInfo } from "@zos/device";
import { mkdirSync } from '@zos/fs'
export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT, uuid: DEVICE_UUID } = getDeviceInfo();
export function mkdirAudio() {
    try {
        const result = mkdirSync({
            path: 'audio',
        })

        if (result === 0) {
            console.log('Audio directory created successfully')
        }
        else {
            console.log('Audio directory already exists or failed to create')
        }
    } catch (e) { }
}