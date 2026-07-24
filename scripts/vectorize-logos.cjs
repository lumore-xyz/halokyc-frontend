const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const logoDir = path.join(process.cwd(), "public", "assets", "logo");

function pointKey(x, y) {
  return `${x},${y}`;
}

function addEdge(edges, x1, y1, x2, y2) {
  const key = pointKey(x1, y1);
  const next = edges.get(key) ?? [];
  next.push([x2, y2]);
  edges.set(key, next);
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }
  return (
    Math.abs(
      dy * point[0] -
        dx * point[1] +
        end[0] * start[1] -
        end[1] * start[0],
    ) / Math.hypot(dx, dy)
  );
}

function simplify(points, epsilon = 1.1) {
  if (points.length < 4) return points;
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1],
    );
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }
  if (maxDistance <= epsilon) {
    return [points[0], points[points.length - 1]];
  }
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return left.slice(0, -1).concat(right);
}

function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    area += current[0] * next[1] - next[0] * current[1];
  }
  return area / 2;
}

function maskToPath(mask, width, height) {
  const edges = new Map();
  const filled = (x, y) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x] === 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!filled(x, y)) continue;
      if (!filled(x, y - 1)) addEdge(edges, x, y, x + 1, y);
      if (!filled(x + 1, y)) addEdge(edges, x + 1, y, x + 1, y + 1);
      if (!filled(x, y + 1)) addEdge(edges, x + 1, y + 1, x, y + 1);
      if (!filled(x - 1, y)) addEdge(edges, x, y + 1, x, y);
    }
  }

  const loops = [];
  while (edges.size > 0) {
    const firstEntry = edges.entries().next().value;
    if (!firstEntry) break;
    const [startKey, destinations] = firstEntry;
    const [startX, startY] = startKey.split(",").map(Number);
    const points = [[startX, startY]];
    let currentKey = startKey;
    let guard = 0;

    while (guard < width * height * 4) {
      guard += 1;
      const options = edges.get(currentKey);
      if (!options?.length) break;
      const next = options.pop();
      if (options.length === 0) edges.delete(currentKey);
      points.push(next);
      currentKey = pointKey(next[0], next[1]);
      if (currentKey === startKey) break;
    }

    if (points.length > 4) {
      const closed = points.slice(0, -1);
      if (Math.abs(polygonArea(closed)) >= 18) {
        loops.push(simplify(closed.concat([closed[0]])));
      }
    }
  }

  return loops
    .map((loop) => {
      const [first, ...rest] = loop;
      return `M${first[0]} ${first[1]}${rest
        .map(([x, y]) => `L${x} ${y}`)
        .join("")}Z`;
    })
    .join("");
}

function makeMask(data, width, height, classify, target) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const pixel = {
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
      a: data[offset + 3],
    };
    if (pixel.a > 20 && classify(pixel) === target) mask[i] = 1;
  }
  return mask;
}

function bluePixel({ r, g, b }) {
  return b > 110 && g > 40 && b - r > 45;
}

const variants = [
  {
    input: "halokyc-color-icon.png",
    output: "halokyc-color-icon.svg",
    title: "HaloKYC color icon",
    groups: ["blue"],
    classify: () => "blue",
  },
  {
    input: "halokyc-icon.png",
    output: "halokyc-icon.svg",
    title: "HaloKYC icon for light surfaces",
    groups: ["paper", "navy", "blue"],
    classify(pixel) {
      const luminosity =
        pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      if (bluePixel(pixel) && luminosity > 65) return "blue";
      if (luminosity > 155) return "paper";
      return "navy";
    },
  },
  {
    input: "halokyc-hr-dark.png",
    output: "halokyc-hr-dark.svg",
    title: "HaloKYC horizontal logo for light surfaces",
    groups: ["navy", "blue"],
    classify: (pixel) => (bluePixel(pixel) ? "blue" : "navy"),
  },
  {
    input: "halokyc-hr-light.png",
    output: "halokyc-hr-light.svg",
    title: "HaloKYC horizontal logo for dark surfaces",
    groups: ["paper", "blue"],
    classify: (pixel) => (bluePixel(pixel) ? "blue" : "paper"),
  },
];

const fills = {
  blue: "url(#blue)",
  navy: "url(#navy)",
  paper: "url(#paper)",
};

async function vectorize(variant) {
  const source = path.join(logoDir, variant.input);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const paths = variant.groups
    .map((group) => {
      const mask = makeMask(
        data,
        info.width,
        info.height,
        variant.classify,
        group,
      );
      const pathData = maskToPath(mask, info.width, info.height);
      return `  <path fill="${fills[group]}" fill-rule="evenodd" d="${pathData}"/>`;
    })
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${info.width} ${info.height}">
  <title>${variant.title}</title>
  <defs>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d6f15a"/>
      <stop offset="1" stop-color="#c8e64f"/>
    </linearGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#173426"/>
      <stop offset="1" stop-color="#10271c"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf8ef"/>
      <stop offset="1" stop-color="#f7f3e8"/>
    </linearGradient>
  </defs>
${paths}
</svg>
`;

  await fs.writeFile(path.join(logoDir, variant.output), svg, "utf8");
  console.log(`${variant.output}: ${info.width}x${info.height}`);
}

Promise.all(variants.map(vectorize)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
