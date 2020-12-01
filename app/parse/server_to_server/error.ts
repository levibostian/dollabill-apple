
export class NotValidNotification extends Error {
  constructor(message: string) {
    super(message)
  }
}