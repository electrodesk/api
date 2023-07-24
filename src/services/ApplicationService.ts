import type { Application, Command } from '@trueffelmafia/electron-types'
import { final } from '../decorators/final'

@final
export class ApplicationService {

  /**
   * execute command to open application window
   */
  static open<T = unknown>(payload: Application.OpenRequestParam<T>): Command.Response<Application.ApplicationDTO> {
    const req: Application.OpenRequest<T> = {
      command: 'application:open',
      payload
    }
    return window.tm_electron.exec(req)
  }

  /**
   * execute command to close an application window
   */
  static close(id: string): Command.Response<void> {
    const request: Application.CloseRequest = {
      command: 'application:close',
      payload: { id }
    }
    return window.tm_electron.exec(request)
  }

  static resolveState(): Command.Response<Application.State> {
    const request: Application.StateRequest = {
      command: 'application:state',
    }
    return window.tm_electron.exec<Application.State>(request)
  }
}
