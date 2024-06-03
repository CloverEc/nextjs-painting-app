'use client';

import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  onOpenModal: () => void;
}

const Header: React.FC<ModalProps> = ({ onOpenModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="w-full bg-gray-70 dark:bg-gray-800 p-4 flex justify-between items-center shadow-md">
      <Link href="/" passHref className="text-xl font-bold text-gray-100 dark:text-gray-200">
          <svg width="28" height="28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="#e60023" />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              transform="rotate(10 100 100)"
              fontFamily="Brush Script MT, cursive"
              fontSize="180"
              fill="white"
            >
              Ai
            </text>
          </svg>
      </Link>
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="text-gray-800 dark:text-gray-200"
        >
          Menu
        </button>
        {isMenuOpen && (
          <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg">
            <button
              onClick={onOpenModal}
              className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
            >
              Show Modal
            </button>
            <DarkModeToggle />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

