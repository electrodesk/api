import { CommandCompletedEvent } from "@trueffelmafia/electron-types/application"

export class CommandContainer<P = unknown, R = unknown> {

  private isCompleted = false

  constructor(
    private id: string,
    private readonly payload: P
  ) {}

  /**
   * get current payload which was send through command
   */
  data(): P {
    return this.payload
  }

  /**
   * call method to complete command, this will send event back to electron
   */
  complete(data: R): void {
    if (!this.isCompleted) {
      const event: CommandCompletedEvent = {
        name: 'command:completed',
        payload: {
          commandId: this.id,
          data
        }
      }
      window.tm_electron.dispatchEvent(event)
      this.isCompleted = true
    }
  }
}
