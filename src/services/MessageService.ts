import type { Message } from "@trueffelmafia/electron-types"
import { final } from "../decorators/final"

@final
export class MessageService {

  send<T = unknown>(broker: string, channel: string, action: string, payload?: T): void {
    const data: Message.RendererMessage<T> = {
      path: `${broker}:${channel}:${action}`,
      body: payload
    }

    window.tm_electron.send(data)
  }
}