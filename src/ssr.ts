import fs from "fs/promises";
import * as swc from "@swc/core";
import path from "path";
import { exec } from "child_process";

export async function ssr(pageName: string): Promise<string> {
  const sourceCode =
    (await fs.readFile(
      path.resolve(__dirname, `../my-app/src/${pageName}.tsx`),
      "utf-8"
    )) +
    `
  import ReactDOMServer from "react-dom/server";

  const rendered = ReactDOMServer.renderToString(<${pageName} />);
  console.log(rendered);
  `;

  const output = await swc.transform(sourceCode, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
    },
    env: {
      targets: {
        node: "20",
      },
    },
  });

  await fs.writeFile(
    path.resolve(__dirname, `../my-app/dist/${pageName}_ssr.mjs`),
    output.code
  );

  return new Promise((resolve, reject) => {
    exec(
      `node ${path.resolve(__dirname, `../my-app/dist/${pageName}_ssr.mjs`)}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          reject(err);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}
