import { createGetTranslation } from "@onruntime/translations/next/server";

export const getTranslation = createGetTranslation({
  debug: process.env.NODE_ENV === "development",
});
