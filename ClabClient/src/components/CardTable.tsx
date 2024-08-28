import { Card } from "../Card";
import {
  ClientCommand,
  ClientMessage,
  WebSocketService,
} from "../websocket/WebSocketService";

type CardTableProps = {
  cards: Card[];
  cardsOnTheTable: Card[];
  isActivePlayer: boolean;
  socketService?: WebSocketService;
  clientId: string;
  roomId: string;
  opponentCardsLength: number;
  trumpCard?: Card;
};

const pathToCards = "../../assets/cards";

const CardTable = ({
  cards,
  cardsOnTheTable,
  socketService,
  isActivePlayer,
  clientId,
  roomId,
  opponentCardsLength,
  trumpCard,
}: CardTableProps) => {
  const tryToMakeATurn = (yourCard: Card) => {
    if (isActivePlayer && socketService) {
      const tryToMakeATurnMessage: ClientMessage = {
        command: ClientCommand.TRY_TO_MAKE_A_TURN,
        data: {
          card: yourCard,
          clientId,
          roomId,
        },
      };
      socketService.sendMessage(tryToMakeATurnMessage);
    }
  };
  if (cards && cards.length !== 0) {
    const pathToCardBack = `url(${pathToCards}/card_back_black.png)`;
    const pathToTrumCard = `url(${pathToCards}/${trumpCard?.value}_of_${trumpCard?.cardSuite}.png)`;
    return (
      <div // container for all cards
        style={{
          display: "flex",
          flexDirection: "column",
          width: "700px",
          justifyContent: "",
          alignItems: "center",
        }}
      >
        <div // opponent cards
          style={{
            display: "flex",
            gap: "5px",
            flexDirection: "row",
            width: "700px",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            borderBottom: "1px solid white",
            background: "green",
          }}
        >
          {Array.from(Array(opponentCardsLength)).map((_, index) => {
            return (
              <div
                style={{
                  height: "150px",
                  width: "100px",
                  background: `${pathToCardBack} no-repeat`,
                  backgroundSize: "100%",
                }}
                key={index}
              ></div>
            );
          })}
        </div>
        <div // playing table
          style={{
            display: "flex",
            flexDirection: "row",
            background: "green",
            width: "700px",
            justifyContent: "space-between",
          }}
        >
          <div // cards on the table
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              width: "550px",
            }}
          >
            {cardsOnTheTable.map((card) => {
              const cardPngFileName = `${card.value}_of_${card.cardSuite}.png`;
              const pathToCard = `url(${pathToCards}/${cardPngFileName})`;
              return (
                <div
                  key={cardPngFileName}
                  style={{
                    cursor: "pointer",
                    height: "200px",
                    width: "100px",
                    background: `${pathToCard} no-repeat`,
                    backgroundSize: "100%",
                  }}
                ></div>
              );
            })}
          </div>
          <div // trump card
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "300px",
              width: "120px",
              flexDirection: "column",
              margin: "3px",
            }}
          >
            TRUMP CARD
            <div
              style={{
                height: "150px",
                width: "100px",
                // background: `${pathToTrumCard} no-repeat`,
                // backgroundSize: "100%",
                backgroundImage: pathToTrumCard,
                backgroundRepeat: "round",
              }}
            ></div>
          </div>
        </div>
        <div // my cards
          style={{
            display: "flex",
            gap: "5px",
            flexDirection: "row",
            width: "700px",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            borderTop: "1px solid white",
            background: "green",
          }}
        >
          {cards.map((card) => {
            const cardPngFileName = `${card.value}_of_${card.cardSuite}.png`;
            const pathToCard = `url(${pathToCards}/${cardPngFileName})`;
            return (
              <div
                onClick={() => tryToMakeATurn(card)}
                key={cardPngFileName}
                style={{
                  cursor: "pointer",
                  height: "150px",
                  width: "100px",
                  background: `${pathToCard} no-repeat`,
                  backgroundSize: "100%",
                }}
              ></div>
            );
          })}
        </div>
      </div>
    );
  }
  return <div></div>;
};

export default CardTable;
