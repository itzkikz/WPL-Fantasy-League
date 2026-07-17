import { Player } from "../../features/players/types";

/**
 * Gets the numeric price of a player using the auctionPrice with a base price fallback:
 * - GK & DEF: 10
 * - MID: 15
 * - FWD: 20
 */
export const getPlayerNumericPrice = (player: any): number => {
  if (!player) return 0;

  // 1. Check for auctionPrice field
  const price = player.auctionPrice;
  if (price !== undefined && price !== null && price !== 0) {
    return Number(price);
  }

  // 2. Fallback based on position
  const rawPos = (player.position || "").toUpperCase();
  if (
    rawPos === "GK" ||
    rawPos === "GOALKEEPER" ||
    rawPos === "G" ||
    rawPos === "DEF" ||
    rawPos === "DEFENDER" ||
    rawPos === "D"
  ) {
    return 10;
  }
  if (rawPos === "MID" || rawPos === "MIDFIELDER" || rawPos === "M") {
    return 15;
  }
  if (rawPos === "FWD" || rawPos === "FORWARD" || rawPos === "F") {
    return 20;
  }

  return 10; // general default fallback
};

/**
 * Returns the formatted display string for player price (e.g. "15.0M").
 */
export const getPlayerDisplayPrice = (player: any): string => {
  const price = getPlayerNumericPrice(player);
  return price.toFixed(1) + "M";
};
