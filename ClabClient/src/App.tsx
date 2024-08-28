import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  WebSocketService,
  ClientCommand,
  ClientMessage,
  ServerMessage,
  ServerResponseMessage,
} from "./websocket/WebSocketService";
import { Card } from "./Card";
import CardTable from "./components/CardTable";
import UserDetails from "./components/UserDetails";
import RoomActrions from "./components/RoomActrions";
import { Button } from "./components/ui/button";
import { votingSuites } from "./utils/votingSuits";

function App() {
  const [roomId, setRoomId] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [socketService, setSocketService] = useState<WebSocketService>();
  const [playersInTheRoom, setPlayersInTheRoom] = useState("0");
  const [isAllPlayersReady, setIsAllPlayersReady] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [cardsInHand, setCardsInHand] = useState<Card[]>();
  const [cardsOnTheTable, setcardsOnTheTable] = useState<Card[]>();
  const [isActivePlayer, setisActivePlayer] = useState(true);
  const [numberOfFolds, setNumberOfFolds] = useState<0 | 1>(0);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [isSelectedTrump, setIsSelectedTrump] = useState<undefined | boolean>(
    undefined
  );

  const [trumpCard, setTrumpCard] = useState<Card>();
  const [opponentCardsLength, setOpponentCardsLength] = useState(0);
  const roomIdInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const socket = new WebSocketService("3838");
    const socketInstance = socket.getSocket();
    socketInstance.addEventListener("open", () => {
      socket.sendMessage({
        command: ClientCommand.CONNECTED_TO_SERVER,
        data: {},
      });
    });
    setSocketService(socket);
    socketInstance.addEventListener(
      "message",
      (event: { data: string }): void => {
        const serverMessage: ServerMessage = JSON.parse(event.data);
        const { message, data } = serverMessage;
        console.log("Message from server ", serverMessage);
        if (message === ServerResponseMessage.SUCCESSFUL_CONNECTION) {
          setClientId(data.id.toString());
        } else {
          processMessage(event.data, clientId);
        }
      }
    );
  }, []);

  const processMessage = (serverStringMessage: string, c) => {
    const serverMessage: ServerMessage = JSON.parse(serverStringMessage);
    const { message, data } = serverMessage;
    switch (message) {
      case ServerResponseMessage.NEW_ROOM_CREATED:
      case ServerResponseMessage.YOU_CONECTED_TO_THE_ROOM:
      case ServerResponseMessage.TO_TOUR_ROOM_CONNECTED:
        {
          const roomId = data.roomId;
          const playersInTheRoom = data.playersInTheRoom;
          const isAllPlayersReady = data.isAllPlayersReady;
          setRoomId(roomId.toString());
          setPlayersInTheRoom(playersInTheRoom.toString());
          setIsAllPlayersReady(isAllPlayersReady.toString() === "true");
        }
        break;
      case ServerResponseMessage.SENDING_YOUR_CARDS:
        {
          const cardsInHand = data.cardsInHand as Card[];
          const trumpCard = data.trumpCard as Card;
          console.log(data);
          setIsGameStarted(true);
          setCardsInHand(cardsInHand);
          setOpponentCardsLength(cardsInHand.length);
          setTrumpCard(trumpCard);
          setisActivePlayer(data.isAcivePlayer as boolean);
          setIsFirstPlayer(data.isAcivePlayer as boolean);
        }
        break;
      case ServerResponseMessage.SUCCESFUL_TURN:
        {
          const cardsInHand = data.cardsInHand as Card[];
          const cardsOnTheTable = data.cardsOnTheTable as Card[];
          setCardsInHand(cardsInHand);
          setcardsOnTheTable(cardsOnTheTable);
          setisActivePlayer(false);
        }
        break;
      case ServerResponseMessage.OPPONENT_MADE_A_TURN:
        {
          const cardsOnTheTable = data.cardsOnTheTable as Card[];
          setcardsOnTheTable(cardsOnTheTable);
          setisActivePlayer(true); // TODO:: correct for 2 players game
          setOpponentCardsLength((prevState) => prevState - 1);
        }
        break;
      case ServerResponseMessage.SUCCESFUL_FOLD:
        {
          const { isNewActivePlayer } = data;
          if (isNewActivePlayer) {
            setisActivePlayer(true);
          }
        }
        break;
      case ServerResponseMessage.SENDING_PURCHASE:
        {
          const cardsInHand = data.cardsInHand as Card[];
          const newTrumpCard = data.newTrumpCard as Card;
          setCardsInHand(cardsInHand);
          setTrumpCard(newTrumpCard);
          if (data.selectedTrumpPlayer) {
            setIsSelectedTrump(true);
            setisActivePlayer(true);
            break;
          }
          setIsSelectedTrump(false);
        }
        break;
    }
  };

  const createRoom = () => {
    if (clientId) {
      const createRoomRequest: ClientMessage = {
        command: ClientCommand.CREATE_ROOM,
        data: {
          clientId,
        },
      };
      socketService?.sendMessage(createRoomRequest);
    }
  };

  const connectToRoom = () => {
    const requestetRoomId = roomIdInput.current?.value;
    if (requestetRoomId && clientId) {
      const connectToRoomRequest: ClientMessage = {
        command: ClientCommand.CONNECT_TO_THE_ROOM,
        data: {
          clientId,
          roomId: requestetRoomId,
        },
      };
      socketService?.sendMessage(connectToRoomRequest);
    }
  };

  const getCards = () => {
    if (isAllPlayersReady && clientId && roomId) {
      const getCardsRequest: ClientMessage = {
        command: ClientCommand.GET_CARDS,
        data: {
          clientId,
          roomId,
        },
      };
      socketService?.sendMessage(getCardsRequest);
    }
  };

  const handleFold = () => {
    if (numberOfFolds === 0) {
      setNumberOfFolds(1);
      setisActivePlayer(false);
      const foldMessage: ClientMessage = {
        command: ClientCommand.FOLDED,
        data: {
          clientId,
          roomId,
        },
      };
      socketService.sendMessage(foldMessage);
      return;
    }

    if (isFirstPlayer) {
      setisActivePlayer(false);
      const foldMessage: ClientMessage = {
        command: ClientCommand.FOLDED,
        data: {
          clientId,
          roomId,
        },
      };
      socketService.sendMessage(foldMessage);
      return;
    }
  };

  const handleVoteSuiteClick = (suite: string) => {
    const getPurchaseSetTrump: ClientMessage = {
      command: ClientCommand.GET_PURCHASE_AND_SET_TRUMP,
      data: {
        clientId,
        roomId,
        newTrumpSuite: suite,
      },
    };
    socketService.sendMessage(getPurchaseSetTrump);
  };

  const displayControls = () => {
    // first round of folds
    if (numberOfFolds === 0) {
      return (
        <div className="mt-1 flex flex-row gap-1">
          <Button onClick={handleFold}>Fold</Button>
          <Button onClick={() => handleVoteSuiteClick(trumpCard.cardSuite)}>
            Play current card suite
          </Button>
        </div>
      );
    }

    // second round of folds
    return (
      <div className="mt-1 flex flex-row gap-1">
        {isFirstPlayer && <Button onClick={handleFold}>Fold</Button>}
        {votingSuites.map((card) => {
          if (trumpCard.cardSuite !== card.suite) {
            return (
              <button
                key={card.suite}
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundImage: `url(${card.pathToCard})`,
                  backgroundRepeat: "round",
                  borderRadius: "5px",
                }}
                onClick={() => handleVoteSuiteClick(card.suite)}
              ></button>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="max-w-screen-lg">
      <UserDetails
        numberOfPlayers={playersInTheRoom}
        roomId={roomId}
        clientId={clientId}
      ></UserDetails>
      {!isGameStarted && (
        <RoomActrions
          connectToTheRoom={connectToRoom}
          createRoom={createRoom}
          roomIdInputRef={roomIdInput}
        ></RoomActrions>
      )}
      {isAllPlayersReady && !isGameStarted && (
        <div className="w-full flex items-center justify-center m-4">
          <Button variant="destructive" className="w-1/2" onClick={getCards}>
            Start game!
          </Button>
        </div>
      )}
      <CardTable
        cards={cardsInHand || []}
        cardsOnTheTable={cardsOnTheTable || []}
        socketService={socketService}
        isActivePlayer={isActivePlayer}
        clientId={clientId || ""}
        roomId={roomId || ""}
        opponentCardsLength={opponentCardsLength}
        trumpCard={trumpCard || undefined}
      ></CardTable>

      {isGameStarted &&
        isActivePlayer &&
        typeof isSelectedTrump === "undefined" &&
        displayControls()}
      {isSelectedTrump && <span>You selected trump suite. Play safe!</span>}
      {isSelectedTrump === false && (
        <span>Other player selected trump suite</span>
      )}
    </div>
  );
}

export default App;
