/**
 * Base class for all domain-level exceptions.
 *
 * A "domain exception" represents a violation of a business rule (e.g. an
 * invalid input or a missing entity) rather than a technical/HTTP failure.
 * Keeping these separate from NestJS HTTP exceptions means the domain and
 * repository layers stay framework-agnostic; the module/service layer decides
 * how to translate them into HTTP responses.
 *
 * It is `abstract` because you should always throw one of the concrete
 * subclasses below, never a bare `DomainException`.
 */
export abstract class DomainException extends Error {
  /**
   * @param message Human-readable description of what went wrong.
   */
  constructor(message: string) {
    super(message);
    // Use the concrete subclass name (e.g. "EntityNotFoundException") as the
    // error name so logs and stack traces are self-explanatory.
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a value fails a validation check (wrong format, out of range, …).
 */
export class ValidationException extends DomainException {
  /**
   * @param message Description of the validation failure.
   * @param field   Optional name of the offending field, useful for surfacing
   *                the error next to a specific form input on the frontend.
   */
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

/**
 * Thrown when an action is technically valid but forbidden by a business rule
 * (e.g. booking a camper that is already blocked for the requested period).
 */
export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when a lookup by id/identifier returns no matching record.
 */
export class EntityNotFoundException extends DomainException {
  /**
   * @param entityName Human-readable name of the entity type (e.g. "Booking").
   * @param identifier The id/key that was searched for.
   */
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} with identifier "${identifier}" not found`);
  }
}

/**
 * Thrown when an operation cannot be performed given the current state of an
 * entity (e.g. cancelling a booking that is already cancelled).
 */
export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
