import type { Message } from "@trueffelmafia/electron-types"
import { final } from "../decorators/final"

@final
export class MessageService {

  private receivers: Set<Message.MessageReceiver> = new Set()

  constructor() {
    window.tm_electron.message(this.handleMessage.bind(this))
  }

  /**
   * @description sends a message to main process
   */
  send<T = unknown>(broker: string, channel: string, action: string, payload?: T): void {
    const data: Message.RendererMessage<T> = {
      path: `${broker}:${channel}:${action}`,
      body: payload
    }

    window.tm_electron.send(data)
  }

  attach(receiver: Message.MessageReceiver): void {
    if(!this.receivers.has(receiver)) {
      this.receivers.add(receiver)
    }
  }

  detach(receiver: Message.MessageReceiver): void {
    if(this.receivers.has(receiver)) {
      this.receivers.delete(receiver)
    }
  }

  private handleMessage(message: Message.MainProcessMessage<unknown>): void {
    for (const receiver of this.receivers) {
      receiver.onMessage.call(receiver, message)
    }
  }
}