import React from 'react';
import { resolveMediaUrl } from '../../services/api';

// Turn YouTube / Vimeo links into embeddable player URLs; anything else is played as a video file
export const getEmbedUrl = (url = '') => {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?rel=0`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
};

export const VideoPlayer = ({ url, title, className = '' }) => {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className={`relative w-full aspect-video overflow-hidden rounded-lg bg-gray-900 ${className}`}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={resolveMediaUrl(url)}
          title={title || 'Video'}
          className="absolute inset-0 h-full w-full object-contain"
          controls
          preload="metadata"
          playsInline
        />
      )}
    </div>
  );
};

// Embed URL for a silent, looping, control-less player (sign-up page)
const getAmbientEmbedUrl = (url = '') => {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (youtube) {
    const id = youtube[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?background=1&autoplay=1&loop=1&muted=1`;
  return null;
};

// YouTube/Vimeo players keep a 16:9 frame (they can't crop to fill like a video file)
export const isEmbeddedVideo = (url = '') => Boolean(getAmbientEmbedUrl(url));

/**
 * Video that plays by itself: muted, looping, no controls or timeline.
 * Fills its container; `fit` is 'cover' (crop to fill) or 'contain' (letterbox).
 */
export const AmbientVideo = ({ url, title, fit = 'cover', className = '' }) => {
  const embedUrl = getAmbientEmbedUrl(url);
  return (
    <div className={`relative w-full overflow-hidden bg-gray-100 ${className}`}>
      {embedUrl ? (
        // pointer-events-none keeps YouTube/Vimeo from showing their hover controls
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          className="pointer-events-none absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
        />
      ) : (
        <video
          src={resolveMediaUrl(url)}
          title={title || 'Video'}
          className={`absolute inset-0 h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
        />
      )}
    </div>
  );
};

export const ImageView = ({ url, alt, className = '' }) => (
  <div className={`w-full overflow-hidden rounded-lg bg-gray-100 ${className}`}>
    <img src={resolveMediaUrl(url)} alt={alt || ''} className="block w-full h-auto max-h-[28rem] object-contain mx-auto" loading="lazy" />
  </div>
);

// One uploaded video (with play controls) or photo
export const MediaView = ({ item, alt, className = '' }) =>
  item.type === 'image'
    ? <ImageView url={item.url} alt={alt} className={className} />
    : <VideoPlayer url={item.url} title={alt} className={className} />;

// Videos/photos of an instruction entry (older entries had a single mediaUrl)
export const getEntryMedia = (entry) => {
  if (entry.media?.length) return entry.media;
  if (entry.mediaUrl && ['video', 'image'].includes(entry.mediaType)) return [{ type: entry.mediaType, url: entry.mediaUrl }];
  return [];
};

// One instruction card: title, subtitle, videos/photos, description
export const InstructionEntryCard = ({ entry, index }) => (
  <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    {(entry.title || entry.subtitle) && (
      <div className="flex items-start gap-3 px-4 pt-4">
        {index !== undefined && (
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
            {index + 1}
          </span>
        )}
        <div className="min-w-0">
          {entry.title && <h3 className="text-sm sm:text-base font-semibold leading-snug text-gray-900">{entry.title}</h3>}
          {entry.subtitle && <p className="mt-0.5 text-xs sm:text-sm text-gray-500">{entry.subtitle}</p>}
        </div>
      </div>
    )}
    {getEntryMedia(entry).length > 0 && (
      <div className="space-y-3 px-4 pt-3">
        {getEntryMedia(entry).map((item, i) => (
          <MediaView key={item._id || `${item.url}-${i}`} item={item} alt={entry.title} />
        ))}
      </div>
    )}
    {entry.description && (
      <p className="px-4 pt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">{entry.description}</p>
    )}
    <div className="h-4" />
  </article>
);

export const VideoCard = ({ video, tone = 'light' }) => (
  <div
    className={`overflow-hidden rounded-xl shadow-sm ${
      tone === 'dark' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white ring-1 ring-gray-200'
    }`}
  >
    <VideoPlayer url={video.url} title={video.title} className="rounded-none" />
    {(video.title || video.description) && (
      <div className="p-3 sm:p-4">
        {video.title && (
          <h4 className={`text-sm sm:text-base font-semibold leading-snug ${tone === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {video.title}
          </h4>
        )}
        {video.description && (
          <p className={`mt-1 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${tone === 'dark' ? 'text-green-100' : 'text-gray-600'}`}>
            {video.description}
          </p>
        )}
      </div>
    )}
  </div>
);

export const TextBlock = ({ block, tone = 'light' }) => (
  <div>
    {block.title && (
      <h4 className={`text-sm sm:text-base font-semibold ${tone === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {block.title}
      </h4>
    )}
    {block.body && (
      <p className={`mt-1 text-sm leading-relaxed whitespace-pre-line ${tone === 'dark' ? 'text-green-100' : 'text-gray-700'}`}>
        {block.body}
      </p>
    )}
  </div>
);
