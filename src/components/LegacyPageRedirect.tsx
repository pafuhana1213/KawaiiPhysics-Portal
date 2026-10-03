import React, {useEffect} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import {useLocalizedDocumentUrl} from './LegacyReference';

/** Compatibility route only: content lives on the existing feature page. */
export default function LegacyPageRedirect({to, targets, label}: {
  to: string; targets: Record<string, string>; label: string;
}): React.ReactElement {
  const {hash} = useLocation();
  const history = useHistory();
  let id = '';
  try { id = decodeURIComponent(hash.slice(1)); } catch { /* default section */ }
  const url = useLocalizedDocumentUrl(targets[id] ?? to);
  useEffect(() => { history.replace(url); }, [history, url]);
  return <>
    {Object.keys(targets).map(anchor => <span key={anchor} id={anchor} />)}
    <p><Link to={url}>{label}</Link></p>
  </>;
}
