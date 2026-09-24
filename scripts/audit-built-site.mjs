import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const appRoot = resolve(".next/server/app");

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(directory, entry);
    const info = await stat(absolute);
    if (info.isDirectory()) files.push(...await walk(absolute));
    else if (entry.endsWith(".html")) files.push(absolute);
  }
  return files;
}

function routeFor(file) {
  const path = relative(appRoot, file).split(sep).join("/").replace(/\.html$/, "");
  if (path === "index") return "/";
  return `/${path.replace(/\/index$/, "")}`;
}

function decode(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
}

const files = await walk(appRoot);
const pages = new Map(files.map((file) => [routeFor(file), file]));
const knownRoutes = new Set(pages.keys());
const errors = [];
let anchorCount = 0;
let imageCount = 0;

for (const [route, file] of pages) {
  const html = await readFile(file, "utf8");
  if (!/<meta[^>]+name="viewport"/i.test(html)) {
    errors.push(`${route}: missing responsive viewport metadata`);
  }

  const ids = [...html.matchAll(/<[a-z][^>]*\sid="([^"]+)"[^>]*>/gi)].map((match) => match[1]);
  const idSet = new Set(ids);
  for (const id of idSet) {
    if (ids.filter((candidate) => candidate === id).length > 1) {
      errors.push(`${route}: duplicate id #${id}`);
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    imageCount += 1;
    if (!/\salt="[^"]*"/i.test(match[0])) {
      errors.push(`${route}: image missing alt text`);
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*>/gi)) {
    anchorCount += 1;
    const tag = match[0];
    const href = decode(match[1]);
    if (/\starget="_blank"/i.test(tag) && !/\srel="[^"]*(?:noreferrer|noopener)[^"]*"/i.test(tag)) {
      errors.push(`${route}: new-tab link is missing noreferrer/noopener`);
    }
    if (href.startsWith("#") && href.length > 1 && !idSet.has(href.slice(1))) {
      errors.push(`${route}: broken same-page anchor ${href}`);
      continue;
    }
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const pathname = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    if (!knownRoutes.has(pathname)) {
      errors.push(`${route}: internal route not generated ${pathname}`);
    }
  }
}

if (errors.length) {
  console.error(`Built-site audit failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Built-site audit passed: ${pages.size} pages, ${anchorCount} links, ${imageCount} images.`);
}
