import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, FC, MouseEvent } from 'react';

interface Shape {
  type: 'circle' | 'rectangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  isDragging: boolean;
  isResizing: boolean;
}

interface Canvas2Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}



const Canvas2 = forwardRef((props: Canvas2Props, ref) => {
  const { canvasRef } = props;
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [backgroundShapes, setBackgroundShapes] = useState<Shape[]>([]);
  const [currentTool, setCurrentTool] = useState<'select' | 'circle' | 'rectangle'>('select');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [resizingCorner, setResizingCorner] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF'); // Add background color state
  useImperativeHandle(ref, () => ({
    setCurrentTool,
    setCurrentColor,
    deleteShape,
    handleMouseDown,
    handleMouseMove,
    fillCanvas,  // Expose the fillCanvas function
    handleMouseUp,
  }));

  const fillCanvas = () => {
	  const backgroundShape: Shape = {
		  type: 'rectangle',
		  x: 0,
		  y: 0,
		  width: 512,
		  height: 512,
		  color: currentColor,
		  isDragging: false,
		  isResizing: false,
	  };
	  setBackgroundShapes([backgroundShape]); // Update this line
  };

  useEffect(() => {
    if (!canvasRef) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawShapes = () => {
	    context.clearRect(0, 0, canvas.width, canvas.height);

	    // Draw background shapes first
	    backgroundShapes.forEach((shape) => {
		    context.fillStyle = shape.color;
		    if (shape.type === 'rectangle') {
			    context.fillRect(shape.x, shape.y, shape.width!, shape.height!);
		    }
	    });

	    // Draw foreground shapes
	    shapes.forEach((shape, index) => {
		    context.fillStyle = shape.color;
		    if (shape.type === 'circle') {
			    context.beginPath();
			    context.arc(shape.x, shape.y, shape.radius!, 0, Math.PI * 2);
			    context.fill();
		    } else if (shape.type === 'rectangle') {
			    context.fillRect(shape.x, shape.y, shape.width!, shape.height!);
		    }

		    if (index === selectedShapeIndex) {
			    context.strokeStyle = 'blue';
			    context.lineWidth = 2;
			    if (shape.type === 'circle') {
				    context.strokeRect(
					    shape.x - shape.radius!,
					    shape.y - shape.radius!,
					    shape.radius! * 2,
					    shape.radius! * 2
				    );
				    drawResizeHandleForCircle(context, shape);
			    } else if (shape.type === 'rectangle') {
				    context.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
				    drawResizeHandlesForRectangle(context, shape);
			    }
		    }
	    });
    }
    const drawResizeHandlesForRectangle = (context: CanvasRenderingContext2D, shape: Shape) => {
      const size = 10; // Increased size for easier selection
      context.fillStyle = 'blue';
      const corners = [
        { x: shape.x, y: shape.y, name: 'top-left' },
        { x: shape.x + shape.width!, y: shape.y, name: 'top-right' },
        { x: shape.x, y: shape.y + shape.height!, name: 'bottom-left' },
        { x: shape.x + shape.width!, y: shape.y + shape.height!, name: 'bottom-right' },
      ];

      corners.forEach(corner => {
        context.fillStyle = resizingCorner === corner.name ? 'red' : 'blue';
        context.fillRect(corner.x - size / 2, corner.y - size / 2, size, size);
      });
    };

    const drawResizeHandleForCircle = (context: CanvasRenderingContext2D, shape: Shape) => {
      const size = 10; // Increased size for easier selection
      context.fillStyle = 'blue';
      const handle = {
        x: shape.x + shape.radius!,
        y: shape.y,
        name: 'right',
      };
      context.fillStyle = resizingCorner === handle.name ? 'red' : 'blue';
      context.fillRect(handle.x - size / 2, handle.y - size / 2, size, size);
    };

    drawShapes();
  }, [canvasRef,shapes, selectedShapeIndex, resizingCorner,backgroundShapes]);

  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let shapeIndex = -1;
    if (currentTool === 'select') {
      shapes.forEach((shape, index) => {
        if (shape.type === 'circle') {
          const dx = x - shape.x;
          const dy = y - shape.y;
          if (Math.sqrt(dx * dx + dy * dy) <= shape.radius!) {
            shapeIndex = index;
            if (isCircleResizeHandleClicked(shape, x, y)) {
              setResizingCorner('right');
              setShapes(shapes.map((shape, idx) => (idx === index ? { ...shape, isResizing: true, isDragging: false } : shape)));
            } else {
              setShapes(shapes.map((shape, idx) => (idx === index ? { ...shape, isDragging: true, isResizing: false } : shape)));
            }
          }
        } else if (shape.type === 'rectangle') {
          if (isCornerClicked(shape, x, y)) {
            setResizingCorner(getResizingCorner(shape, x, y));
            shapeIndex = index;
            setShapes(shapes.map((shape, idx) => (idx === index ? { ...shape, isResizing: true, isDragging: false } : shape)));
          } else if (x >= shape.x && x <= shape.x + shape.width! && y >= shape.y && y <= shape.y + shape.height!) {
            shapeIndex = index;
            setShapes(shapes.map((shape, idx) => (idx === index ? { ...shape, isDragging: true, isResizing: false } : shape)));
          }
        }
      });

      if (shapeIndex === -1) {
        // If no shape is clicked, deselect the current shape
        setSelectedShapeIndex(null);
      } else {
        setSelectedShapeIndex(shapeIndex);
      }
    } else if (currentTool === 'circle') {
      const newShape: Shape = {
        type: 'circle',
        x,
        y,
        radius: 30,
        color: currentColor,
        isDragging: false,
        isResizing: false,
      };
      setShapes([...shapes, newShape]);
    } else if (currentTool === 'rectangle') {
      const newShape: Shape = {
        type: 'rectangle',
        x,
        y,
        width: 60,
        height: 40,
        color: currentColor,
        isDragging: false,
        isResizing: false,
      };
      setShapes([...shapes, newShape]);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShapeIndex !== null) {
      const selectedShape = shapes[selectedShapeIndex];
      if (selectedShape.isDragging) {
        setShapes(shapes.map((shape, index) => {
          if (index === selectedShapeIndex) {
            return shape.type === 'circle'
              ? { ...shape, x, y }
              : { ...shape, x, y };
          }
          return shape;
        }));
      } else if (selectedShape.isResizing && resizingCorner) {
        handleResize(selectedShape, x, y);
      }
    }
  };

  const handleResize = (shape: Shape, x: number, y: number) => {
    if (selectedShapeIndex === null) return;
    setShapes(shapes.map((s, index) => {
      if (index === selectedShapeIndex) {
        const updatedShape = { ...shape };
        if (shape.type === 'circle' && resizingCorner === 'right') {
          const dx = x - shape.x;
          updatedShape.radius = Math.abs(dx);
        } else if (shape.type === 'rectangle') {
          if (resizingCorner === 'top-left') {
            const newWidth = shape.width! + (shape.x - x);
            const newHeight = shape.height! + (shape.y - y);
            updatedShape.x = x;
            updatedShape.y = y;
            updatedShape.width = newWidth;
            updatedShape.height = newHeight;
          } else if (resizingCorner === 'top-right') {
            const newHeight = shape.height! + (shape.y - y);
            updatedShape.y = y;
            updatedShape.width = x - shape.x;
            updatedShape.height = newHeight;
          } else if (resizingCorner === 'bottom-left') {
            const newWidth = shape.width! + (shape.x - x);
            updatedShape.x = x;
            updatedShape.width = newWidth;
            updatedShape.height = y - shape.y;
          } else if (resizingCorner === 'bottom-right') {
            updatedShape.width = x - shape.x;
            updatedShape.height = y - shape.y;
          }
        }
        return updatedShape;
      }
      return s;
    }));
  };

  const handleMouseUp = () => {
    if (selectedShapeIndex !== null) {
      setShapes(shapes.map((shape, index) => {
        if (index === selectedShapeIndex) {
          return { ...shape, isDragging: false, isResizing: false };
        }
        return shape;
      }));
      setResizingCorner(null);
    }
  };


  const deleteShape = () => {
    if (selectedShapeIndex !== null) {
      setShapes(shapes.filter((_, index) => index !== selectedShapeIndex));
      setSelectedShapeIndex(null);
    }
  };

  const isCornerClicked = (shape: Shape, x: number, y: number): boolean => {
    const size = 10; // Increased size for easier selection
    return (
      (x >= shape.x - size && x <= shape.x + size && y >= shape.y - size && y <= shape.y + size) ||
      (x >= shape.x + shape.width! - size && x <= shape.x + shape.width! + size && y >= shape.y - size && y <= shape.y + size) ||
      (x >= shape.x - size && x <= shape.x + size && y >= shape.y + shape.height! - size && y <= shape.y + shape.height! + size) ||
      (x >= shape.x + shape.width! - size && x <= shape.x + shape.width! + size && y >= shape.y + shape.height! - size && y <= shape.y + shape.height! + size)
    );
  };

  const isCircleResizeHandleClicked = (shape: Shape, x: number, y: number): boolean => {
    const size = 10; // Increased size for easier selection
    const handleX = shape.x + shape.radius!;
    const handleY = shape.y;
    return (x >= handleX - size / 2 && x <= handleX + size / 2 && y >= handleY - size / 2 && y <= handleY + size / 2);
  };

  const getResizingCorner = (shape: Shape, x: number, y: number): string => {
    const size = 10; // Increased size for easier selection
    if (x >= shape.x - size && x <= shape.x + size && y >= shape.y - size && y <= shape.y + size) return 'top-left';
    if (x >= shape.x + shape.width! - size && x <= shape.x + shape.width! + size && y >= shape.y - size && y <= shape.y + size) return 'top-right';
    if (x >= shape.x - size && x <= shape.x + size && y >= shape.y + shape.height! - size && y <= shape.y + shape.height! + size) return 'bottom-left';
    if (x >= shape.x + shape.width! - size && x <= shape.x + shape.width! + size && y >= shape.y + shape.height! - size && y <= shape.y + shape.height! + size) return 'bottom-right';
    return '';
  };


  return null; // No need to render anything here
});


Canvas2.displayName = 'Canvas2';
export default Canvas2;

