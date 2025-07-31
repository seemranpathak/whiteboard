import { Whiteboard } from './Whiteboard';
import { Toaster } from 'sonner'; // For toasts/notifications
import WebRTC from './webrtc';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased">
      {/* The core Whiteboard component */}
      <WebRTC/>
      <Whiteboard />
      
      {/* Toaster for displaying notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default App;
