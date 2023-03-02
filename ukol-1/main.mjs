import fs from "fs/promises";
import { parseArgs } from "node:util";

const parseArgsProps = {
  options: {
    force: {
      type: "boolean",
      short: "f",
    },
  },
  allowPositionals: true,
};

function main() {
  const args = parseArgs(parseArgsProps);
  const forceMode = args.values.force;
  const origin = args.positionals[0];
  const destination = args.positionals[1];

  try {
    runChecks(origin, destination, forceMode);
  } catch (error) {
    console.error(error);
    return false;
  }

  try {
    copyFiles(origin, destination);
  } catch (error) {
    console.error(error);
    return false;
  }
}

main();

async function runChecks(origin, destination, forceMode) {
  if (!origin) {
    throw new Error("Nezadali jste ani zdrojový soubor.");
  }
  if (!destination) {
    throw new Error("Nezadali jste cilovou destinaci.");
  }
  await fs.access(origin, fs.F_OK).catch((error) => {
    throw new Error("Zdrojový soubor neexistuje nebo k němu nemáte oprávnění.");
  });

  try {
    const destinationData = await fs.readFile(destination);

    if (destinationData.length == 0) {
      console.log("Cílový soubor již existuje, ale je prázdný, přepisuji.");
    }

    if (destinationData.length > 0 && !forceMode) {
      console.error(
        "Cílový soubor již existuje a má obsah. Pokud ho chcete přepsat, použijte příkaz s parametrem --force."
      );
      return false;
    }
  } catch {}

  return true;
}

async function copyFiles(origin, destination) {
  try {
    const destinationFolder = destination.split("/");
    destinationFolder.pop();
    if (destinationFolder.length > 0) {
      await fs
        .mkdir(destinationFolder.join("/"), { recursive: true })
        .catch(console.error);
    }
    await fs.copyFile(origin, destination);
  } catch (error) {
    console.error(error);
    return false;
  }

  console.log("Soubor byl zkopírován.");
}
