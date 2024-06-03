// components/ImageComparisonSlider.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { ImgComparisonSlider } from '@img-comparison-slider/react';

interface ImageComparisonSliderProps {
  images: [string, string];
}
const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({images}) => {
  const [firstImage, secondImage] = images;
  return (
    <ImgComparisonSlider>
      <img slot="first" src={firstImage} alt="First Image" />
      <img slot="second" src={secondImage} alt="Second Image" />
    </ImgComparisonSlider>
  );
};

export default ImageComparisonSlider;
