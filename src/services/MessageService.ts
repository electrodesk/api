import type { Observable } from 'rxjs'
import type { Message } from "@trueffelmafia/electron-types"
import { map } from 'rxjs/operators'
import { final } from "../decorators/final"

@final
export class MessageService {

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

  /**
   * @description received a message from main process
   */
  message<R = unknown>(): Observable<Message.MainProcessMessage<R>> {
    return window.tm_electron.received<R>().pipe(
      map(([, message]) => message)
      // TODO add filter
    )
  }
}