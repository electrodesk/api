import type {
  ApplicationCloseCommand,
  ApplicationEntity,
  ApplicationListCommand,
  ApplicationMaximizeCommand,
  ApplicationMinimizeCommand,
  ApplicationReadDTO,
  ApplicationRestoreCommand,
  GetPropertyCommand,
  OpenCommand,
} from "@electrodesk/types/application";
import type {
  CommandErrorResponse,
  CommandResponse,
} from "@electrodesk/types/core";
import { final } from "../decorators/final";
import { Application } from "./Application.facade";

@final
export class ApplicationService {
  /**
   * @description open new application, if command succeeds it returns a facade so we can communicate and/or listen
   * to events to child window.
   *
   * @param application - name of application to open
   * @param data - initial data to send
   * @param asChild - open window as child window, that means window is allways on TOP. Not recommended
   * if we want to minimize since parent window will minimize too. Or if we move Child window to another
   * screen, the child window will simply disapeer.
   * @see https://github.com/electron/electron/issues/26031
   */
  open<T = unknown>(
    application: string,
    data?: T,
    asChild = false
  ): Promise<Application> {
    const command: OpenCommand<T> = {
      command: "application:open",
      application,
      asChild,
      data,
    };

    return window.electrodesk
      .execCommand<ApplicationReadDTO>(command)
      .then(
        (
          response: CommandResponse<ApplicationReadDTO> | CommandErrorResponse
        ) => {
          if (this.isErrorResponse(response)) {
            throw response.error;
          }
          return new Application(response.data);
        }
      );
  }

  /**
   * @description return a list of all available applications
   */
  list(): Promise<CommandResponse<ApplicationEntity[]> | CommandErrorResponse> {
    const command: ApplicationListCommand = {
      command: "application:list",
      config: {
        refresh: false,
      },
    };
    return window.electrodesk.execCommand<ApplicationEntity[]>(command);
  }

  /**
   * @description close application
   * @throws TimeoutException
   */
  close(): Promise<CommandResponse<void> | CommandErrorResponse> {
    const command: ApplicationCloseCommand = {
      command: "application:close",
    };
    return window.electrodesk.execCommand<void>(command);
  }

  /**
   * @description Maximiert die Applikation
   * @throws TimeoutException
   */
  maximize(): void {
    const command: ApplicationMaximizeCommand = {
      command: "application:maximize",
    };
    window.electrodesk.execCommand<void>(command);
  }

  /**
   * @description Minimiert die Applikation
   * @throws TimeoutException
   */
  minimize(): void {
    const command: ApplicationMinimizeCommand = {
      command: "application:minimize",
    };
    window.electrodesk.execCommand<void>(command);
  }

  /**
   * @description restore application if minimized
   */
  restore(): void {
    const command: ApplicationRestoreCommand = {
      command: "application:restore"
    };
    window.electrodesk.execCommand<void>(command);
  }

  /**
   * @description Liefert eine Eigenschaft der Applikation wieder, in dem Falle immer
   * die vom Sender selber, das bedeutet wir koennen nicht die Informationen von anderen Apps
   * abgreifen sondern nur die von der App selber.
   *
   * @param property
   * @returns
   */
  getProperty<R = unknown>(
    property: keyof ApplicationReadDTO
  ): Promise<CommandResponse<R> | CommandErrorResponse> {
    const command: GetPropertyCommand = {
      command: "application:get-property",
      property,
    };
    return window.electrodesk.execCommand<R>(command);
  }

  private isErrorResponse(
    response: CommandResponse | CommandErrorResponse
  ): response is CommandErrorResponse {
    return response.code !== 0;
  }
}
