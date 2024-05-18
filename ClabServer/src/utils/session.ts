import crypto from "crypto";
export function createClientId(): string {
  return crypto.randomUUID().toString().toString().split("-")[0];
}

export function createRoomId(): string {
  // return crypto.randomUUID().toString().split("-")[1];
  return "123"; // TODO:: TEMP FOR TESTING
}
