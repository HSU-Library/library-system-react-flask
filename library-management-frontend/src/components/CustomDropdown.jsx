// components/CustomDropdown.jsx
import React, { useState } from 'react';
import '../styles/CustomDropdown.css';

const CustomDropdown = ({ options, selected, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (option) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <div className="custom-dropdown">
      <div
        className="selected"
        onClick={() => setOpen(!open)}
        tabIndex={0}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
      >
        {selected || placeholder}
      </div>
      {open && (
        <ul className="dropdown-menu">
          {options.map((option, idx) => (
            <li
              key={idx}
              className={option === selected ? 'selected-item' : ''}
              onClick={() => handleClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
