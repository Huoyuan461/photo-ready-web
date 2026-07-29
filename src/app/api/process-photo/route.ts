import OpenAI, { toFile } from "openai";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";

type ProcessPhotoPayload = {
  image?: string;
  promptFocus?: string;
  preset?: {
    id?: string;
    widthPx?: number;
    heightPx?: number;
    sizeLabel?: string;
    targetRegion?: "us" | "china";
  };
};

type LocalStyleMode =
  | "business-ai"
  | "us-passport-style"
  | "academic"
  | "business";

const DIRECT_AMERICAN_HEADSHOT_PROMPT = [
  "Keep the same person and preserve facial identity, facial structure, hairstyle cues, skin tone, and recognizability.",
  "Allow the model to clearly change the expression, outfit, and pose so the result becomes a polished American professional headshot.",
  "中文：半身职业肖像，蓝色渐变影棚背景，柔和自然光虚化，简约商务装（行政夹克+纯色领带/无袖黑裙），真实肤色清晰对焦，自信微笑，嘴角自然上扬，眼神放松友好，头部轻微侧转，肩膀略微倾斜，接近高级职业头像样片的三分之四角度，高清polished质感，Canon EOS R5，EF 50mm f/1.2L奶油虚化。",
  "英文：American professional headshot, blue textured studio background, soft natural light, business casual, sharp focus on face, warm skin tones, high detail, 8k --ar 4:5.",
  "Match the sample style with a gentle confident smile, slight three-quarter angle, shoulders turned a little, subtle head tilt, premium retouched corporate portrait look, and elegant studio posture.",
  "The final portrait must show a confident smile and a refined studio half-body pose.",
].join(" ");

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported image payload.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function buildPrompt(payload: ProcessPhotoPayload) {
  const sizeLabel = payload.preset?.sizeLabel || "official size";
  const targetRegion = payload.preset?.targetRegion === "china" ? "China" : "the United States";
  const ratioNote =
    payload.preset?.widthPx && payload.preset?.heightPx
      ? `Fit the portrait cleanly into a ${payload.preset.widthPx} x ${payload.preset.heightPx} target crop ratio after generation.`
      : "Keep the portrait centered for a standard official ID crop.";

  return [
    "Use the uploaded person as the only subject and preserve identity, age range, hairstyle, and facial features.",
    payload.promptFocus ||
      "Create an official identification portrait with a plain white background and natural studio lighting.",
    `This output is intended for ${targetRegion} document use in the ${sizeLabel} format.`,
    "Face the camera directly with a calm neutral expression, visible shoulders, realistic skin tone, and clean edges around hair and clothing.",
    "Remove casual background clutter, avoid hats or accessories, and do not add extra people, props, text, or decorative elements.",
    ratioNote,
  ].join(" ");
}

function resolveEditModel() {
  const requested = process.env.OPENAI_IMAGE_MODEL?.trim();
  if (!requested) {
    return "gpt-image-1.5";
  }

  // The official image edit endpoint currently documents GPT Image edit support
  // for gpt-image-1.5 / gpt-image-1 / gpt-image-1-mini / chatgpt-image-latest.
  if (requested === "gpt-image-2") {
    return "gpt-image-1.5";
  }

  return requested;
}

function resolveImageProvider() {
  const provider = process.env.IMAGE_PROVIDER?.trim().toLowerCase();
  if (provider === "local") {
    return "local" as const;
  }

  if (provider === "openai") {
    return "openai" as const;
  }

  if (process.env.ID_ENGINE_URL?.trim()) {
    return "local" as const;
  }

  return "fal" as const;
}

function hasOnlyAscii(value: string) {
  return /^[\x00-\x7F]+$/.test(value);
}

function extractErrorMessage(error: unknown) {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return "OpenAI image editing timed out. Please retry with the compressed upload, or increase OPENAI_IMAGE_TIMEOUT_MS if your network is slow.";
  }

  if (error instanceof OpenAI.APIError) {
    const parts = [
      error.status ? `OpenAI ${error.status}` : "OpenAI request failed",
      error.code ? `code=${error.code}` : null,
      error.type ? `type=${error.type}` : null,
      error.message || null,
    ].filter(Boolean);

    return parts.join(" | ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The image editing request could not be completed.";
}

function resolveLocalStyleModes(payload: ProcessPhotoPayload): LocalStyleMode[] {
  if (payload.preset?.targetRegion === "us") {
    return ["business-ai", "us-passport-style", "business"];
  }

  return ["academic", "business-ai", "business"];
}

function resolveFalPrompt(payload: ProcessPhotoPayload) {
  return [
    payload.promptFocus ||
      "Create a formal official ID portrait with a clean white background.",
    "Keep the same person, facial identity, hairstyle, and clothing style consistent with the uploaded photo.",
    "Use neutral studio lighting, realistic skin tone, a direct front-facing pose, and a calm expression.",
    "Remove background clutter and output a professional passport or ID-photo style result.",
  ].join(" ");
}

async function generateWithFal(payload: ProcessPhotoPayload) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });

  const { mimeType, buffer } = parseDataUrl(payload.image || "");
  const blob = new Blob([buffer], { type: mimeType });
  const uploadUrl = await fal.storage.upload(blob);

  const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      prompt: resolveFalPrompt(payload),
      image_url: uploadUrl,
      num_images: 1,
      output_format: "png",
      sync_mode: false,
      guidance_scale: 3.5,
      enhance_prompt: false,
      safety_tolerance: "2",
    },
    logs: true,
  });

  const outputUrl = result.data?.images?.[0]?.url;
  if (!outputUrl) {
    throw new Error("fal did not return an edited image URL.");
  }

  const remote = await fetch(outputUrl);
  if (!remote.ok) {
    throw new Error(`fal output download failed with ${remote.status}.`);
  }

  const arrayBuffer = await remote.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
}

async function generateWithLocalEngine(payload: ProcessPhotoPayload) {
  const endpoint = process.env.ID_ENGINE_URL?.trim();
  if (!endpoint) {
    throw new Error("ID_ENGINE_URL is not configured.");
  }

  const attemptedModes = resolveLocalStyleModes(payload);
  const failures: string[] = [];

  for (const styleMode of attemptedModes) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: payload.image,
        preset: payload.preset || {},
        background: "#ffffff",
        styleMode,
        prompt: payload.promptFocus
          ? `${DIRECT_AMERICAN_HEADSHOT_PROMPT} Additional instruction: ${payload.promptFocus}`
          : DIRECT_AMERICAN_HEADSHOT_PROMPT,
        format: "single",
        layoutMode: "standard",
      }),
      signal: AbortSignal.timeout(styleMode === "business" ? 120000 : 300000),
    });

    if (!response.ok) {
      failures.push(`${styleMode}: request failed with ${response.status}`);
      continue;
    }

    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      image?: string;
    };

    if (result.ok && result.image) {
      return result.image;
    }

    failures.push(
      `${styleMode}: ${result.error || "Local ID engine did not return an image."}`,
    );
  }

  throw new Error(
    `Local ID engine could not complete the American-style portrait flow. ${failures.join(" | ")}`,
  );
}

export async function POST(request: Request) {
  const provider = resolveImageProvider();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const falKey = process.env.FAL_KEY?.trim();
  const localEndpoint = process.env.ID_ENGINE_URL?.trim();

  if (provider === "local" && !localEndpoint) {
    return Response.json(
      {
        ok: false,
        error:
          "IMAGE_PROVIDER is set to local, but ID_ENGINE_URL is not configured on the server.",
      },
      { status: 503 },
    );
  }

  if (provider === "fal" && !falKey) {
    return Response.json(
      {
        ok: false,
        error:
          "IMAGE_PROVIDER is set to fal, but FAL_KEY is not configured on the server.",
      },
      { status: 503 },
    );
  }

  if (provider === "openai" && !openaiKey) {
    return Response.json(
      {
        ok: false,
        error:
          "IMAGE_PROVIDER is set to openai, but OPENAI_API_KEY is not configured on the server.",
      },
      { status: 503 },
    );
  }

  if (provider === "fal" && falKey && !hasOnlyAscii(falKey)) {
    return Response.json(
      {
        ok: false,
        error:
          "FAL_KEY contains unsupported characters. Please paste the raw ASCII key into .env.local and restart the server.",
      },
      { status: 400 },
    );
  }

  if (provider === "openai" && openaiKey && !hasOnlyAscii(openaiKey)) {
    return Response.json(
      {
        ok: false,
        error:
          "OPENAI_API_KEY contains unsupported characters. Please paste the raw ASCII key into .env.local and restart the server.",
      },
      { status: 400 },
    );
  }

  try {
    const payload = (await request.json()) as ProcessPhotoPayload;

    if (!payload.image) {
      return Response.json(
        { ok: false, error: "Image input is required." },
        { status: 400 },
      );
    }

    let image: string | undefined;
    if (provider === "local") {
      image = await generateWithLocalEngine(payload);
    } else if (provider === "fal") {
      image = await generateWithFal(payload);
    } else {
      const { mimeType, buffer } = parseDataUrl(payload.image);
      const client = new OpenAI({
        apiKey: openaiKey,
        timeout: Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 120000),
        maxRetries: 0,
      });
      const inputFile = await toFile(buffer, "portrait-input.png", {
        type: mimeType,
      });

      const result = await client.images.edit({
        model: resolveEditModel(),
        image: inputFile,
        size:
          payload.preset?.targetRegion === "china" ? "1024x1536" : "1024x1024",
        quality: "high",
        prompt: buildPrompt(payload),
      }, {
        timeout: Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 120000),
      });

      const generated = result.data?.[0];
      image = generated?.b64_json
        ? `data:image/png;base64,${generated.b64_json}`
        : undefined;

      if (!image && generated?.url) {
        const remote = await fetch(generated.url);
        const arrayBuffer = await remote.arrayBuffer();
        image = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      }
    }

    if (!image) {
      throw new Error("The image API did not return an edited image.");
    }

    return Response.json({
      ok: true,
      image,
    });
  } catch (error) {
    console.error("process-photo failed", error);

    return Response.json(
      {
        ok: false,
        error: extractErrorMessage(error),
      },
      { status: 502 },
    );
  }
}
