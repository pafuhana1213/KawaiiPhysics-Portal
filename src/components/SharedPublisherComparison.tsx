import React, {useId} from 'react';
import styles from './SharedPublisherComparison.module.css';

type Props = {locale?: 'ja' | 'en'};

// Reuse the exact body silhouette to distinguish exposed and occluded cape edges.
function CharacterBody({silhouette}: {silhouette?: string}) {
  return <g data-character-body={silhouette ? undefined : true} stroke={silhouette ?? '#64748b'} strokeWidth="2" strokeLinejoin="round">
    <path d="M91 205 L90 274 M116 205 L123 274" fill="none" stroke={silhouette ?? '#94a3b8'} strokeWidth="15" strokeLinecap="round" />
    <path d="M85 133 L74 198 M116 134 L145 184" fill="none" stroke={silhouette ?? '#94a3b8'} strokeWidth="12" strokeLinecap="round" />
    <path d="M88 116 L117 116 L125 200 L80 200 Z" fill={silhouette ?? '#cbd5e1'} />
    <path d="M81 192 L125 192 L141 244 L65 244 Z" fill={silhouette ?? '#2dd4bf'} />
    <circle cx="102" cy="88" r="24" fill={silhouette ?? '#cbd5e1'} />
    <path d="M77 88 Q68 51 101 51 Q126 49 130 79 L145 112 L121 107 L117 80 Q99 84 84 72 L83 110 L69 109 Z" fill={silhouette ?? '#60a5fa'} />
  </g>;
}

/** Same character and parts in each panel; only the wind-setting source changes. */
export default function SharedPublisherComparison({locale = 'ja'}: Props) {
  const figureId = useId().replace(/:/g, '');
  const capePath = 'M115 121 L151 139 L141 201 L119 186 Z';
  const en = locale === 'en';
  const labels = en
    ? {before: 'Wind set on each part', after: 'One shared wind setup', hair: 'Hair', cape: 'Cape', skirt: 'Skirt', wind: 'Wind', copy: 'Edit 3 setups', shared: 'Edit 1 setup', caption: 'Direction and strength come from one Publisher. Hair softness and clothing motion remain adjustable on each Kawaii Physics node.'}
    : {before: '部位ごとに風を設定', after: '共通の風を1か所で設定', hair: '髪', cape: 'マント', skirt: '服', wind: '風の設定', copy: '3か所を変更', shared: '1か所を変更', caption: '風向き・強さはPublisherで共通化。髪の柔らかさや服の揺れ方は、各Kawaii Physicsノードで個別に調整できます。'};
  const parts = [{name: labels.hair, y: 84, color: '#60a5fa'}, {name: labels.cape, y: 160, color: '#fb923c'}, {name: labels.skirt, y: 236, color: '#2dd4bf'}];
  return (
    <figure className={`artist-doc-figure ${styles.figure}`} data-publisher-comparison>
      <div className={styles.panels}>
        {[false, true].map(shared => (
          <div key={String(shared)} className={styles.panel}>
            <p className={styles.heading}><span className={styles.badge}>{shared ? 'After' : 'Before'}</span>{shared ? labels.after : labels.before}</p>
            <svg viewBox="0 0 320 306" role="img" aria-label={`${shared ? 'After' : 'Before'}: ${shared ? labels.after : labels.before}`}>
              <title>{shared ? labels.after : labels.before}</title>
              <desc>{shared ? (en ? 'One Publisher sends common wind to the same hair, cape, and skirt.' : '同じ髪・マント・服へ、1つのPublisherから共通の風を渡す。') : (en ? 'Three identical wind setups, one for each hair, cape, and skirt mesh.' : '髪・マント・服の各メッシュに同じ風を個別設定する。')}</desc>
              <defs>
                <mask id={`${figureId}-${shared}-cape-visible`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="306">
                  <rect width="320" height="306" fill="white" />
                  <CharacterBody silhouette="black" />
                </mask>
                <mask id={`${figureId}-${shared}-cape-hidden`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="306">
                  <rect width="320" height="306" fill="black" />
                  <CharacterBody silhouette="white" />
                </mask>
              </defs>
              {/* Identical flat character in both panels. */}
              <g data-character>
                <path data-cape-fill d={capePath} fill="#fb923c" />
                <CharacterBody />
                <path data-cape-exposed d={capePath} fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" mask={`url(#${figureId}-${shared}-cape-visible)`} />
                <path data-cape-hidden d={capePath} fill="none" stroke="#d97424" strokeWidth="2" strokeDasharray="3 3" strokeLinejoin="round" mask={`url(#${figureId}-${shared}-cape-hidden)`} />
              </g>
              {parts.map(p => <g key={p.name}><circle cx="12" cy={p.y} r="4" fill={p.color} /><text x="23" y={p.y + 6} className={styles.partLabel}>{p.name}</text></g>)}
              {/* Source-to-part arrows, with no arrows representing physical motion. */}
              <g fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {shared && <path d="M187 160 H172 M172 84 V236" />}
                {parts.map(p => <g key={p.y}><path d={`M${shared ? 172 : 187} ${p.y} H153`} /><path d={`M159 ${p.y - 4} L153 ${p.y} L159 ${p.y + 4}`} /></g>)}
              </g>
              {shared ? <g>
                <rect x="187" y="131" width="125" height="58" rx="7" fill="none" stroke="#2dd4bf" strokeWidth="2" />
                <text x="249" y="153" textAnchor="middle" className={styles.sourceLabel}>Publisher</text>
                <text x="249" y="176" textAnchor="middle" className={styles.sourceLabel}>{labels.wind}</text>
              </g> : parts.map(p => <g key={p.y}>
                <rect x="187" y={p.y - 22} width="125" height="44" rx="7" fill="none" stroke={p.color} strokeWidth="2" />
                <text x="249" y={p.y + 6} textAnchor="middle" className={styles.sourceLabel}>{labels.wind}</text>
              </g>)}
              <text x="160" y="303" textAnchor="middle" className={styles.summary}>{shared ? labels.shared : labels.copy}</text>
            </svg>
          </div>
        ))}
      </div>
      <figcaption className={styles.caption}>{labels.caption}</figcaption>
    </figure>
  );
}
