import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {translate} from '@docusaurus/Translate';

import styles from './adoption.module.css';
import {adoptionData} from '../data/adoptionData';
import type {GameTitle, YearData} from '../data/adoptionData';
import VideoModal from '../components/VideoModal';
import YouTubePlayButton from '../components/YouTubePlayButton';

// Featured titles for the hero section
const featuredVideoIds = [
  'O56vQEZ_j8w', // ロマサガ2
  'yQBy6JXQ78U', // P3R
  'uspZCOUWfRY', // TEKKEN 8
  'kXZoKdr-xeo', // Lies of P
  '6WuqxGg0yek', // MGS Delta
  '0OqTeE3y1x0', // SILENT HILL f
];

function VideoCard({game, onPlay}: {game: GameTitle; onPlay: (videoId: string) => void}) {
  if (!game.videoId) {
    return (
      <div className={styles.videoCard}>
        <div className={styles.noVideo}>
          <span>{game.name}</span>
        </div>
        <div className={styles.videoInfo}>
          <div className={styles.gameName}>{game.name}</div>
          {game.company && <div className={styles.gameCompany}>{game.company}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.videoCard} onClick={() => onPlay(game.videoId!)}>
      <div className={styles.thumbnail}>
        <img
          src={`https://img.youtube.com/vi/${game.videoId}/mqdefault.jpg`}
          alt={game.name}
          loading="lazy"
        />
        <div className={styles.playButton}>
          <YouTubePlayButton />
        </div>
      </div>
      <div className={styles.videoInfo}>
        <div className={styles.gameName}>{game.name}</div>
        {game.company && <div className={styles.gameCompany}>{game.company}</div>}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroBackground}>
        {featuredVideoIds.map((id, index) => (
          <img
            key={id}
            src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            className={styles.heroBgImage}
            style={{animationDelay: `${index * 5}s`}}
            loading={index === 0 ? undefined : 'lazy'}
          />
        ))}
      </div>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>
          {translate({id: 'adoption.title', message: '採用実績'})}
        </Heading>
        <p className={styles.heroSubtitle}>
          {translate({
            id: 'adoption.heroText',
            message: '多くの素晴らしいプロジェクトで採用されています！',
          })}
        </p>
      </div>
    </div>
  );
}

function YearSection({
  data,
  onPlay,
}: {
  data: YearData;
  onPlay: (videoId: string) => void;
}) {
  return (
    <div className={styles.yearSection}>
      <Heading as="h2" className={styles.yearTitle}>
        {data.year}
        <span className={styles.titleCount}>({data.titles.length})</span>
      </Heading>
      <div className={styles.videoGrid}>
        {data.titles.map((game, index) => (
          <VideoCard key={index} game={game} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
}

export default function AdoptionPage(): ReactNode {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <Layout
      title={translate({id: 'adoption.title', message: '採用実績'})}
      description={translate({
        id: 'adoption.description',
        message: 'KawaiiPhysicsを採用いただいた商用タイトル一覧',
      })}>
      <main>
        <HeroSection />

        <div className={clsx('container', styles.content)}>
          <div className={styles.callout}>
            <p className={styles.calloutText}>
              {translate({
                id: 'adoption.callout.line1',
                message:
                  'すべての作品を把握しきれていないため、ご採用いただいた際にはぜひご連絡ください。',
              })}
              <br />
              {translate({
                id: 'adoption.callout.line2',
                message:
                  '開発者の方でなくても、ゲームのライセンス表記などで見かけた際はお知らせいただけると嬉しいです。',
              })}
            </p>
            <div className={styles.calloutButtons}>
              <a
                href="https://github.com/pafuhana1213/KawaiiPhysics/discussions/65"
                className={styles.calloutButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate({id: 'adoption.callout.reportGithub', message: 'GitHub で報告'})}
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSch6P1V9F0g2Ff_mD-NliharAEy_1emFGMkKZAXytFaLsQKJg/viewform?usp=send_form"
                className={styles.calloutButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate({id: 'adoption.callout.reportForm', message: 'フォームで報告'})}
              </a>
            </div>
          </div>

          {adoptionData.map((yearData) => (
            <YearSection key={yearData.year} data={yearData} onPlay={setActiveVideo} />
          ))}

          <div className={styles.note}>
            <p>
              {translate({
                id: 'adoption.note',
                message:
                  '※ 公開情報をもとに作成しています。掲載内容に問題がある場合はお知らせください。',
              })}
            </p>
          </div>

          <div className={styles.copyrights}>
            <Heading as="h2" className={styles.copyrightsTitle}>
              {translate({id: 'adoption.copyrights', message: '著作権表示'})}
            </Heading>
            <div className={styles.copyrightsList}>
              <p>
                (C) 2026 MARVEL
                <br />
                (C)2026 Sony Interactive Entertainment Inc.
                <br />
                Developed by ARC SYSTEM WORKS CO., LTD
              </p>
              <p>© 2026 Fictions, Inc. All other marks and trademarks are the property of their respective owners. All rights reserved.</p>
              <p>© SQUARE ENIX</p>
              <p>© Netmarble Corp. All Rights Reserved.</p>
              <p>© Hotta Studio, a Perfect World company. All Rights Reserved.</p>
              <p>©SEGA. All rights reserved.</p>
              <p>©Konami Digital Entertainment</p>
              <p>© SNK CORPORATION ALL RIGHTS RESERVED.</p>
              <p>©Nitroplus</p>
              <p>©2025 Sandfall Interactive SAS - Published by Kepler Interactive Limited.</p>
              <p>©KOEI TECMO GAMES. All rights reserved.</p>
              <p>©2025 YUKE'S ©2025 D3PUBLISHER</p>
              <p>©2024 Kadokawa Games / Dragami Games</p>
              <p>©ATLUS ©SEGA All rights reserved.</p>
              <p>©KURO GAMES. ALL RIGHTS RESERVED.</p>
              <p>©2024 SHIFT UP Corporation</p>
              <p>©バード・スタジオ／集英社 ©Bandai Namco Entertainment Inc.</p>
              <p>©Nintendo</p>
              <p>©Bandai Namco Entertainment Inc.</p>
              <p>©Cygames, Inc. Developed by ARC SYSTEM WORKS</p>
              <p>©2023 Marvelous Inc.</p>
              <p>© NEOWIZ. All Rights Reserved.</p>
              <p>©2023 TOYBOX Inc./Millennium Kitchen Co., Ltd</p>
              <p>©Spike Chunsoft Co., Ltd. All Rights Reserved.</p>
              <p>©BANDAI NAMCO Online Inc. ©BANDAI NAMCO Studios Inc.</p>
              <p>©774inc.</p>
              <p>© 2022 ARMOR PROJECT/BIRD STUDIO/SQUARE ENIX</p>
              <p>© 2022 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
              <p>© 2022 SQUARE ENIX CO., LTD. All Rights Reserved. © Silvertone, Inc.</p>
              <p>©創通・サンライズ ©創通・サンライズ・MBS</p>
              <p>©2022 Proxima Beta Pte. Ltd. All rights reserved. ©Hotta Studio.</p>
              <p>©1997, 2021 SQUARE ENIX CO., LTD. All Rights Reserved.</p>
              <p>©Marvelous Inc. Developed by Grasshopper Manufacture Inc.</p>
              <p>SCARLET NEXUS & ©BANDAI NAMCO Entertainment Inc.</p>
              <p>© FURYU Corporation.</p>
              <p>© 1995, 2020 SQUARE ENIX CO.,LTD. All Rights Reserved.</p>
              <p>©MIXI</p>
            </div>
          </div>
        </div>

        {activeVideo && (
          <VideoModal isOpen onClose={() => setActiveVideo(null)} videoId={activeVideo} />
        )}
      </main>
    </Layout>
  );
}
