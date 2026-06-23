import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// 英語ブラウザのユーザーが日本語(デフォルトロケール)ページを開いたとき、
// 同じページの英語版を案内する小さなバナーを表示する（強制リダイレクトはしない）。
// Google のガイドラインに沿い、ユーザーの選択を尊重して「提案」に留める方式。
const DISMISS_KEY = 'kp-lang-suggest-dismissed';

function LanguageSuggestionBanner(): ReactNode {
  const {i18n, siteConfig} = useDocusaurusContext();
  const {currentLocale, defaultLocale} = i18n;
  const {baseUrl} = siteConfig;
  const [enUrl, setEnUrl] = useState<string | null>(null);

  useEffect(() => {
    // 英語(en)ページなど、デフォルトロケール以外では出さない
    if (currentLocale !== defaultLocale) {
      return;
    }
    // 一度閉じたら再表示しない（手動で日本語を選んだ意思を尊重）
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        return;
      }
    } catch {
      // localStorage が使えない環境では永続化なしで続行
    }
    // ブラウザ/OS が英語を優先しているか
    const langs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    const prefersEnglish = langs.some(
      (l) => typeof l === 'string' && l.toLowerCase().startsWith('en'),
    );
    if (!prefersEnglish) {
      return;
    }
    // 現在ページの英語版URLを組み立てる（baseUrl 直下の ja パス → /en/ 配下）
    const path = window.location.pathname;
    const rest = path.startsWith(baseUrl) ? path.slice(baseUrl.length) : '';
    setEnUrl(`${baseUrl}en/${rest}${window.location.search}${window.location.hash}`);
  }, [currentLocale, defaultLocale, baseUrl]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setEnUrl(null);
  };

  if (!enUrl) {
    return null;
  }

  return (
    <div
      className="langSuggestBanner"
      role="region"
      aria-label="Language suggestion">
      <span className="langSuggestBanner__text">
        This documentation is also available in English.
      </span>
      <a className="langSuggestBanner__link" href={enUrl} onClick={dismiss}>
        View in English →
      </a>
      <button
        type="button"
        className="langSuggestBanner__close"
        onClick={dismiss}
        aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      <LanguageSuggestionBanner />
      {children}
    </>
  );
}
