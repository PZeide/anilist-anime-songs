import consola, { ConsolaInstance } from 'consola';

export type CancellationHandler = () => void;

export default class CancellationToken {
  private logger: ConsolaInstance = consola.withTag('canceltkn');
  private handlers: Record<string, CancellationHandler> = {};
  private valid: boolean = true;

  public isValid() {
    return this.valid;
  }

  public registerHandler(id: string, handler: CancellationHandler) {
    if (!this.valid) throw new Error("Can't register an handler because the token is invalid!");

    if (id in this.handlers) throw new Error(`Handler ${handler} is already registered!`);

    this.handlers[id] = handler;
    this.logger.debug(`Registered handler ${handler}.`);
  }

  public unregisterHandler(id: string) {
    if (!this.valid) throw new Error("Can't unregister an handler because the token is invalid");

    delete this.handlers[id];
  }

  public cancel() {
    this.valid = false;

    for (const [id, handler] of Object.entries(this.handlers)) {
      try {
        handler();
        this.logger.debug(`Invoked handler ${id}.`);
      } catch (e) {
        this.logger.warn(`Invokation of handler ${id} failed, cause :`, e);
      }
    }
  }
}
