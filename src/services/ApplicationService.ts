import type { Application } from '@trueffelmafia/electron-types'
import { final } from '../decorators/final'

@final
export class ApplicationService {

  /**
   * execute command to open application window
   */
  static open<T = unknown>(body: Application.OpenRequestParam<T>): Promise<Application.OpenResponse> {
    const req: Application.OpenRequest<T> = {
      command: 'application:open',
      body 
    }
    return window.tm_electron.exec<Application.OpenResponse>(req)
  }

  /**
   * execute command to close an application window
   */
  static close(id: string): Promise<void> {
    const request: Application.CloseRequest = {
      command: 'application:close',
      body: { id }
    }
    return window.tm_electron.exec<void>(request)
  }

  static resolveState(): Promise<Application.State> {
    const request: Application.StateRequest = {
      command: 'application:state',
    }
    return window.tm_electron.exec<Application.State>(request)
  }
}
