import {useState} from 'react';
import VideoModal from './VideoModal';
import YouTubePlayButton from './YouTubePlayButton';
import styles from './YouTubeThumbnail.module.css';

interface YouTubeThumbnailProps {
  videoId: string;
  title?: string;
  /** Thumbnail quality served by img.youtube.com */
  quality?: 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
}

/**
 * クリックでモーダル再生する YouTube サムネイル。
 * トップページの紹介動画と同じ見た目・挙動を MDX から使えるようにしたもの。
 */
export default function YouTubeThumbnail({
  videoId,
  title = 'YouTube video',
  quality = 'maxresdefault',
}: YouTubeThumbnailProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={styles.thumbnail}
        role="button"
        tabIndex={0}
        aria-label={title}
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div className={styles.thumbnailInner}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/${quality}.jpg`}
            alt={title}
            loading="lazy"
          />
          <div className={styles.playButton}>
            <YouTubePlayButton />
          </div>
        </div>
      </div>
      <VideoModal isOpen={open} onClose={() => setOpen(false)} videoId={videoId} title={title} />
    </>
  );
}
