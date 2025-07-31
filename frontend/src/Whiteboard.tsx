
import { useEffect, useRef, useState} from "react";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush, BaseBrush, Object as FabricObject, Path } from "fabric";
import { Toolbar } from "./components/Toolbar";
import { ColorPicker } from "./components/ColorPicker";
import { UserCursors } from "./components/UserCursors";
import { CollaboratorsList } from "./components/CollaboratorsList";
import { toast } from "sonner";
import { io, Socket } from 'socket.io-client'; // Import Socket.IO client

// Define the types for drawing tools
export type DrawingTool = "select" | "draw" | "rectangle" | "circle" | "eraser";

// Define type for a collaborator
interface Collaborator {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  x?: number; // Cursor X position
  y?: number; // Cursor Y position
}

// Simple debounce utility function to optimize event handling (e.g., window resize, mouse move)
function debounce<T extends (...args: unknown[]) => unknown>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#8B5CF6");
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [brushSize, setBrushSize] = useState(2);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string>(''); // Unique ID for the current user
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]); // Dynamic list of collaborators

  // Assign a random color to the current user
  const userColorRef = useRef<string>('');
  useEffect(() => {
    const colors = ["#8B5CF6", "#10B981", "#EF4444", "#F59E0B", "#3B82F6", "#000000"];
    userColorRef.current = colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Effect for initializing the Fabric.js canvas and Socket.IO connection
  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate a unique user ID for this client
    const newUserId = `user_${Math.random().toString(36).substring(2, 9)}`;
    setUserId(newUserId);

    // Initialize Fabric.js Canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 64,
      height: window.innerHeight - 120,
      backgroundColor: "white",
    });
    canvas.isDrawingMode = false;
    setFabricCanvas(canvas);
    toast("Whiteboard ready! Start collaborating!");

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000'); // Connect to your Socket.IO backend
    setSocket(newSocket);

    // Emit user connection and initial data
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id);
      newSocket.emit('userConnected', {
        id: newUserId,
        name: `User ${newUserId.substring(5, 8)}`, // Simple name for demo
        color: userColorRef.current,
        isActive: true,
      });
    });

    // Listen for incoming events from the server
    newSocket.on('canvasState', (data: string) => {
      // Load entire canvas state (e.g., when a new user joins or for undo/redo sync)
      if (fabricCanvas) {
        fabricCanvas.loadFromJSON(data, () => {
          fabricCanvas.renderAll();
          toast("Canvas state synced!");
        });
      }
    });

    newSocket.on('drawing', (data: { path: any; userId: string }) => {
      // Add a new path created by another user
      if (fabricCanvas && data.userId !== newUserId) {
        const path = new Path(data.path);
        fabricCanvas.add(path);
        fabricCanvas.renderAll();
      }
    });

    newSocket.on('objectModified', (data: { object: any; userId: string }) => {
      // Update an object modified by another user
      if (fabricCanvas && data.userId !== newUserId) {
        fabricCanvas.loadFromJSON(data.object, (o: FabricObject) => {
          const existingObj = fabricCanvas.getObjects().find(obj => obj.id === o.id);
          if (existingObj) {
            existingObj.set(o.toJSON()); // Update properties
            fabricCanvas.renderAll();
          } else {
            // If object doesn't exist (e.g., new shape added by another user)
            fabricCanvas.add(o);
            fabricCanvas.renderAll();
          }
        });
      }
    });

    newSocket.on('objectRemoved', (data: { objectId: string; userId: string }) => {
      // Remove an object removed by another user
      if (fabricCanvas && data.userId !== newUserId) {
        const objToRemove = fabricCanvas.getObjects().find(obj => obj.id === data.objectId);
        if (objToRemove) {
          fabricCanvas.remove(objToRemove);
          fabricCanvas.renderAll();
        }
      }
    });

    newSocket.on('clearCanvas', (data: { userId: string }) => {
      // Clear canvas initiated by another user
      if (fabricCanvas && data.userId !== newUserId) {
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = "white";
        fabricCanvas.renderAll();
        toast(`${data.userId.substring(5,8)} cleared the canvas!`);
      }
    });

    newSocket.on('userConnected', (user: Collaborator) => {
      setCollaborators(prev => {
        if (!prev.some(c => c.id === user.id)) {
          toast(`${user.name} joined!`);
          return [...prev, { ...user, isActive: true }];
        }
        return prev.map(c => c.id === user.id ? { ...c, isActive: true } : c);
      });
    });

    newSocket.on('userDisconnected', (disconnectedUserId: string) => {
      setCollaborators(prev => {
        const user = prev.find(c => c.id === disconnectedUserId);
        if (user) {
          toast(`${user.name} left.`);
          return prev.map(c => c.id === disconnectedUserId ? { ...c, isActive: false } : c);
        }
        return prev;
      });
    });

    newSocket.on('cursorMove', (data: { userId: string; x: number; y: number }) => {
      setCollaborators(prev => prev.map(c =>
        c.id === data.userId ? { ...c, x: data.x, y: data.y, isActive: true } : c
      ));
    });

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 64,
        height: window.innerHeight - 120,
      });
    };
    const debouncedResize = debounce(handleResize, 200);
    window.addEventListener("resize", debouncedResize);

    // Cleanup function
    return () => {
      if (socket) {
        socket.emit('userDisconnected', newUserId); // Notify others of disconnect
        socket.disconnect();
      }
      canvas.dispose();
      window.removeEventListener("resize", debouncedResize);
    };
  }, []); // Empty dependency array for initial setup

  // Effect for setting up Fabric.js event listeners to emit changes
  useEffect(() => {
    if (!fabricCanvas || !socket || !userId) return;

    // Add a unique ID to new objects for easier tracking
    fabricCanvas.on('object:added', (e) => {
      if (e.target && !e.target.id) {
        e.target.set({ id: `obj_${Date.now()}_${userId}` });
      }
    });

    // Emit object modifications
    const handleObjectModified = (e: any) => {
      if (e.target) {
        socket.emit('objectModified', { object: e.target.toJSON(), userId });
      }
    };
    fabricCanvas.on('object:modified', handleObjectModified);

    // Emit new paths (free drawing)
    const handlePathCreated = (e: any) => {
      if (e.path) {
        e.path.set({ id: `path_${Date.now()}_${userId}` }); // Assign ID to path
        socket.emit('drawing', { path: e.path.toJSON(), userId });
      }
    };
    fabricCanvas.on('path:created', handlePathCreated);

    // Emit object removals
    const handleObjectRemoved = (e: any) => {
      if (e.target && e.target.id) {
        socket.emit('objectRemoved', { objectId: e.target.id, userId });
      }
    };
    fabricCanvas.on('object:removed', handleObjectRemoved);

    // Emit cursor movements (debounced for performance)
    const handleMouseMove = (e: any) => {
      if (e.e && fabricCanvas) {
        const pointer = fabricCanvas.getPointerId(e.e)
        socket.emit('cursorMove', { userId, x: pointer.x, y: pointer.y });
      }
    };
    const debouncedMouseMove = debounce(handleMouseMove, 50); // Emit cursor position every 50ms
    fabricCanvas.on('mouse:move', debouncedMouseMove);

    // Cleanup Fabric.js event listeners
    return () => {
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('path:created', handlePathCreated);
      fabricCanvas.off('object:removed', handleObjectRemoved);
      fabricCanvas.off('mouse:move', debouncedMouseMove);
    };
  }, [fabricCanvas, socket, userId]); // Re-run when canvas, socket, or userId are ready

  // Effect for updating canvas drawing properties based on active tool, color, and brush size
  useEffect(() => {
    if (!fabricCanvas) return;

    let targetBrush: BaseBrush | undefined;

    if (activeTool === "draw") {
      fabricCanvas.isDrawingMode = true;
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      }
      targetBrush = fabricCanvas.freeDrawingBrush;
      targetBrush.color = activeColor;
      targetBrush.width = brushSize;
    } else if (activeTool === "eraser") {
      fabricCanvas.isDrawingMode = true;
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      }
      targetBrush = fabricCanvas.freeDrawingBrush;
      targetBrush.color = "white"; // Eraser "color" is white
      targetBrush.width = brushSize * 2; // Eraser is typically wider
    } else {
      fabricCanvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  // Handler for when a tool button is clicked
  const handleToolClick = (tool: DrawingTool) => {
    setActiveTool(tool);

    if (tool === "rectangle" && fabricCanvas && socket) {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
        rx: 8,
        ry: 8,
        id: `obj_${Date.now()}_${userId}` // Assign ID immediately
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      fabricCanvas.renderAll();
      socket.emit('objectModified', { object: rect.toJSON(), userId }); // Emit creation as modification
    } else if (tool === "circle" && fabricCanvas && socket) {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50,
        id: `obj_${Date.now()}_${userId}` // Assign ID immediately
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      fabricCanvas.renderAll();
      socket.emit('objectModified', { object: circle.toJSON(), userId }); // Emit creation as modification
    }
  };

  // Handler for clearing the entire canvas
  const handleClear = () => {
    if (!fabricCanvas || !socket) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "white";
    fabricCanvas.renderAll();
    socket.emit('clearCanvas', { userId }); // Emit clear event
    toast("Canvas cleared!");
  };

  // Placeholder for Undo functionality (would require managing canvas history)
  const handleUndo = () => {
    toast("Undo functionality would be implemented with proper state management");
  };

  // Placeholder for Redo functionality (would require managing canvas history)
  const handleRedo = () => {
    toast("Redo functionality would be implemented with proper state management");
  };

  // Filter collaborators for UserCursors, excluding the current user
  const otherCollaborators = collaborators.filter(
    (collab) => collab.id !== userId && collab.isActive && collab.x !== undefined && collab.y !== undefined
  ) as Collaborator[];

  // Prepare collaborators list for display, including current user
  const displayCollaborators = [
    { id: userId, name: "You", color: userColorRef.current, isActive: true },
    ...collaborators.filter(c => c.id !== userId)
  ];


  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-inter">
      {/* Header Section: App Title and Collaborators List */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            DrawSync
          </h1>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Untitled Board</span>
        </div>
        <CollaboratorsList collaborators={displayCollaborators} />
      </div>

      {/* Main Content Area: Toolbar, Canvas, and User Cursors */}
      <div className="flex-1 flex relative">
        {/* Toolbar positioned absolutely at the top center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-toolbar-bg border border-tool-border rounded-xl shadow-toolbar p-2 flex items-center gap-2">
            <Toolbar
              activeTool={activeTool}
              onToolClick={handleToolClick}
              onClear={handleClear}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
            <div className="h-8 w-px bg-tool-border mx-2" /> {/* Separator */}
            <ColorPicker color={activeColor} onChange={setActiveColor} />
            <div className="h-8 w-px bg-tool-border mx-2" /> {/* Separator */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 h-1 bg-purple-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3"
              />
              <span className="text-xs text-muted-foreground w-6 text-center">{brushSize}</span>
            </div>
          </div>
        </div>

        {/* Canvas Container: Takes up remaining space */}
        <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 p-8 pt-20 overflow-hidden flex justify-center items-center">
          <div className="bg-canvas-bg rounded-xl shadow-floating border border-tool-border overflow-hidden">
            <canvas ref={canvasRef} className="block" /> {/* The actual HTML canvas element */}
          </div>
        </div>

        {/* User Cursors (excluding the current user) */}
        <UserCursors collaborators={otherCollaborators} />
      </div>
    </div>
  );
};
