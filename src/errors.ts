export class GetError extends Error {
    constructor(subject: string) {
        super(`failed to get ${subject}`);

        Object.setPrototypeOf(this, GetError.prototype);
    }
}