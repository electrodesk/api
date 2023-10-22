import type { CommandResponse, CommandErrorResponse } from '@electrodesk/types/core'
import type { ApplicationEntity, ApplicationListCommand, ApplicationReadDTO, GetPropertyCommand, OpenCommand } from '@electrodesk/types/application'
import { final } from '../decorators/final'
import { Application } from './Application.facade'


@final
export class ApplicationService {

  /**
   * @description Oeffnet eine Applikation und liefert eine Facadae zurueck ueber die mit der App
   * kommmuniziert werden kann.
   */
  open<T>(application: string, data: T, asChild = false): Promise<Application> {
    const command: OpenCommand<T> = {
      command: 'application:open',
      application,
      asChild,
      data
    }

    return window.electrodesk.execCommand<ApplicationReadDTO>(command)
      .then((response: CommandResponse<ApplicationReadDTO> | CommandErrorResponse) => {
        if (this.isErrorResponse(response)) {
          throw response.error;
        }
        return new Application(response.data)
      })
  }

  /**
   * @description Liefert eine Liste aller Applikationen wieder die aktuell offen sind
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

  /**
   * @description Liefert eine Eigenschaft der Applikation wieder, in dem Falle immer
   * die vom Sender selber, das bedeutet wir koennen nicht die Informationen von anderen Apps
   * abgreifen sondern nur die von der App selber.
   * 
   * @param property
   * @returns 
   */
  getProperty<R = unknown>(property: keyof ApplicationReadDTO): Promise<CommandResponse<R> | CommandErrorResponse> {
    const command: GetPropertyCommand = {
      command: 'application:get-property',
      property
    }
    return window.electrodesk.execCommand<R>(command)
  }

  private isErrorResponse(response: CommandResponse | CommandErrorResponse): response is CommandErrorResponse {
    return response.code !== 0;
  }
}
