'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenTool, Paintbrush, Trash2, Download, Palette, Eraser, Circle, Square, Triangle } from 'lucide-react';
import Link from 'next/link';

type ToolType = 'pen' | 'brush' | 'eraser';
type ShapeType = 'circle' | 'square' | 'triangle' | null;
type Color = string;

const colors: Color[] = [
  '#000000', // Black
  '#FF0000', // Red
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
];

export default function DrawGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>('pen');
  const [shape, setShape] = useState<ShapeType>(null);
  const [color, setColor] = useState<Color>('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const savedCanvasRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight - 100; // Leave space for controls
      }
      
      // Set drawing properties
      if (tool !== 'eraser') {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
      }
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, lineWidth, tool]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: ShapeType, startX: number, startY: number, endX: number, endY: number) => {
    const width = endX - startX;
    const height = endY - startY;

    switch (shape) {
      case 'circle': {
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      }
      case 'square': {
        ctx.beginPath();
        ctx.rect(startX, startY, width, height);
        ctx.stroke();
        break;
      }
      case 'triangle': {
        ctx.beginPath();
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY + height);
        ctx.lineTo(startX + width, startY + height);
        ctx.closePath();
        ctx.stroke();
        break;
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    if (shape) {
      // Save the current canvas state before drawing shape
      savedCanvasRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStartPos({ x, y });
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (shape && startPos && savedCanvasRef.current) {
      // Restore saved canvas and draw shape preview
      ctx.putImageData(savedCanvasRef.current, 0, 0);
      drawShape(ctx, shape, startPos.x, startPos.y, x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing && shape && startPos && e) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && startPos) {
          const { x, y } = getCoordinates(e);
          drawShape(ctx, shape, startPos.x, startPos.y, x, y);
        }
      }
    }
    setIsDrawing(false);
    setStartPos(null);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleToolChange = (newTool: ToolType) => {
    setTool(newTool);
    setShape(null); // Clear shape when switching tools
    if (newTool === 'pen') {
      setLineWidth(2);
    } else if (newTool === 'brush') {
      setLineWidth(10);
    } else if (newTool === 'eraser') {
      setLineWidth(20);
    }
  };

  const handleShapeSelect = (selectedShape: ShapeType) => {
    setShape(selectedShape);
    setTool('pen'); // Reset to pen for shapes
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={false} />
      
      <main className="flex-1 pt-16 px-4 pb-4 sm:pb-6 max-w-7xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Drawing Canvas</h1>
            <Link href="/play-game">
              <Button variant="outline" size="sm">
                Back to Games
              </Button>
            </Link>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Use pen or brush to draw anything you like!
          </p>
        </div>

        <Card className="p-3 sm:p-4 md:p-6">
          {/* Tools and Controls */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 pb-4 border-b">
            {/* Tool Selection */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Tools:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    variant={tool === 'pen' && !shape ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolChange('pen')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Pen</span>
                  </Button>
                  <Button
                    variant={tool === 'brush' && !shape ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolChange('brush')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Paintbrush className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Brush</span>
                  </Button>
                  <Button
                    variant={tool === 'eraser' && !shape ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolChange('eraser')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Eraser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Eraser</span>
                  </Button>
                </div>
              </div>

              {/* Shapes */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Shapes:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    variant={shape === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeSelect(shape === 'circle' ? null : 'circle')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Circle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Circle</span>
                  </Button>
                  <Button
                    variant={shape === 'square' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeSelect(shape === 'square' ? null : 'square')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Square</span>
                  </Button>
                  <Button
                    variant={shape === 'triangle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeSelect(shape === 'triangle' ? null : 'triangle')}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Triangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Triangle</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="flex gap-1 sm:gap-1.5 sm:gap-2 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 transition-all ${
                      color === c ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCanvas}
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Clear</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Download</span>
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-border" style={{ minHeight: '300px', height: 'calc(100vh - 360px)', maxHeight: '600px' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(e);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing(e);
              }}
              className="w-full h-full"
              style={{ 
                touchAction: 'none',
                cursor: tool === 'pen' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'2\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1\'/%3E%3C/svg%3E") 8 8, crosshair' : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'5\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1\'/%3E%3C/svg%3E") 12 12, crosshair'
              }}
            />
          </div>

          {/* Instructions */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong>Tips:</strong> Select Pen (thin), Brush (thick), or Eraser to draw. Choose a shape (Circle, Square, Triangle) and drag to draw it. 
              Select a color from the palette. Click Clear to start over. Use Download to save your drawing.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}

