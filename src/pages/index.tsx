import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {translate} from '@docusaurus/Translate';

import styles from './index.module.css';
import {adoptionData} from '../data/adoptionData';
import type {GameTitle} from '../data/adoptionData';

const iconStyle = {
  marginRight: '0.5rem',
  verticalAlign: 'middle',
  display: 'inline-block',
};

// GitHub logo SVG
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={iconStyle}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

// Fab logo SVG (store/marketplace icon)
function FabIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={iconStyle}>
      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
    </svg>
  );
}

// Document icon SVG
function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={iconStyle}>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v2H9v-2zm0 4h6v2H9v-2zm0-8h3v2H9V9z"/>
    </svg>
  );
}

// Play icon SVG
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={iconStyle}>
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function VideoModal({isOpen, onClose, videoId}: {isOpen: boolean; onClose: () => void; videoId: string}) {
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
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalVideo}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="KawaiiPhysics Demo"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const videoId = '0f-l-SP07Mo';
  const [showDemo, setShowDemo] = useState(false);

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.videoBackground}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1`}
          title="KawaiiPhysics Demo"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className={styles.videoIframe}
        />
      </div>
      <div className={styles.videoOverlay} />
      <div className={clsx('container', styles.heroContent)}>
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          Kawaii Physics
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--outline button--lg"
            href="https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572">
            <FabIcon />Fab
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://github.com/pafuhana1213/KawaiiPhysics">
            <GitHubIcon />GitHub
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs">
            <DocumentIcon />Document
          </Link>
          <button
            className="button button--outline button--lg"
            onClick={() => setShowDemo(true)}>
            <PlayIcon />Demo
          </button>
        </div>
      </div>
      <VideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} videoId={videoId} />
    </header>
  );
}

interface FeatureItem {
  title: string;
  description: string;
}

const featureList: FeatureItem[] = [
  {
    title: translate({id: 'homepage.feature1.title', message: 'シンプルなセットアップ'}),
    description: translate({
      id: 'homepage.feature1.description',
      message: 'AnimGraph内で1つのノードを追加するだけで、髪や服、アクセサリーに物理挙動を適用。複雑な設定は不要で、すぐに揺れものを実現できます。',
    }),
  },
  {
    title: translate({id: 'homepage.feature2.title', message: '軽量な処理'}),
    description: translate({
      id: 'homepage.feature2.description',
      message: 'PhysXに依存しない独自アルゴリズムにより、低負荷で安定した物理シミュレーションを実現。モバイルを含むあらゆるプラットフォームで安心して使用できます。',
    }),
  },
  {
    title: translate({id: 'homepage.feature3.title', message: '柔軟なカスタマイズ'}),
    description: translate({
      id: 'homepage.feature3.description',
      message: 'コリジョン、カーブ、外部力プリセットなど、豊富なパラメータで細かな挙動調整が可能。Data Assetによる設定の使い回しにも対応しています。',
    }),
  },
];

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          {translate({id: 'homepage.features.title', message: '主な特徴'})}
        </Heading>
        <div className={styles.featureGrid}>
          {featureList.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <Heading as="h3" className={styles.featureTitle}>{feature.title}</Heading>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pick 5 highlighted titles from the adoption data
const highlightedTitles: {game: GameTitle; year: number}[] = [
  {game: adoptionData[0].titles[0], year: 2026}, // ドラゴンクエストVII Reimagined
  {game: adoptionData[1].titles[1], year: 2025}, // SILENT HILL f
  {game: adoptionData[2].titles[9], year: 2024}, // ペルソナ3 リロード
  {game: adoptionData[1].titles[6], year: 2025}, // Clair Obscur
  {game: adoptionData[2].titles[5], year: 2024}, // Stellar Blade
];

function AdoptionHighlightSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className={styles.adoptionSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          {translate({id: 'homepage.adoption.title', message: '採用実績'})}
        </Heading>
        <div className={styles.adoptionGrid}>
          {highlightedTitles.map(({game, year}, idx) => (
            <div
              key={idx}
              className={styles.adoptionCard}
              style={{cursor: game.videoId ? 'pointer' : undefined}}
              onClick={() => game.videoId && setActiveVideo(game.videoId)}
            >
              <div className={styles.adoptionThumbnail}>
                <img
                  src={`https://img.youtube.com/vi/${game.videoId}/mqdefault.jpg`}
                  alt={game.name}
                  loading="lazy"
                />
                {game.videoId && (
                  <div className={styles.adoptionPlayButton}>
                    <svg viewBox="0 0 68 48" width="68" height="48">
                      <path
                        d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                        fill="#f00"
                      />
                      <path d="M 45,24 27,14 27,34" fill="#fff" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.adoptionInfo}>
                <div className={styles.adoptionName}>{game.name}</div>
                <div className={styles.adoptionMeta}>
                  {year} / {game.company}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.adoptionMore}>
          <Link to="/adoption" className={styles.moreLink}>
            {translate({id: 'homepage.adoption.more', message: 'もっと見る'})} &rarr;
          </Link>
        </div>
      </div>
      {activeVideo && (
        <VideoModal isOpen onClose={() => setActiveVideo(null)} videoId={activeVideo} />
      )}
    </section>
  );
}

function VersionInfoSection() {
  return (
    <section className={styles.versionSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          {translate({id: 'homepage.version.title', message: 'バージョン情報'})}
        </Heading>
        <div className={styles.versionGrid}>
          <div className={styles.versionCard}>
            <div className={styles.versionLabel}>
              {translate({id: 'homepage.version.latest', message: '最新バージョン'})}
            </div>
            <div className={styles.versionValue}>1.20.0</div>
          </div>
          <div className={styles.versionCard}>
            <div className={styles.versionLabel}>
              {translate({id: 'homepage.version.ue', message: '対応UEバージョン'})}
            </div>
            <div className={styles.versionValue}>5.3 - 5.7</div>
          </div>
          <div className={styles.versionCard}>
            <div className={styles.versionLabel}>
              {translate({id: 'homepage.version.download', message: 'ダウンロード'})}
            </div>
            <div className={styles.versionLinks}>
              <a
                href="https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.versionLink}
              >
                <FabIcon />Fab
              </a>
              <a
                href="https://github.com/pafuhana1213/KawaiiPhysics"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.versionLink}
              >
                <GitHubIcon />GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="KawaiiPhysics Portal"
      description={translate({id: 'homepage.description', message: 'Unreal Engine向け軽量ボーン物理プラグイン KawaiiPhysics のドキュメント'})}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <AdoptionHighlightSection />
        <VersionInfoSection />
      </main>
    </Layout>
  );
}
