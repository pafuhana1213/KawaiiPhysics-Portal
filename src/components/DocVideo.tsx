import React, {useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {src: string; poster: string; alt: string; caption: string; maxWidth?: number};

/**
 * Muted looping capture of the sample project.
 * Plays only while on screen, and stays paused for readers who prefer reduced motion.
 */
export default function DocVideo({src, poster, alt, caption, maxWidth = 860}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = useBaseUrl(src);
  const posterUrl = useBaseUrl(poster);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    video.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      {threshold: 0.25},
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="artist-doc-figure" style={{width: '100%', maxWidth, margin: '1.1rem 0'}}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        aria-label={alt}
        muted
        loop
        playsInline
        controls
        preload="none"
        style={{display: 'block', width: '100%', height: 'auto', borderRadius: 6, background: '#10131a'}}
      >
        <a href={videoUrl}>{alt}</a>
      </video>
      <figcaption style={{fontSize: '.86rem', lineHeight: 1.65, marginTop: '.5rem', color: 'var(--ifm-color-emphasis-700)'}}>{caption}</figcaption>
    </figure>
  );
}
