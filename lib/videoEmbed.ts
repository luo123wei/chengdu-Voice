export type VideoEmbed = { type: 'iframe' | 'mp4'; src: string };

/** Pull the YouTube video id out of watch / embed / shorts / share URLs. */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  return m ? m[1] : null;
}

/**
 * Turn a supported video URL into embeddable markup.
 * Supports Bilibili, YouTube and direct MP4/WebM files (e.g. Supabase Storage).
 * Returns null for anything we cannot embed.
 */
export function getVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null;

  const biliMatch = url.match(/bilibili\.com\/video\/(BV\w+)/) || url.match(/b23\.tv\/(\w+)/);
  if (biliMatch) {
    return {
      type: 'iframe',
      src: `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&high_quality=1&autoplay=0`,
    };
  }

  const ytId = getYouTubeId(url);
  if (ytId) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytId}` };
  }

  if (/^https?:\/\/.+\.(mp4|webm)(\?|$)/i.test(url)) {
    return { type: 'mp4', src: url };
  }

  return null;
}
