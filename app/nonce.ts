import { createContext, useContext } from "react";

export const NonceContext = createContext<string>("");
export const useNonce = () => useContext(NonceContext);
