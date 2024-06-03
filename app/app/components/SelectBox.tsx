import React, { useState } from 'react';
import styles from './SelectBox.css';
interface SelectBoxProps {
  options: string[];
  onSelect: (selectedOption: string) => void;
}

const SelectBox: React.FC<SelectBoxProps> = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedOption(value);
    onSelect(value);
  };

  return (
  <div className={styles.selectContainer}>
      <label htmlFor="select-box" className={styles.label}>Select an option: </label>
      <select
        id="select-box"
        value={selectedOption}
        onChange={handleChange}
        className={styles.selectBox}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;

