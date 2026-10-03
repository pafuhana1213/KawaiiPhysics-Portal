import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {src: string; alt: string; caption: string; maxWidth?: number};

/** Compact explanatory figure; original image opens for close inspection. */
export default function DocFigure({src, alt, caption, maxWidth = 420}: Props) {
  const url = useBaseUrl(src);
  return (
    <figure className="artist-doc-figure" style={{width: '100%', maxWidth, margin: '1.1rem 0'}}>
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={alt}>
        <img src={url} alt={alt} loading="lazy" style={{display: 'block', width: '100%', height: 'auto', background: 'transparent'}} />
      </a>
      <figcaption style={{fontSize: '.86rem', lineHeight: 1.65, marginTop: '.5rem', color: 'var(--ifm-color-emphasis-700)'}}>{caption}</figcaption>
    </figure>
  );
}
