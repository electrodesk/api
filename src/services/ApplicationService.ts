import type { CommandResponse, CommandErrorResponse } from '@electrodesk/electron-types/core'
import type { ApplicationReadDTO, CloseCommand, GetPropertyCommand, OpenCommand } from '@electrodesk/electron-types/application'
import { final } from '../decorators/final'

@final
export class ApplicationService {

  /**
   * execute command to open application window
   */
  open<T>(application: string, data: T, asChild = false): CommandResponse<ApplicationReadDTO> | CommandErrorResponse {
    const command: OpenCommand<T> = {
      command: 'application:open',
      application,
      asChild,
      data
    }
    return window.electrodesk.execCommand<ApplicationReadDTO>(command)
  }

  getProperty<R = unknown>(property: keyof ApplicationReadDTO): CommandResponse<R> | CommandErrorResponse {
    const command: GetPropertyCommand = {
      command: 'application:get-property',
      property
    }
    return window.electrodesk.execCommand<R>(command)
  }

  /**
   * execute command to close an application window
   */
  close(id?: string): CommandResponse<void> | CommandErrorResponse {
    const command: CloseCommand = {
      command: 'application:close',
      id
    }
    return window.electrodesk.execCommand<void>(command)
  }
}
