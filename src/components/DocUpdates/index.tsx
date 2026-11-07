import React from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Translate, {translate} from '@docusaurus/Translate';
import {Details} from '@docusaurus/theme-common/Details';
import {useDocById, useLatestVersion} from '@docusaurus/plugin-content-docs/client';
import {
  NEW_BADGE_DAYS,
  UPDATED_BADGE_DAYS,
  countItems,
  docUpdates,
  type DocUpdateEntry,
  type DocUpdateItem,
  type DocUpdateKind,
} from '@site/src/data/docUpdates';
import styles from './styles.module.css';

/** 1エントリで最初から見せるページ数。残りは折りたたむ。 */
const VISIBLE_ITEMS = 6;
/** 最初から展開しておく最低エントリ数。新しい月から順に、この数に届くまで月を展開する。 */
const MIN_OPEN_ENTRIES = 3;

export function KindLabel({kind}: {kind: DocUpdateKind}): ReactNode {
  return (
    <span className={clsx(styles.kind, kind === 'new' ? styles.kindNew : styles.kindUpdated)}>
      {kind === 'new'
        ? translate({id: 'docUpdates.kind.new', message: 'NEW'})
        : translate({id: 'docUpdates.kind.updated', message: '更新'})}
    </span>
  );
}

export function EntryCounts({entry}: {entry: DocUpdateEntry}): ReactNode {
  const {added, updated} = countItems(entry);
  return (
    <span className={styles.counts}>
      {added > 0 && (
        <span className={styles.countNew}>
          {translate({id: 'docUpdates.count.new', message: '新規 {count}'}, {count: added})}
        </span>
      )}
      {updated > 0 && (
        <span className={styles.countUpdated}>
          {translate({id: 'docUpdates.count.updated', message: '更新 {count}'}, {count: updated})}
        </span>
      )}
    </span>
  );
}

function useDocPath(): (id: string) => string {
  const version = useLatestVersion(undefined);
  const paths = new Map(version.docs.map((doc) => [doc.id, doc.path]));
  return (id) => {
    const path = paths.get(id);
    if (!path) throw new Error(`[docUpdates] ドキュメントが見つかりません: ${id}`);
    return path;
  };
}

function ItemRow({item, docPath}: {item: DocUpdateItem; docPath: (id: string) => string}): ReactNode {
  const doc = useDocById(item.doc);
  const to = docPath(item.doc) + (item.hash ? `#${item.hash}` : '');
  return (
    <li className={styles.item}>
      <KindLabel kind={item.kind} />
      <span className={styles.itemBody}>
        <Link to={to} className={styles.itemLink}>
          {doc?.title ?? item.doc}
        </Link>
        {item.note && <span className={styles.itemNote}>{item.note}</span>}
      </span>
    </li>
  );
}

function Entry({entry, docPath}: {entry: DocUpdateEntry; docPath: (id: string) => string}): ReactNode {
  // 新規ページを先に並べる（同じ種類の中では記述順）
  const items = [...entry.items].sort((a, b) => Number(b.kind === 'new') - Number(a.kind === 'new'));
  const visible = items.slice(0, VISIBLE_ITEMS);
  const rest = items.slice(VISIBLE_ITEMS);
  return (
    <article className={styles.entry}>
      <div className={styles.entryMeta}>
        <time dateTime={entry.date} className={styles.date}>
          {entry.date}
        </time>
        <EntryCounts entry={entry} />
      </div>
      <Heading as="h3" id={entry.id} className={styles.entryTitle}>
        {entry.title}
      </Heading>
      {entry.summary && <p className={styles.summary}>{entry.summary}</p>}
      <ul className={styles.items}>
        {visible.map((item) => (
          <ItemRow key={item.doc + (item.hash ?? '')} item={item} docPath={docPath} />
        ))}
      </ul>
      {rest.length > 0 && (
        <Details
          className={styles.more}
          summary={
            <summary>
              {translate({id: 'docUpdates.more', message: 'ほか {count} ページ'}, {count: rest.length})}
            </summary>
          }>
          <ul className={styles.items}>
            {rest.map((item) => (
              <ItemRow key={item.doc + (item.hash ?? '')} item={item} docPath={docPath} />
            ))}
          </ul>
        </Details>
      )}
    </article>
  );
}

interface MonthGroup {
  key: string;
  entries: DocUpdateEntry[];
}

function groupByMonth(entries: DocUpdateEntry[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const entry of entries) {
    const key = entry.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else groups.push({key, entries: [entry]});
  }
  return groups;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return translate(
    {id: 'docUpdates.month', message: '{year}年{month}月'},
    {year, month: String(Number(month))},
  );
}

function MonthSummary({group}: {group: MonthGroup}): ReactNode {
  let added = 0;
  let updated = 0;
  for (const entry of group.entries) {
    const c = countItems(entry);
    added += c.added;
    updated += c.updated;
  }
  return (
    <span className={styles.monthMeta}>
      {translate(
        {id: 'docUpdates.monthMeta', message: '{entries} 件のテーマ（新規 {added}・更新 {updated}）'},
        {entries: group.entries.length, added, updated},
      )}
    </span>
  );
}

/** ドキュメント更新履歴ページの本体 */
export default function DocUpdateLog(): ReactNode {
  const docPath = useDocPath();
  const groups = groupByMonth(docUpdates);
  let shown = 0;
  return (
    <div className={styles.log}>
      <p className={styles.legend}>
        <KindLabel kind="new" />
        <Translate id="docUpdates.legend.new">新しく追加したページ</Translate>
        <KindLabel kind="updated" />
        <Translate id="docUpdates.legend.updated">内容を更新したページ</Translate>
      </p>
      <p className={styles.legendNote}>
        {translate(
          {
            id: 'docUpdates.legend.sidebar',
            message:
              'サイドバーでは、追加から {newDays} 日以内のページに「NEW」、更新から {updatedDays} 日以内のページに点を表示します。折りたたんだカテゴリにも、中に該当ページがあれば表示します。',
          },
          {newDays: NEW_BADGE_DAYS, updatedDays: UPDATED_BADGE_DAYS},
        )}
      </p>
      {groups.map((group) => {
        const open = shown === 0 || shown < MIN_OPEN_ENTRIES;
        shown += group.entries.length;
        const body = group.entries.map((entry) => <Entry key={entry.id} entry={entry} docPath={docPath} />);
        if (open) {
          return (
            <section key={group.key} className={styles.month}>
              <Heading as="h2" id={`m-${group.key}`} className={styles.monthTitle}>
                {monthLabel(group.key)}
                <MonthSummary group={group} />
              </Heading>
              {body}
            </section>
          );
        }
        return (
          <Details
            key={group.key}
            className={clsx(styles.month, styles.monthCollapsed)}
            summary={
              <summary className={styles.monthSummary}>
                <span className={styles.monthSummaryTitle}>{monthLabel(group.key)}</span>
                <MonthSummary group={group} />
              </summary>
            }>
            {body}
          </Details>
        );
      })}
    </div>
  );
}
