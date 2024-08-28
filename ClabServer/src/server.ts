import WebSocket, { WebSocketServer } from "ws";
import { Card, CardCollection, CardSuite } from "./Card";
import { createClientId, createRoomId } from "./utils/session";

type Player = {
  idPlayer: string;
  idRoom: string;
  isActive: boolean;
  cardsInHand?: Card[];
  gainedCards?: Card[];
  purchase?: Card[];
};

enum ServerCommand {
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

type Room = {
  roomId: string;
  players: Player[];
  roomCardCollection?: Card[];
  cardsOnTheTable?: Card[];
  trumpCard?: Card;
  currentActivePlayerId?: string;
  playerIds: string[];
  isAllPlayersReady: boolean;
  selectedTrumpPlayer?: string;
};

const rooms: Record<string, Room> = {};

export enum ClientCommand {
  CREATE_ROOM = "CREATE_ROOM",
  CONNECT_TO_THE_ROOM = "CONNECT_TO_THE_ROOM",
  GET_CARDS = "GET_CARDS",
  CONNECTED_TO_SERVER = "CONNECTED_TO_SERVER",
  TRY_TO_MAKE_A_TURN = "TRY_TO_MAKE_A_TURN",
  FOLDED = "FOLDED",
  GET_PURCHASE_AND_SET_TRUMP = "GET_PURCHASE_AND_SET_TRUMP",
}

type ClientMessage = {
  command: ClientCommand;
  data: Record<string, string>;
};

type ServerMessage = {
  message: ServerCommand;
  data: Record<string, string | number | boolean | Card[] | Card>;
};

type ClientInfo = {
  id: string;
  socket: WebSocket;
  room?: string;
};

const clients: Record<string, ClientInfo> = {};

const wss = new WebSocketServer({ port: 5555 });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");
  const newPlayerId = createClientId();
  clients[newPlayerId] = {
    socket: ws,
    id: newPlayerId,
  };
  const newPlayerConnectionresponse: ServerMessage = {
    message: ServerCommand.SUCCESSFUL_CONNECTION,
    data: {
      id: newPlayerId,
    },
  };
  ws.send(JSON.stringify(newPlayerConnectionresponse));

  ws.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message) as ClientMessage;
    const { command, data } = parsedMessage;

    const clientId = data.clientId;

    if (command === ClientCommand.CONNECTED_TO_SERVER) {
      console.log("Client successfully connected");
      return;
    }

    if (!clientId) {
      console.log("Wrong request, no clientId");
      return;
    }

    if (!clients[clientId]) {
      console.log(`No client with ID ${clientId}`);
    }
    switch (command) {
      case ClientCommand.CREATE_ROOM:
        {
          console.log("received create room command");
          const roomId = createRoomId();

          // if (!rooms[roomId]) { // TODO:: TEMP FOR DEV
          const player: Player = {
            idPlayer: clientId,
            idRoom: roomId,
            isActive: false,
          };
          const newRoom: Room = {
            roomId,
            players: [],
            playerIds: [],
            isAllPlayersReady: false,
          };
          newRoom.players.push(player);
          newRoom.playerIds.push(clientId);

          rooms[roomId] = newRoom;
          clients[clientId].room = roomId;

          const createRoomResponse: ServerMessage = {
            message: ServerCommand.NEW_ROOM_CREATED,
            data: {
              roomId,
              playersInTheRoom: rooms[roomId].playerIds.length,
              isAllPlayersReady: false,
            },
          };

          ws.send(JSON.stringify(createRoomResponse));
          console.log("New room created");
          // }
        }

        break;
      case ClientCommand.CONNECT_TO_THE_ROOM:
        {
          console.log("received connect to room command");
          const { roomId, clientId } = data;

          if (!Object.keys(rooms).includes(roomId)) {
            ws.send(
              JSON.stringify({
                message: ServerCommand.NO_SUCH_ROOM,
              })
            );
            break;
          }

          if (clients[clientId].room === roomId) {
            ws.send(
              JSON.stringify({
                message: ServerCommand.ALREADY_IN_THE_ROOM,
              })
            );
            break;
          }

          const player: Player = {
            idPlayer: clientId,
            idRoom: roomId,
            isActive: false,
          };

          rooms[roomId].players.push(player);
          rooms[roomId].playerIds.push(clientId);

          const isAllPlayersReady = rooms[roomId].playerIds.length > 1;
          if (isAllPlayersReady) {
            rooms[roomId].isAllPlayersReady = true;
          }

          clients[clientId].room = roomId;
          const responseData = {
            roomId,
            playersInTheRoom: rooms[roomId].playerIds.length,
            isAllPlayersReady,
          };
          const connectToTheRoomResponse: ServerMessage = {
            message: ServerCommand.YOU_CONECTED_TO_THE_ROOM,
            data: responseData,
          };

          ws.send(JSON.stringify(connectToTheRoomResponse));

          rooms[roomId].playerIds
            .filter((id) => id !== clientId)
            .forEach((playerInTheRoomId) => {
              const currentPlayerSocket = clients[playerInTheRoomId].socket;
              const toYourRoomConnectedMessage: ServerMessage = {
                message: ServerCommand.TO_TOUR_ROOM_CONNECTED,
                data: responseData,
              };
              currentPlayerSocket.send(
                JSON.stringify(toYourRoomConnectedMessage)
              );
            });
        }
        break;
      case ClientCommand.GET_CARDS:
        {
          console.log("received get cards command");
          const { roomId } = data;
          const currentRoom = rooms[roomId];

          if (currentRoom.isAllPlayersReady) {
            const cards = new CardCollection();
            currentRoom.roomCardCollection = cards.getCardCollection();
            currentRoom.cardsOnTheTable = [];
            const trumpCard = cards.getRandomCards(1)[0];

            const activePlayerId = currentRoom.playerIds.sort(
              () => Math.random() - 0.5
            )[0];
            currentRoom.currentActivePlayerId = activePlayerId;
            currentRoom.players.forEach((player) => {
              const playerId = player.idPlayer;
              const cardsInHand = cards.getRandomCards(6);
              player.isActive = activePlayerId === playerId;

              player.cardsInHand = cardsInHand;
              player.purchase = cards.getRandomCards(4);

              const currentPlayerSocket = clients[playerId];
              const sendCardsCommand: ServerMessage = {
                message: ServerCommand.SENDING_YOUR_CARDS,
                data: {
                  cardsInHand: cardsInHand,
                  trumpCard,
                  isAcivePlayer: activePlayerId === playerId,
                },
              };
              currentPlayerSocket.socket.send(JSON.stringify(sendCardsCommand));
            });
          }
        }
        break;
      case ClientCommand.TRY_TO_MAKE_A_TURN:
        {
          const currentRoom = rooms[data.roomId];
          // if (currentRoom.currentActivePlayerId === clientId) {
          const card = data.card as unknown as Card;
          // TODO:: check if turn is valid
          if (
            currentRoom.cardsOnTheTable?.length === currentRoom.players.length
          ) {
            // last player turn, clear table, count points for player, who has won this turn
            currentRoom.cardsOnTheTable = [];
          }
          currentRoom.cardsOnTheTable?.push(card);

          const currentPlayer = currentRoom.players.find(
            (player) => player.idPlayer === clientId
          );
          if (currentPlayer && currentPlayer.cardsInHand) {
            const currentPlayerFilteredCardsInHand =
              currentPlayer.cardsInHand.filter(
                (cardInHand) =>
                  JSON.stringify(cardInHand) !== JSON.stringify(card)
              );

            currentPlayer.cardsInHand = currentPlayerFilteredCardsInHand;

            const successfulTurnResponse: ServerMessage = {
              message: ServerCommand.SUCCESFUL_TURN,
              data: {
                cardsInHand: currentPlayerFilteredCardsInHand,
                cardsOnTheTable: currentRoom.cardsOnTheTable || [],
              },
            };

            ws.send(JSON.stringify(successfulTurnResponse));

            currentRoom.playerIds
              .filter((id) => id !== clientId)
              .forEach((playerInTheRoomId) => {
                const opponentSocket = clients[playerInTheRoomId].socket;
                const opponentMadeATurnMessage: ServerMessage = {
                  message: ServerCommand.OPPONENT_MADE_A_TURN,
                  data: {
                    cardsOnTheTable: currentRoom.cardsOnTheTable || [],
                  },
                };
                opponentSocket.send(JSON.stringify(opponentMadeATurnMessage));
              });
          }
          // }
          // const denyMesssage: ServerMessage = {
          //   message: ServerCommand.UN_SUCCESFUL_TURN,
          //   data: {
          //     reason: "It's not your turn",
          //   },
          // };
          // ws.send(JSON.stringify(denyMesssage));
        }
        break;
      case ClientCommand.FOLDED:
        {
          const { roomId, clientId, numberOfFolds } = data;
          const currentRoom = rooms[roomId];
          const currentActivePlayerId =
            currentRoom.playerIds.find((playerId) => playerId !== clientId) ||
            "";
          currentRoom.currentActivePlayerId = currentActivePlayerId;
          const successfullFoldCommand: ServerMessage = {
            message: ServerCommand.SUCCESFUL_FOLD,
            data: {
              prevPlayerNumberOfFolds: numberOfFolds,
            },
          };
          currentRoom.playerIds.forEach((playerId) => {
            const socket = clients[playerId].socket;
            successfullFoldCommand.data.isNewActivePlayer =
              playerId === currentActivePlayerId ? true : false;
            socket.send(JSON.stringify(successfullFoldCommand));
          });
        }
        break;
      case ClientCommand.GET_PURCHASE_AND_SET_TRUMP:
        {
          const { clientId, roomId } = data;
          const currentRoom = rooms[roomId];
          const newTrumpSuite = data.newTrumpSuite as CardSuite;
          currentRoom.selectedTrumpPlayer = clientId;
          const newTrumpCard = {
            cardSuite: newTrumpSuite,
            value: "2",
          };
          currentRoom.trumpCard = newTrumpCard;

          const getPurchaseCommand: ServerMessage = {
            message: ServerCommand.SENDING_PURCHASE,
            data: {
              newTrumpCard,
            },
          };
          currentRoom.players.forEach((player) => {
            const socket = clients[player.idPlayer].socket;
            getPurchaseCommand.data.selectedTrumpPlayer =
              player.idPlayer === clientId ? true : false;
            if (player.cardsInHand && player.purchase) {
              getPurchaseCommand.data.cardsInHand = [
                ...player.cardsInHand,
                ...player.purchase,
              ];
            }
            socket.send(JSON.stringify(getPurchaseCommand));
          });
        }
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
