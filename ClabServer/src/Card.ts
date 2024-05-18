export enum CardSuite {
  CLUBS = "clubs",
  DIAMONDS = "diamonds",
  SPADES = "spades",
  HEARTS = "hearts",
}

export type Card = {
  value: string;
  cardSuite: CardSuite;
};

export class CardCollection {
  private cardCollection;

  private generateCardCollection(): Card[] {
    const cardValues: string[] = [
      "7",
      "8",
      "9",
      "10",
      "jack",
      "queen",
      "king",
      "ace",
    ];
    const cardSuits: CardSuite[] = [
      CardSuite.CLUBS,
      CardSuite.DIAMONDS,
      CardSuite.SPADES,
      CardSuite.HEARTS,
    ];
    const cardCollection: Card[] = [];

    for (const suit of cardSuits) {
      for (const value of cardValues) {
        cardCollection.push({ value, cardSuite: suit });
      }
    }

    return cardCollection;
  }
  constructor() {
    this.cardCollection = this.generateCardCollection();
  }

  public getCardCollection() {
    return this.cardCollection;
  }

  public getRandomCards(numCards: number): Card[] {
    this.cardCollection.sort(() => Math.random() - 0.5);
    const cardsToSend = this.cardCollection.splice(0, numCards);
    return cardsToSend;
  }
}
