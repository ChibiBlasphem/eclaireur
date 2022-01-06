export type EclaireurModule = 'core' | 'plugin';

export enum ErrorMessages {
  ENTRYPOINT_NOT_INCLUDED = 'CORE:ENTRYPOINT_NOT_INCLUDED',
}

export class EclaireurError extends Error {
  constructor(message: ErrorMessages) {
    super(message);
  }
}
