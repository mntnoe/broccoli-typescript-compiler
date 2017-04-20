import * as path from "path";
import { sys } from "typescript";

const NORMALIZE_SLASHES = /\\\\/g;

export const useCaseSensitiveFileNames = sys.useCaseSensitiveFileNames;

export const getCanonicalFileName = sys.useCaseSensitiveFileNames
      ?
      (fileName: string) => fileName
      :
      (fileName: string) => fileName.toLowerCase();

export type NormalizedPath = string & { normalizedPathBrand: true };
export type NormalizedAbsolutePath = NormalizedPath & { absoluteBrand: true };

export function isWithin(root: NormalizedAbsolutePath, fileName: NormalizedAbsolutePath) {
  return fileName.length > root.length &&
         fileName.lastIndexOf(root, 0) === 0 &&
         fileName.charAt(root.length) === "/";
}

export function normalizeAbsolutePath(fileName: string, basePath?: string): NormalizedAbsolutePath {
  return normalizeSlashes(
    getCanonicalFileName(path.resolve(basePath === undefined ? process.cwd() : basePath, fileName))
  ) as NormalizedAbsolutePath;
}

export function normalizePath(fileName: string): NormalizedPath {
  return normalizeSlashes(
    getCanonicalFileName(path.normalize(fileName))
  ) as NormalizedPath;
}

function normalizeSlashes(fileName: string) {
  return fileName.replace(NORMALIZE_SLASHES, "/");
}

