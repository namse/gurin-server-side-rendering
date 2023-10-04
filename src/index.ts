import { getJsFileForBrowser } from "./getJsFileForBrowser";
import { ssr } from "./ssr";
import express from "express";

const app = express();

app.get("/", async (req, res) => {
  console.log("request received");
  const pageName = "App";
  const rendered = await ssr(pageName);
  const jsFileForBrowser = await getJsFileForBrowser(pageName);
  res.send(`
<html>
    <head>
        <title>My App</title>
    </head>
    <body>
        <div id="root">${rendered}<div>

        <script type="module">
            ${jsFileForBrowser}
        </script>
    </body>
</html>
`);
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server listening on port 8080");
});
