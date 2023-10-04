import fs from "fs/promises";
import path from "path";
import { rollup } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";

export async function getJsFileForBrowser(pageName: string): Promise<string> {
  const srcPath = path.join(__dirname, `../my-app/src`);
  const copyPath = path.join(__dirname, `../my-app/copy_${pageName}`);

  await copyDir(srcPath, copyPath);

  const entry = path.resolve(copyPath, `${pageName}.tsx`);
  const entryFile =
    (await fs.readFile(entry, "utf-8")) +
    `
  import ReactDOM from "react-dom";

  ReactDOM.hydrate(<${pageName} />, document.getElementById("root"));
  `;

  await fs.writeFile(entry, entryFile);

  const bundle = await rollup({
    input: entry,
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      nodeResolve(),
      commonjs(),
      typescript({
        jsx: "react",
        esModuleInterop: true,
      }),
    ],
  });

  const distDirPath = path.join(__dirname, `../my-app/dist_${pageName}`);
  const output = await bundle.write({
    dir: distDirPath,
  });

  const jsFilePath = path.join(distDirPath, output.output[0].fileName);

  const jsFile = await fs.readFile(jsFilePath, "utf-8");

  return jsFile;
}

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath);
  }
}
