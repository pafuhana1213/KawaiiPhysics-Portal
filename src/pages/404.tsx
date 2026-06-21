import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {translate} from '@docusaurus/Translate';

import styles from './404.module.css';

function HeroSection() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroEmoji}>🐱</div>
      <Heading as="h1" className={styles.heroTitle}>
        {translate({id: 'notFound.title', message: '404'})}
      </Heading>
      <p className={styles.heroSubtitle}>
        {translate({id: 'notFound.subtitle', message: 'このページは逃げちゃいました！'})}
      </p>
      <p className={styles.heroDescription}>
        {translate({
          id: 'notFound.description',
          message: 'お探しのページが見つかりませんでした。',
        })}
      </p>
      <div className={styles.buttonGroup}>
        <a href="/" className={styles.buttonPrimary}>
          {translate({id: 'notFound.home', message: 'ホームへ戻る'})}
        </a>
        <a href="/docs" className={styles.buttonSecondary}>
          {translate({id: 'notFound.docs', message: 'ドキュメントを見る'})}
        </a>
      </div>
    </div>
  );
}

export default function NotFound(): ReactNode {
  return (
    <Layout title={translate({id: 'notFound.title', message: '404'})}>
      <main>
        <HeroSection />
      </main>
    </Layout>
  );
}
