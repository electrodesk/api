import {
  ApplicationClosedEvent,
  ApplicationEvent,
  ApplicationExecCommand,
  ApplicationReadDTO,
  ApplicationRegisterListenerCommand,
  ApplicationRemoveListenerCommand,
} from "@electrodesk/types/application";
import { CommandErrorResponse, CommandResponse } from "@electrodesk/types/core"; // prettier-ignore

export declare type EventListener = (event: ApplicationEvent) => void;

export class Application {
  private eventRegistry: Map<string, EventListener[]> = new Map();

  private hasApplicationListener = false;

  constructor(private readonly application: ApplicationReadDTO) {}

  get id(): ApplicationReadDTO['uuid'] {
    return this.application.uuid;
  }

  /**
   * @description Fuehrt ein Command auf der Applikation aus
   * @throws TimeoutException
   */
  exec<TCommand extends string, TPayload = unknown, TResponse = unknown>(
    commandName: TCommand,
    commandPayload?: TPayload
  ): void {
    const command: ApplicationExecCommand<TPayload> = {
      command: "application:exec",
      applicationId: this.application.uuid,
      payload: {
        command: commandName,
        data: commandPayload,
      },
    };
    window.electrodesk.execCommand<TResponse>(command);
  }

  /**
   * @description register on application events, important only register self
   * for close event if any other event comes into play so we ensure it exists
   * only once.
   *
   * @throws exception
   */
  on(eventName: string, listener: EventListener): void {
    if (!this.hasApplicationListener) {
      this.registerElectronHandler();
      this.registerApplicationListener();
      this.registerEvent(
        "application:closed",
        this.handleApplicationClosed.bind(this)
      );
      this.hasApplicationListener = true;
    }
    this.registerEvent(eventName, listener);
  }

  /**
   * @description remove listener from registry, if registry becomes empty
   * after it will unregister from electron event handler also remove from
   * application events.
   */
  off(eventName: string, listener: EventListener): void {
    let handlers = this.eventRegistry.get(eventName);
    if (!handlers) {
      return;
    }

    handlers = handlers.filter((handler) => handler !== listener);
    if (handlers.length > 0) {
      this.eventRegistry.set(eventName, handlers);
      return;
    }

    /**
     * check eventregistry size is greater then 1, we have to do this
     * since we added our own application-close event to get notified
     * app has been closed.
     */
    this.eventRegistry.delete(eventName);
    if (this.eventRegistry.size > 1) {
      return;
    }

    this.clearAllEvents();
  }

  /**
   * @description removes all listeners
   */
  private clearAllEvents(isClosed = false): void {
    if (!this.hasApplicationListener) {
      return;
    }

    this.removeApplicationListener();
    this.eventRegistry.clear();
    this.removeElectronHandler();
    this.hasApplicationListener = false;
  }

  /**
   * @description handle all events which are send from electron main process
   * these are broadcasted events or events the target application will send.
   * If an event triggers which is registered in @see registerEvent notify listener.
   */
  private handleElectronEvent(event: ApplicationEvent): void {
    const eventHandler = this.eventRegistry.get(event.name);
    if (!eventHandler) return;

    if (
      event.sender !== "APPLICATION" ||
      event.senderId !== this.application.uuid
    ) {
      return;
    }

    for (let handler of eventHandler) {
      handler(event);
    }
  }

  /**
   * @description event handler an application gets closed, this is a broadcasted event
   * so it should check which app has been closed, if this is the application we currently
   * are connected to we have to remove all listeners
   */
  private handleApplicationClosed(payload: unknown): void {
    const applicationData = payload as ApplicationClosedEvent;
    if (applicationData.senderId !== this.application.uuid) {
      return;
    }
    this.clearAllEvents();
  }

  /**
   * @description type guard is error response
   */
  private isErrorResponse(
    response: CommandResponse | CommandErrorResponse
  ): response is CommandErrorResponse {
    return response.code !== 0;
  }

  /**
   * @description register local event with listener, this will handled if electron
   * main process sends an event which is catched up by @see handleElectronEvent.
   */
  private registerEvent(eventName: string, listener: EventListener): void {
    if (!this.eventRegistry.has(eventName)) {
      this.eventRegistry.set(eventName, []);
    }

    const listeners = this.eventRegistry.get(eventName);
    if (listeners && listeners.indexOf(listener) === -1) {
      this.eventRegistry.set(eventName, [...listeners, listener]);
    }
  }

  /**
   * @description register event handler for electron, this will catch
   * all events which are emitted to this window and notify registered
   * event listeners @see registerEvent
   */
  private registerElectronHandler(): void {
    window.electrodesk.addEventHandler(this.handleElectronEvent.bind(this));
  }

  /**
   * @description remove from electron main events
   */
  private removeElectronHandler(): void {
    window.electrodesk.removeEventHandler(this.handleElectronEvent.bind(this));
  }

  /**
   * @description register listener on applications to get notified on
   * all events which sends by target application and are not broadcasted
   * we have an listener for @see registerEvent @see handleElectronEvent
   */
  private registerApplicationListener(): void {
    const command: ApplicationRegisterListenerCommand = {
      command: "application:register-listener",
      id: this.application.uuid,
    };

    window.electrodesk.execCommand(command).then((response) => {
      if (this.isErrorResponse(response)) throw response.error;
    });
  }

  /**
   * @description remove from application listeners so we do not get notified about
   * applications events anymore
   */
  private removeApplicationListener(): void {
    const command: ApplicationRemoveListenerCommand = {
      command: "application:remove-listener",
      id: this.application.uuid,
    };

    window.electrodesk.execCommand(command);
  }
}
