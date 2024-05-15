import { FC } from 'react';
import styles from '../../../styles/Home.module.css';

interface ControlsProps {
  lineWidth: number;
  strokeStyle: string;
  handleLineWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  clearCanvas: () => void;
  handleUndo: () => void;
}

const Controls: FC<ControlsProps> = ({
  lineWidth,
  strokeStyle,
  handleLineWidthChange,
  handleColorChange,
  handleFileChange,
  fileInputRef,
  clearCanvas,
  handleUndo,
}) => {
  return (
    <div className={styles.controls}>
      <label>
        Size
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={handleLineWidthChange}
          className={styles.rangeInput}
        />
      </label>
      <label className={styles.label}>
        <input
          type="color"
          value={strokeStyle}
          onChange={handleColorChange}
          className={styles.colorInput}
        />
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()} className={styles.button}>
        Upload
      </button>
      <button onClick={clearCanvas} className={styles.button}>Clear</button>
      <button onClick={handleUndo} className={styles.button}>Redo</button>
    </div>
  );
};

export default Controls;

