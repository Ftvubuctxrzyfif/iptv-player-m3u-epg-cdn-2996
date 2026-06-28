import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Tv, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl: string;
  isLive?: boolean;
  autoplay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: Error) => void;
}

const VideoPlayer = ({
  streamUrl,
  isLive = true,
  autoplay = true,
  onPlay,
  onPause,
  onError
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    // Check if HLS is supported
    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('m3u8');

    if (isHls && Hls.isSupported()) {
      // Use HLS.js for HLS streams
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          setIsLoading(false);
          const errorMessage = 'Failed to load stream. The stream may be offline.';
          setError(errorMessage);
          onError?.(new Error(errorMessage));
        }
      });

      hlsRef.current = hls;

      // Setup video event listeners
      video.addEventListener('play', () => {
        setIsPlaying(true);
        onPlay?.();
      });

      video.addEventListener('pause', () => {
        setIsPlaying(false);
        onPause?.();
      });

      video.addEventListener('playing', () => {
        setIsLoading(false);
        setIsPlaying(true);
      });

      video.addEventListener('waiting', () => {
        setIsLoading(true);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Use native HLS support (Safari/webOS)
      video.src = streamUrl;

      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded');
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });

      video.addEventListener('play', () => {
        setIsPlaying(true);
        onPlay?.();
      });

      video.addEventListener('pause', () => {
        setIsPlaying(false);
        onPause?.();
      });

      video.addEventListener('playing', () => {
        setIsLoading(false);
        setIsPlaying(true);
      });

      video.addEventListener('waiting', () => {
        setIsLoading(true);
      });

      video.addEventListener('error', () => {
        setIsLoading(false);
        const errorMessage = 'Failed to load stream. Please check your connection.';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      });
    } else {
      // Direct MP4 or other format
      video.src = streamUrl;

      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(console.error);
        }
      });

      video.addEventListener('play', () => {
        setIsPlaying(true);
        onPlay?.();
      });

      video.addEventListener('pause', () => {
        setIsPlaying(false);
        onPause?.();
      });

      video.addEventListener('playing', () => {
        setIsLoading(false);
        setIsPlaying(true);
      });

      video.addEventListener('waiting', () => {
        setIsLoading(true);
      });

      video.addEventListener('error', () => {
        setIsLoading(false);
        const errorMessage = 'Failed to load stream. Please check your connection.';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoplay, onPlay, onPause, onError]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay={autoplay}
      />

      {/* Loading overlay - TV optimized */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <p className="text-white text-2xl font-medium">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error overlay - TV optimized */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-center p-12">
            <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
            <p className="text-white text-2xl mb-4">{error}</p>
            <p className="text-gray-400 text-lg">The stream may be unavailable or offline</p>
          </div>
        </div>
      )}

      {/* Play/Pause button overlay - TV optimized */}
      {!isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
          onClick={handleTogglePlay}
        >
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-8 backdrop-blur-sm">
              <div className="bg-white rounded-full p-6">
                <div className="w-16 h-16 border-l-4 border-gray-800 ml-4"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live indicator - TV optimized */}
      {isLive && isPlaying && (
        <div className="absolute top-6 left-6 bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-full z-30">
          LIVE
        </div>
      )}

      {/* Channel info overlay */}
      {isPlaying && (
        <div className="absolute bottom-6 left-6 right-6 z-30">
          <div className="bg-gradient-to-t from-black/80 to-transparent p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <Tv className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-white text-xl font-medium">Stream Quality: HD</p>
                <p className="text-gray-300 text-sm">Press Back button to return</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;