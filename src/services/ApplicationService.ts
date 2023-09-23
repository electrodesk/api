import type { CommandResponse, CommandErrorResponse } from '@electrodesk/types/core'
import type { ApplicationEntity, ApplicationListCommand, ApplicationReadDTO, CloseCommand, GetPropertyCommand, OpenCommand } from '@electrodesk/types/application'
import { final } from '../decorators/final'

@final
export class ApplicationService {

  /**
   * execute command to open application window
   */
  open<T>(application: string, data: T, asChild = false): Promise<CommandResponse<ApplicationReadDTO> | CommandErrorResponse> {
    const command: OpenCommand<T> = {
      command: 'application:open',
      application,
      asChild,
      data
    }
    return window.electrodesk.execCommand<ApplicationReadDTO>(command)
  }

  /**
   * @description gets a list of all available applications
   */
  list(): Promise<CommandResponse<ApplicationEntity[]> | CommandErrorResponse> {
    const command: ApplicationListCommand = {
      command: 'application:list',
      config: {
        refresh: false
      }
    }
    return window.electrodesk.execCommand<ApplicationEntity[]>(command)
  }

  getProperty<R = unknown>(property: keyof ApplicationReadDTO): Promise<CommandResponse<R> | CommandErrorResponse> {
    const command: GetPropertyCommand = {
      command: 'application:get-property',
      property
    }
    return window.electrodesk.execCommand<R>(command)
  }

  /**
   * execute command to close an application window
   */
  close(id?: string): Promise<CommandResponse<void> | CommandErrorResponse> {
    const command: CloseCommand = {
      command: 'application:close',
      id
    }
    return window.electrodesk.execCommand<void>(command)
  }
}
