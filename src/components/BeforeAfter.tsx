import {useState, useCallback} from 'react';
import styles from './BeforeAfter.module.css';

interface BeforeAfterProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPosition(Number(e.target.value));
    },
    [],
  );

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img src={after} alt={afterLabel} className={styles.imageAfter} />
        <img
          src={before}
          alt={beforeLabel}
          className={styles.imageBefore}
          style={{clipPath: `inset(0 ${100 - position}% 0 0)`}}
        />
        <div className={styles.divider} style={{left: `${position}%`}}>
          <div className={styles.dividerLine} />
          <div className={styles.dividerHandle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="6,4 2,10 6,16" />
              <polyline points="14,4 18,10 14,16" />
            </svg>
          </div>
        </div>
        <span className={styles.labelBefore}>{beforeLabel}</span>
        <span className={styles.labelAfter}>{afterLabel}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={handleChange}
        className={styles.slider}
        aria-label="Before/After comparison slider"
      />
    </div>
  );
}
