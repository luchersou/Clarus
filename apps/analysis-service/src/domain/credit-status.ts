/**
 * Each analysis holds one credit of the user's daily quota:
 * RESERVED while it runs, CONSUMED when it completes, REFUNDED when it fails
 * (the saga's compensation).
 */
export type CreditStatus = "RESERVED" | "CONSUMED" | "REFUNDED";
