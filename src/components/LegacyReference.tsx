import React, {useEffect} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function useLocalizedDocumentUrl(url: string): string {
  const {i18n: {currentLocale, defaultLocale}} = useDocusaurusContext();
  const prefix = `/${currentLocale}/`;
  const relative = currentLocale !== defaultLocale && url.startsWith(prefix)
    ? url.slice(currentLocale.length + 1) : url;
  return useBaseUrl(relative);
}

/** Preserve old section URLs while linking to the corresponding reference. */
export default function LegacyReference({targets, to, label, redirect = false, renderAnchors = true}: {
  targets: Record<string, string>;
  to: string;
  label: string;
  redirect?: boolean;
  renderAnchors?: boolean;
}): React.ReactElement {
  const {hash} = useLocation();
  const history = useHistory();
  let id = '';
  try { id = decodeURIComponent(hash.slice(1)); } catch { /* use the index */ }
  const isOldSection = Object.prototype.hasOwnProperty.call(targets, id);
  const url = useLocalizedDocumentUrl(isOldSection ? targets[id] : to);
  useEffect(() => {
    if (redirect && isOldSection) history.replace(url);
  }, [redirect, isOldSection, history, url]);
  return (
    <div style={{position: 'relative'}}>
      {renderAnchors && Object.keys(targets).map(anchor => (
        <span key={anchor} id={anchor} aria-hidden="true" style={{
          position: 'absolute', top: 0, width: 1, height: 1,
          scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)',
        }} />
      ))}
      {isOldSection && <p><Link to={url}>{label}</Link></p>}
    </div>
  );
}
