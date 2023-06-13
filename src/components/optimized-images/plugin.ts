import { type PluginOption } from "vite";
let allImagesCache: Set<string> = new Set<string>();
export const OPTIMIZED_LOCATION = "/_image";
export function optimizedImagesPlugin(): PluginOption {
  return {
    name: "optimized-images",
    buildStart() {
      findAllImages("public", OPTIMIZED_LOCATION).then(async (allImages) => {
        console.log("allImages", allImages);
        allImagesCache = allImages;
        const fs = await import("fs");
        // const path = await import("path");
        fs.watch("public", { recursive: true }, async () => {
          const updatedImages = await findAllImages("public");
          if (areEqual(allImagesCache, updatedImages)) {
            return;
          }
          allImagesCache = updatedImages;
          // if (!fs.existsSync(path.join("public", OPTIMIZED_LOCATION))) {
          //   fs.mkdirSync(path.join("public", OPTIMIZED_LOCATION));
          // }
          //const sharp = await import("sharp");
          let typeString = `export type ImagePath = `;
          allImagesCache.forEach((image) => {
            typeString += `| "${image
              .replace("public", "")
              .replaceAll("\\", "/")}"`;
          });
          if (!fs.existsSync("src/components/optimized-images")) {
            fs.mkdirSync("src/components/optimized-images");
          }
          fs.writeFileSync(
            "src/components/optimized-images/image-paths.d.ts",
            typeString
          );
        });
      });
    },
  };
}

async function findAllImages(dir: string, ignore?: string) {
  const fs = await import("fs");
  const path = await import("path");
  const images = new Set<string>();
  const pathifiedIgnore = path.join(dir, ignore || "");
  async function _findAllImages(dir: string, images: Set<string>) {
    if (ignore && dir.startsWith(pathifiedIgnore)) {
      console.log("ignore");
      return;
    }
    fs.readdirSync(dir).forEach(async (file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        await _findAllImages(filePath, images);
      } else {
        if (
          filePath.endsWith(".png") ||
          filePath.endsWith(".jpg") ||
          filePath.endsWith(".jpeg")
        ) {
          images.add(filePath);
        }
      }
    });
  }
  await _findAllImages(dir, images);
  return images;
}

function areEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const aItem of a) {
    if (!b.has(aItem)) return false;
  }
  return true;
}
