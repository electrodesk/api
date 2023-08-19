import type { CommandResponse, CommandErrorResponse } from '@trueffelmafia/electron-types/core'
import type { ApplicationReadDTO, CloseCommand, GetPropertyCommand, OpenCommand } from '@trueffelmafia/electron-types/application'
import { final } from '../decorators/final'

@final
export class ApplicationService {
  /**
   * execute command to open application window
   */
  static open<T>(application: string, data: T, asChild = false): CommandResponse<ApplicationReadDTO> | CommandErrorResponse {
    const command: OpenCommand<T> = {
      command: 'application:open',
      application,
      asChild,
      data
    }
    return window.tm_electron.exec<ApplicationReadDTO>(command)
  }

  static getProperty<R = unknown>(property: keyof ApplicationReadDTO): CommandResponse<R> | CommandErrorResponse {
    const command: GetPropertyCommand = {
      command: 'application:get-property',
      property
    }
    return window.tm_electron.exec<R>(command)
  }

  /**
   * execute command to close an application window
   */
  static close(id?: string): CommandResponse<void> | CommandErrorResponse {
    const command: CloseCommand = {
      command: 'application:close',
      id
    }
    return window.tm_electron.exec<void>(command)
  }
}
