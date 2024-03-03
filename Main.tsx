import type { ReactElement } from "react";
import { Providers } from "./src/lib/providers";
import { App } from "./App";

export const Main = (): ReactElement => {
  return (
    <Providers>
      <App />
    </Providers>
  );
};