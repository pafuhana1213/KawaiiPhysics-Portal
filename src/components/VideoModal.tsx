import {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './VideoModal.module.css';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

export default function VideoModal({isOpen, onClose, videoId, title = 'YouTube video'}: VideoModalProps) {
  const {siteConfig} = useDocusaurusContext();
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.modalVideo}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${encodeURIComponent(siteConfig.url)}`}
            title={title}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
