import { ApplicationEvent } from "@electrodesk/types/application";
import { CommandHandlerParam, ElectronEvent } from "@electrodesk/types/core";
import { final } from "../decorators/final";
import { CommandContainer } from "../model/Command.container";

export declare type CommandListener = (command: CommandContainer) => void;
export declare type EventListener = (payload: unknown, event: string) => void;
declare type MessageRegistry<Listener = CommandListener | EventListener> = Map<
  string,
  Listener[]
>;

@final
export class MessageService {
  public commandListenerRegistry: MessageRegistry<CommandListener> = new Map();
  public eventListenerRegistry: MessageRegistry<EventListener> = new Map();

  clear(): void {
    this.commandListenerRegistry.clear();
    this.eventListenerRegistry.clear();
  }

  /**
   * @description emit event through renderer process
   */
  dispatchEvent(event: ElectronEvent): void {
    window.electrodesk.dispatchEvent(event);
  }

  /**
   * attach listener to specific command
   */
  attachCommandListener(command: string, listener: CommandListener): void {
    if (this.commandListenerRegistry.size === 0) {
      window.electrodesk.addCommandHandler(this.handleCommand.bind(this));
    }
    this.attachListener(this.commandListenerRegistry, command, listener);
  }

  /**
   * remove listener from specific command
   *
   * @todo improve typings, we get the information it should be a MessageRegistry<CommandListener> but
   * we can also pass MessageRegistry<EventListener> and it is also fine but it should't
   */
  detachCommandListener(command: string, listener: CommandListener): void {
    this.detachListener(this.commandListenerRegistry, command, listener);
    if (this.commandListenerRegistry.size === 0) {
      window.electrodesk.removeCommandHandler(this.handleCommand.bind(this));
    }
  }

  /**
   * attach listener to specific event
   */
  attachEventListener(event: string, listener: EventListener): void {
    if (this.eventListenerRegistry.size === 0) {
      window.electrodesk.addEventHandler(this.handleEvent.bind(this));
    }
    this.attachListener(this.eventListenerRegistry, event, listener);
  }

  /**
   * detach listener from specific event
   */
  detachEventListener(event: string, listener: EventListener): void {
    this.detachListener(this.eventListenerRegistry, event, listener);
    if (this.eventListenerRegistry.size === 0) {
      window.electrodesk.removeEventHandler(this.handleEvent.bind(this));
    }
  }

  /**
   * attach listener to registry
   */
  private attachListener<Listener = CommandListener | EventListener>(
    registry: MessageRegistry<Listener>,
    name: string,
    listener: Listener
  ): void {
    if (!registry.has(name)) {
      registry.set(name, [listener]);
      return;
    }
    const listeners = registry.get(name) as Listener[];
    registry.set(name, [...listeners, listener]);
  }

  /**
   * remove listener from registry, if no listener left entry will completly removed from map
   */
  private detachListener<Listener = CommandListener | EventListener>(
    registry: MessageRegistry<Listener>,
    name: string,
    listener: Listener
  ): void {
    if (!registry.has(name)) {
      return;
    }

    const listeners = registry.get(name) as Listener[];
    const cleanedListeners = listeners.filter(
      (registeredListener) => registeredListener !== listener
    );
    if (cleanedListeners.length === 0) {
      registry.delete(name);
      return;
    }
    registry.set(name, cleanedListeners);
  }

  private handleCommand(message: CommandHandlerParam): void {
    if (this.commandListenerRegistry.has(message.command)) {
      const listeners = this.commandListenerRegistry.get(
        message.command
      ) as CommandListener[];
      for (const listener of listeners) {
        const commandContainer = new CommandContainer(
          message.commandId,
          message.payload
        );
        listener(commandContainer);
      }
    }
  }

  private handleEvent(event: ApplicationEvent): void {
    const listeners = this.eventListenerRegistry.get(event.name) ?? [];
    const globalListeners = this.eventListenerRegistry.get("*") ?? [];
    const combinedListeners = [...listeners, ...globalListeners];
    for (const listener of combinedListeners) {
      listener(event.data, event.name);
    }
  }
}
