// src/utils/videoFormatting.ts

export const formatEmbedUrl = (url: string, platform: string): string => {
  if (!url) return '';

  try {
    if (platform === 'youtube') {
      // Captura o ID de links como: watch?v=, youtu.be/, shorts/, embed/
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (platform === 'tiktok') {
      // Captura o ID do vídeo da URL padrão do TikTok
      const regExp = /video\/(\d+)/;
      const match = url.match(regExp);
      const videoId = match ? match[1] : null;
      return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
    }

    if (platform === 'instagram') {
      // Captura o ID do post/reel
      const regExp = /(?:p|reel)\/([a-zA-Z0-9_-]+)/;
      const match = url.match(regExp);
      const postId = match ? match[1] : null;
      return postId ? `https://www.instagram.com/p/${postId}/embed` : url;
    }
  } catch (error) {
    console.error('Erro ao formatar URL do vídeo:', error);
  }

  return url;
};
