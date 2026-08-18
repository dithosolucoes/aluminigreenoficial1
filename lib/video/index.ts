/**
 * Adaptador de vídeo — Bunny Stream em produção, simulado em modo mock.
 *
 * O sistema todo fala com este arquivo. Em modo mock nada sai para a internet:
 * os mesmos campos são preenchidos com valores falsos e gravados no banco
 * exatamente como o Bunny gravaria, então o restante do código não percebe
 * diferença nenhuma quando a chave real entrar.
 */

import { MOCK_MODE, config } from '@/lib/config';

export interface VideoAssetResult {
  provider: 'BUNNY' | 'MOCK';
  assetId: string;
  playbackId: string;
  libraryId: string;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
}

const BUNNY_API = 'https://video.bunnycdn.com/library';

/** Vídeos de demonstração usados em modo mock (domínio público). */
const MOCK_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
];

function bunnyHeaders() {
  return {
    AccessKey: config.video.apiKey,
    'Content-Type': 'application/json',
  };
}

/* -------------------------------------------------------------------------- */
/* Criar / enviar                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Recebe a URL de um arquivo já enviado (UploadThing) e manda o Bunny buscar.
 * Retorna imediatamente — a codificação é assíncrona, o status vira READY
 * depois (verificado por getStatus ou por webhook do Bunny).
 */
export async function createVideo(opts: {
  title: string;
  sourceUrl: string;
}): Promise<VideoAssetResult> {
  if (MOCK_MODE) {
    const fake = Math.random().toString(36).slice(2, 10);
    // Em mock o "playbackId" é a própria URL do vídeo de demonstração,
    // sorteada de forma estável a partir do título para que a mesma aula
    // mostre sempre o mesmo vídeo.
    const idx =
      Math.abs(
        opts.title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      ) % MOCK_VIDEOS.length;

    return {
      provider: 'MOCK',
      assetId: `mock_${fake}`,
      playbackId: MOCK_VIDEOS[idx],
      libraryId: 'mock-library',
      status: 'READY',
    };
  }

  const libraryId = config.video.libraryId;

  // 1) cria o registro do vídeo na library
  const createRes = await fetch(`${BUNNY_API}/${libraryId}/videos`, {
    method: 'POST',
    headers: bunnyHeaders(),
    body: JSON.stringify({ title: opts.title }),
  });

  if (!createRes.ok) {
    throw new Error(`Bunny: falha ao criar vídeo (${createRes.status})`);
  }

  const created = (await createRes.json()) as { guid: string };

  // 2) manda o Bunny baixar o arquivo da URL de origem
  const fetchRes = await fetch(
    `${BUNNY_API}/${libraryId}/videos/${created.guid}/fetch`,
    {
      method: 'POST',
      headers: bunnyHeaders(),
      body: JSON.stringify({ url: opts.sourceUrl }),
    }
  );

  if (!fetchRes.ok) {
    throw new Error(`Bunny: falha ao importar vídeo (${fetchRes.status})`);
  }

  return {
    provider: 'BUNNY',
    assetId: created.guid,
    playbackId: created.guid,
    libraryId,
    status: 'PROCESSING',
  };
}

/* -------------------------------------------------------------------------- */
/* Apagar                                                                      */
/* -------------------------------------------------------------------------- */

export async function deleteVideo(assetId: string, libraryId?: string | null) {
  if (MOCK_MODE) return;

  const lib = libraryId || config.video.libraryId;
  await fetch(`${BUNNY_API}/${lib}/videos/${assetId}`, {
    method: 'DELETE',
    headers: bunnyHeaders(),
  }).catch(() => {
    // Apagar vídeo não deve derrubar a exclusão do curso.
  });
}

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

/** Bunny: 0 fila · 1 processando · 2 codificando · 3/4 pronto · 5 falhou */
export async function getStatus(
  assetId: string,
  libraryId?: string | null
): Promise<VideoAssetResult['status']> {
  if (MOCK_MODE) return 'READY';

  const lib = libraryId || config.video.libraryId;
  const res = await fetch(`${BUNNY_API}/${lib}/videos/${assetId}`, {
    headers: bunnyHeaders(),
  });

  if (!res.ok) return 'FAILED';

  const data = (await res.json()) as { status: number };
  if (data.status >= 3 && data.status <= 4) return 'READY';
  if (data.status === 5) return 'FAILED';
  return 'PROCESSING';
}

/* -------------------------------------------------------------------------- */
/* Reprodução                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * URL que o player consome.
 * Em mock é um .mp4 tocado por <video>. Em produção é o iframe do Bunny.
 */
export function getPlaybackUrl(asset: {
  provider: string;
  playbackId?: string | null;
  libraryId?: string | null;
}): string {
  if (asset.provider === 'MOCK' || MOCK_MODE) {
    return asset.playbackId || MOCK_VIDEOS[0];
  }

  const lib = asset.libraryId || config.video.libraryId;
  return `https://iframe.mediadelivery.net/embed/${lib}/${asset.playbackId}?autoplay=false&preload=true`;
}
