import { useState, useEffect, useRef } from 'react';


// Main WebRTC component
const WebRTC:React.FC = () => {
    // State variables for managing the video streams and peer connection
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    
    // Refs to directly access the video and message elements
     const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const messageBoxRef = useRef<HTMLPreElement>(null);

    // Configuration for the ICE servers (STUN server)
    const iceServers = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    // A utility function to add log messages to the state
    const log = (message: string) => {
        const date = new Date();
        setLogs(prevLogs => [...prevLogs, `[${date.toLocaleTimeString()}] ${message}`]);
    };

    // An effect to handle scrolling the log box to the bottom
    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [logs]);

    // Function to handle errors
    const handleError = (error: Error) => {
        // Handle the specific 'Permission denied' errors by setting a prominent UI message
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
            const errorMessage = "Access to the camera and microphone was denied. This is a browser security feature. Please ensure you are running this page from a secure context (HTTPS) or from a local development server (e.g., http://localhost).";
            setPermissionError(errorMessage);
            log(`Error: ${errorMessage}`);
        } else {
            log(`Error: ${error.name} - ${error.message}`);
        }
        console.error('WebRTC Error:', error);
    };

    // Function to start the video conference
    const startVideo = async () => {
        log("Starting video conference...");
        setPermissionError(null); // Clear any previous permission errors
        
        try {
            // 1. Get the local media stream (camera and microphone)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
             if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            log("Local video and audio stream acquired successfully.");

            // 2. Create the RTCPeerConnection object
            const pc = new RTCPeerConnection(iceServers);
            setPeerConnection(pc);
            
            // 3. Add event listeners for the peer connection
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    log(`ICE candidate generated: ${JSON.stringify(event.candidate)}`);
                    // In a real app, this candidate would be sent to the remote peer
                    pc.addIceCandidate(event.candidate); // Simulating local "trickle"
                }
            };

            pc.ontrack = (event:RTCTrackEvent) => {
                log("Remote track received. Adding to remote video.");
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setRemoteStream(event.streams[0]);
            };

            // 4. Add the local stream's tracks to the peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });
            log("Local tracks added to the peer connection.");

            // 5. Create an SDP offer and simulate the connection
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            log(`SDP Offer created and set as local description:\n${JSON.stringify(offer)}`);
            
            // Simulating remote peer's answer for demonstration purposes
            log("Simulating remote peer's answer...");
            const answer = await pc.createAnswer();
            await pc.setRemoteDescription(offer);
            await pc.setLocalDescription(answer);
            log(`Simulated SDP Answer created and set as local description:\n${JSON.stringify(answer)}`);

        } catch (error: any) {
            handleError(error);
        }
    };
    
    // Function to stop the video conference
    const stopVideo = () => {
        log("Stopping video conference...");

        // Stop all tracks in the local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // Close the peer connection
        if (peerConnection) {
            peerConnection.close();
            log("Peer connection closed.");
        }

        // Reset state variables
        setLocalStream(null);
        setRemoteStream(null);
        setPeerConnection(null);
        
        log("Video conference stopped.");
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center justify-center p-8 font-['Inter'] relative">
            <h1 className="text-4xl font-bold mb-8 text-white">Simple WebRTC Video Chat</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-8">
                {/* Local Video Box */}
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4 text-white">My Video</h2>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-auto rounded-xl bg-gray-600 aspect-video"></video>
                </div>
                
                {/* Remote Video Box */}
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Remote Video</h2>
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-auto rounded-xl bg-gray-600 aspect-video"></video>
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={startVideo} 
                    disabled={!!localStream}
                    className="py-3 px-6 font-bold rounded-lg transition-all duration-200 ease-in-out bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Video
                </button>
                <button 
                    onClick={stopVideo} 
                    disabled={!localStream}
                    className="py-3 px-6 font-bold rounded-lg transition-all duration-200 ease-in-out bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Stop Video
                </button>
            </div>

            {/* Message/Status box */}
            <pre ref={messageBoxRef} className="bg-gray-800 text-gray-300 p-4 rounded-xl w-full max-w-5xl min-h-[150px] max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm font-mono shadow-inner">
                {logs.join('\n')}
            </pre>

            {/* Permission Error Modal */}
            {permissionError && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-10">
                    <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center border-2 border-red-500">
                        <h3 className="text-2xl font-bold mb-4 text-red-400">Permission Error</h3>
                        <p className="mb-6 leading-relaxed">
                            {permissionError}
                        </p>
                        <button onClick={() => setPermissionError(null)} className="py-2 px-6 font-bold rounded-lg bg-red-600 text-white hover:bg-red-700">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebRTC;
