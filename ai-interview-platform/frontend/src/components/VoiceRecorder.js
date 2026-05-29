import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const VoiceRecorder = ({ onTranscriptChange, onRecordingComplete }) => {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
      if (onRecordingComplete) {
        onRecordingComplete(transcript);
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">
          Speech recognition is not supported in your browser. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Button */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleToggleRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        {isListening && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Recording: {formatTime(recordingTime)}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600">
          {isListening ? 'Click to stop recording' : 'Click to start recording'}
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
          <p className="text-gray-900">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
