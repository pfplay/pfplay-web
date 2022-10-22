import { Global } from "@emotion/react";
import { ThemeProvider } from "@emotion/react";

import type { AppProps } from "next/app";
import { global } from "@styles/globals";
import { theme } from "@styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Global styles={global} />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
