import React from 'react';
import styles from './McpWorkflowFigure.module.css';

export default function McpWorkflowFigure({locale = 'ja'}: {locale?: 'ja' | 'en'}) {
  const en = locale === 'en';
  const steps = en
    ? [{label: 'You', detail: 'Natural-language request'}, {label: 'AI assistant', detail: 'Calls supported tools'}, {label: 'Unreal MCP', detail: 'KawaiiPhysicsToolset'}, {label: 'UE Editor', detail: 'Settings · assets · records'}]
    : [{label: 'あなた', detail: '自然言語で依頼'}, {label: 'AIアシスタント', detail: '対応ツールを呼び出す'}, {label: 'Unreal MCP', detail: 'KawaiiPhysicsToolset'}, {label: 'UEエディタ', detail: '設定・アセット・記録'}];
  return <figure className={`artist-doc-figure ${styles.figure}`} data-mcp-workflow>
    <div className={styles.flow}>
      {steps.map((step, index) => <div className={styles.step} key={step.label}>
        <svg viewBox="0 0 100 84" role="img" aria-label={step.label}>
          <title>{step.label}</title>
          {index === 0 && <g stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round">
            <circle cx="30" cy="25" r="12" fill="#cbd5e1" />
            <path d="M14 70 V52 Q14 42 30 42 Q46 42 46 52 V70 Z" fill="#60a5fa" />
            <path d="M55 8 H92 V36 H67 L55 45 Z" fill="none" stroke="#60a5fa" />
            <path d="M64 18 H83 M64 26 H77" fill="none" stroke="#60a5fa" />
          </g>}
          {index === 1 && <g stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
            <rect x="24" y="20" width="52" height="48" rx="8" fill="none" />
            <path d="M34 12 V20 M50 12 V20 M66 12 V20 M34 68 V76 M50 68 V76 M66 68 V76 M16 32 H24 M16 48 H24 M76 32 H84 M76 48 H84" />
            <text x="50" y="52" textAnchor="middle" fill="#60a5fa" stroke="none" fontSize="23" fontWeight="600">AI</text>
          </g>}
          {index === 2 && <g fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 26 H38 V57 H59 M59 26 H83 V57 H59 M38 41 H59" />
            <rect x="6" y="16" width="18" height="20" rx="4" fill="#2dd4bf" stroke="none" />
            <rect x="74" y="16" width="18" height="20" rx="4" fill="#2dd4bf" stroke="none" />
            <circle cx="59" cy="57" r="10" fill="#2dd4bf" stroke="none" />
          </g>}
          {index === 3 && <g fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
            <rect x="9" y="12" width="82" height="59" rx="5" />
            <path d="M9 26 H91" />
            <path d="M26 44 H52 M26 58 H52" stroke="#60a5fa" />
            <circle cx="35" cy="44" r="4" fill="#60a5fa" stroke="none" />
            <circle cx="45" cy="58" r="4" fill="#60a5fa" stroke="none" />
            <path d="M67 38 L77 47 L68 61" stroke="#fb923c" />
            <circle cx="67" cy="38" r="3" fill="#fb923c" stroke="none" />
            <circle cx="77" cy="47" r="3" fill="#fb923c" stroke="none" />
            <circle cx="68" cy="61" r="3" fill="#fb923c" stroke="none" />
          </g>}
        </svg>
        <div className={styles.words}><strong>{step.label}</strong><span>{step.detail}</span></div>
      </div>)}
    </div>
    <figcaption className={styles.caption}>{en ? 'Your request becomes tool calls that change KawaiiPhysics settings or return assets and diagnostic records in UE.' : '依頼を対応ツールの呼び出しに変え、UE内の設定変更やアセット操作、診断・記録の取得を実行します。'}</figcaption>
  </figure>;
}
