'use client';
import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent, FC } from 'react';
import styles from '../../styles/Home.module.css';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promptRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('/blank.png');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // キャンバスのサイズを固定
    const canvasWidth = 512;
    const canvasHeight = 512;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let painting = false;

    const startPainting = (e: MouseEvent) => {
      painting = true;
      draw(e);
    };

    const stopPainting = () => {
      if (painting) {
        saveHistory();
      }
      painting = false;
      context.beginPath();
      const currentPrompt = promptRef.current?.value || '';
      sendDataToServer(currentPrompt);
    };

    const draw = (e: MouseEvent) => {
      if (!painting) return;
      const 

