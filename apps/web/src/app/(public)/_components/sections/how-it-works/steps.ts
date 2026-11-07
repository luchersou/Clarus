export const STEPS = [
  {
    number: "01",
    title: "Upload your document",
    description:
      "Drop a contract, invoice, or financial report. Clarus reads every page for you.",
  },
  {
    number: "02",
    title: "Choose an action",
    description:
      "Summarize, extract values, check deadlines, or compare against another document.",
  },
  {
    number: "03",
    title: "Get a precise answer",
    description:
      "Structured, accurate results — no digging through pages to find what matters.",
  },
];

export const ACTIONS = ["Summary", "Extract values", "Deadlines", "Compare"];

export const SELECTED_ACTION = "Extract values";

export const FILE_NAME = "Supplier_Contract_2026.pdf";

export const PAGE_COUNT = 12;

export const EXTRACTED_VALUES = [
  {
    clause: "3.1 Total price payable",
    field: "Total amount",
    value: "$48,750.00",
  },
  {
    clause: "3.2 Payment due on or before",
    field: "Due date",
    value: "Oct 15, 2027",
  },
  {
    clause: "3.3 Late fee on overdue sums",
    field: "Late fee",
    value: "2% per month",
  },
];
