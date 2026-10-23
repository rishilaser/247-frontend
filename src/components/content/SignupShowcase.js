import React, { useEffect, useState } from 'react';
import { contentAPI, resolveMediaUrl } from '../../services/api';
import { AmbientVideo, isEmbeddedVideo } from './ContentMedia';

// Signup media is the same for every visitor, so fetch it once per page load
let cachedContentPromise = null;
const loadSignupContent = () => {
  if (!cachedContentPromise) {
    cachedContentPromise = contentAPI
      .getContent('signup')
      .then((response) => response.data.content || { media: [] })
      .catch(() => {
        cachedContentPromise = null;
        return { media: [] };
      });
  }
  return cachedContentPromise;
};

const MediaItem = ({ item, fill }) => {
  // One item fills the whole column; several are stacked as large 16:9 tiles
  const canFill = fill && !(item.type === 'video' && isEmbeddedVideo(item.url));
  const frame = canFill ? 'h-full min-h-[18rem]' : 'aspect-video';
  if (item.type === 'image') {
    return (
      <div className={`w-full overflow-hidden rounded-2xl bg-gray-100 ${frame}`}>
        <img src={resolveMediaUrl(item.url)} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return <AmbientVideo url={item.url} className={`rounded-2xl ${frame}`} />;
};

/**
 * Right-hand (desktop) / below-form (mobile) media of the sign-up page.
 * Images and videos are added in Admin → CMS → Signup Page.
 * Pass `media` to render a preview instead of loading the saved content.
 */
const SignupShowcase = ({ media: previewMedia, fill = true }) => {
  const [loadedMedia, setLoadedMedia] = useState(null);

  useEffect(() => {
    if (previewMedia) return undefined;
    let active = true;
    loadSignupContent().then((data) => {
      if (active) setLoadedMedia(data.media || []);
    });
    return () => {
      active = false;
    };
  }, [previewMedia]);

  const media = (previewMedia || loadedMedia || []).filter((item) => item.isActive !== false);
  if (media.length === 0) return null;

  const single = media.length === 1;
  return (
    <div className={`flex w-full flex-col justify-center gap-4 ${single && fill ? 'h-full' : ''}`}>
      {media.map((item, index) => (
        <MediaItem key={item._id || `${item.url}-${index}`} item={item} fill={single && fill} />
      ))}
    </div>
  );
};

export const useSignupMedia = () => {
  const [media, setMedia] = useState(null);
  useEffect(() => {
    let active = true;
    loadSignupContent().then((data) => active && setMedia((data.media || []).filter((item) => item.isActive !== false)));
    return () => {
      active = false;
    };
  }, []);
  return media;
};

export default SignupShowcase;
