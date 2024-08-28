import { Card } from "../Card";

export enum ClientCommand {
  CREATE_ROOM = "CREATE_ROOM",
  CONNECT_TO_THE_ROOM = "CONNECT_TO_THE_ROOM",
  GET_CARDS = "GET_CARDS",
  CONNECTED_TO_SERVER = "CONNECTED_TO_SERVER",
  TRY_TO_MAKE_A_TURN = "TRY_TO_MAKE_A_TURN",
  FOLDED = "FOLDED",
  GET_PURCHASE_AND_SET_TRUMP = "GET_PURCHASE_AND_SET_TRUMP",
}

export enum ServerResponseMessage {
  SUCCESSFUL_CONNECTION = "SUCCESSFUL_CONNECTION",
  NEW_ROOM_CREATED = "NEW_ROOM_CREATED",
  NO_SUCH_ROOM = "NO_SUCH_ROOM",
  ALREADY_IN_THE_ROOM = "ALREADY_IN_THE_ROOM",
  YOU_CONECTED_TO_THE_ROOM = "YOU_CONECTED_TO_THE_ROOM",
  TO_TOUR_ROOM_CONNECTED = "TO_TOUR_ROOM_CONNECTED",
  SENDING_YOUR_CARDS = "SENDING_YOUR_CARDS",
  SUCCESFUL_TURN = "SUCCESFUL_TURN",
  UN_SUCCESFUL_TURN = "UN_SUCCESFUL_TURN",
  OPPONENT_MADE_A_TURN = "OPPONENT_MADE_A_TURN",
  SUCCESFUL_FOLD = "SUCCESFUL_FOLD",
  SENDING_PURCHASE = "SENDING_PURCHASE",
}

export type ClientMessage = {
  command: ClientCommand;
  data: Record<string, string | Card>;
};

export type ServerMessage = {
  message: ServerResponseMessage;
  data: Record<string, string | number | boolean | Card[] | Card>;
};

export class WebSocketService {
  private socket;

  constructor(port: string) {
    this.socket = new WebSocket(`http://192.168.0.108:${port}`); // TODO:: change to get host from env
  }

  public getSocket() {
    return this.socket;
  }

  public sendMessage(message: ClientMessage) {
    this.socket.send(JSON.stringify(message));
  }
}
