export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationException extends DomainException {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} with identifier "${identifier}" not found`);
  }
}

export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
