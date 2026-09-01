import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const jsonRecordSchema = z.record(z.unknown());

export async function readPublicJson(pathname: string): Promise<Record<string, unknown> | null> {
  const relativePath = pathname.replace(/^\/+/, "");
  const publicRoot = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicRoot, relativePath);

  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error(`Refusing to read outside public directory: ${pathname}`);
  }

  try {
    const value: unknown = JSON.parse(await readFile(filePath, "utf8"));
    const result = jsonRecordSchema.safeParse(value);
    return result.success ? result.data : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`Unable to read public JSON ${pathname}`, { cause: error });
  }
}
