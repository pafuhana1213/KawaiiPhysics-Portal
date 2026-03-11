import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {translate} from '@docusaurus/Translate';

import styles from './adoption.module.css';

interface GameTitle {
  name: string;
  company?: string;
  videoId?: string;
}

interface YearData {
  year: number;
  titles: GameTitle[];
}

const adoptionData: YearData[] = [
  {
    year: 2026,
    titles: [
      {name: 'ドラゴンクエストVII Reimagined', company: 'SQUARE ENIX', videoId: 'pJJdXusrAzg'},
    ],
  },
  {
    year: 2025,
    titles: [
      {name: 'ゼンシンマシンガール', company: "YUKE'S / D3 PUBLISHER", videoId: 'x4BewvaBCmI'},
      {name: 'SILENT HILL f', company: 'KONAMI', videoId: '0OqTeE3y1x0'},
      {name: 'ソニックレーシング クロスワールド', company: 'SEGA', videoId: 'Ks_Uxuhz6nc'},
      {name: 'METAL GEAR SOLID Δ: SNAKE EATER', company: 'KONAMI', videoId: '6WuqxGg0yek'},
      {name: '餓狼伝説 City of the Wolves', company: 'SNK CORPORATION', videoId: 'uBBsQiifm5w'},
      {name: 'Dolls Nest', company: 'ニトロプラス', videoId: 'XJZ-VX4QSw8'},
      {name: 'Clair Obscur: Expedition 33', company: 'Sandfall Interactive / Kepler Interactive', videoId: 'ejgW-upPMgk'},
      {name: 'Ninja Gaiden 2 Black', company: 'Team NINJA / KOEI TECMO', videoId: '45eAlLDQA6I'},
    ],
  },
  {
    year: 2024,
    titles: [
      {name: 'ロマンシング サガ2 リベンジオブザセブン', company: 'SQUARE ENIX', videoId: 'O56vQEZ_j8w'},
      {name: 'ロリポップチェーンソー RePOP', company: 'Dragami Games', videoId: 'GQfduytrjNI'},
      {name: '聖剣伝説 VISIONS of MANA', company: 'SQUARE ENIX', videoId: 'k7MGvDzHJ00'},
      {name: '真・女神転生V Vengeance', company: 'ATLUS / SEGA', videoId: 'TZaGO8Os_fw'},
      {name: '鳴潮 (Wuthering Waves)', company: 'KURO GAMES', videoId: 'jeIouRAxR1E'},
      {name: 'Stellar Blade', company: 'SHIFT UP', videoId: 'SdfD9pDXvow'},
      {name: 'SAND LAND', company: 'Bandai Namco Entertainment', videoId: 'mOkfVX-eHIQ'},
      {name: 'とらえら / あるびぃ', company: 'MIXI', videoId: 'GIbbEzX96NQ'},
      {name: 'プリンセスピーチ Showtime!', company: 'Nintendo', videoId: 'ZPVuFRzHsFU'},
      {name: 'ペルソナ3 リロード', company: 'ATLUS / SEGA', videoId: 'yQBy6JXQ78U'},
      {name: '呪術廻戦 戦華双乱', company: 'Bandai Namco Entertainment', videoId: 'C06OoAdE7-w'},
      {name: 'TEKKEN 8', company: 'Bandai Namco Entertainment', videoId: 'uspZCOUWfRY'},
    ],
  },
  {
    year: 2023,
    titles: [
      {name: 'グランブルーファンタジーヴァーサス -ライジング-', company: 'Cygames / ARC SYSTEM WORKS', videoId: 'pKKFK-luWOw'},
      {name: 'FREDERICA', company: 'Marvelous', videoId: 'alvGKkvz-a8'},
      {name: 'Lies of P', company: 'NEOWIZ', videoId: 'kXZoKdr-xeo'},
      {name: 'なつもん！ 20世紀の夏休み', company: 'Spike Chunsoft', videoId: '3Ofz97sZ6ZI'},
      {name: '超探偵事件簿 レインコード', company: 'Spike Chunsoft', videoId: 'RGI05R8P_0Y'},
      {name: 'BLUE PROTOCOL', company: 'Bandai Namco Online / Bandai Namco Studios', videoId: 'xtzsuQgSPsU'},
      {name: 'NANASHI Sing up vol.1', company: '774inc.', videoId: 'jHP8bx_IXPQ'},
    ],
  },
  {
    year: 2022,
    titles: [
      {name: 'ドラゴンクエスト トレジャーズ 蒼き瞳と大空の羅針盤', company: 'SQUARE ENIX', videoId: 'lnxdSgrfIFo'},
      {name: 'HARVESTELLA', company: 'SQUARE ENIX', videoId: 'jGrBvKF8xGw'},
      {name: 'ディオフィールドクロニクル', company: 'SQUARE ENIX', videoId: 'MnAkc29rL0U'},
      {name: 'ガンダムエボリューション', company: 'バンダイナムコオンライン', videoId: 'Xll1G4pW4tU'},
      {name: 'Tower of Fantasy（幻塔）', company: 'Hotta Studio / Proxima Beta', videoId: 'hMkJWe4nlIQ'},
      {name: 'THE KING OF FIGHTERS XV', company: 'SNK CORPORATION', videoId: 'VVrjFY7bfn0'},
      {name: 'ブレイブリーデフォルト ブリリアントライツ', company: 'SQUARE ENIX', videoId: 'pyXh2WjCkJA'},
    ],
  },
  {
    year: 2021,
    titles: [
      {name: 'FINAL FANTASY VII THE FIRST SOLDIER', company: 'SQUARE ENIX', videoId: 'VZ4pd8huTzk'},
      {name: '真・女神転生V', company: 'ATLUS / SEGA', videoId: 'bhOp46wNy-Q'},
      {name: 'No More Heroes III', company: 'Marvelous / Grasshopper Manufacture', videoId: 'aTWgYghqaF8'},
      {name: 'SCARLET NEXUS', company: 'Bandai Namco Entertainment', videoId: 'xWC2d0ZrOk4'},
      {name: 'Caligula2', company: 'FURYU Corporation', videoId: 'fngwHf3aIGg'},
      {name: 'BRAVELY DEFAULT II', company: 'SQUARE ENIX', videoId: 'MX1-vxefI6I'},
    ],
  },
  {
    year: 2020,
    titles: [
      {name: '聖剣伝説3 TRIALS of MANA', company: 'SQUARE ENIX', videoId: '_sQhI6W1Vpo'},
    ],
  },
];

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
          <svg viewBox="0 0 68 48" width="68" height="48">
            <path
              d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
              fill="#f00"
            />
            <path d="M 45,24 27,14 27,34" fill="#fff" />
          </svg>
        </div>
      </div>
      <div className={styles.videoInfo}>
        <div className={styles.gameName}>{game.name}</div>
        {game.company && <div className={styles.gameCompany}>{game.company}</div>}
      </div>
    </div>
  );
}

function VideoModal({videoId, onClose}: {videoId: string; onClose: () => void}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
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
              <p>© SQUARE ENIX</p>
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
          <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </main>
    </Layout>
  );
}
