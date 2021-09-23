import '../styles/globals.css'
import { createGlobalStyle, ThemeProvider } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: Roboto, serif;
  }
`
const theme = {};

const MyApp = ({ Component, pageProps }) => {
  return <ThemeProvider theme={theme}>
    <GlobalStyle/>
    <Component {...pageProps} />
  </ThemeProvider>
}

export default MyApp
