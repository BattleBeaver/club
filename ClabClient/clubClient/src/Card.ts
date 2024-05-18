enum CardSuite {
  CLUBS = "clubs",
  DIAMONDS = "diamonds",
  SPADES = "spades",
  HEARTS = "hearts",
}

export type Card = {
  value: string;
  cardSuite: CardSuite;
};
