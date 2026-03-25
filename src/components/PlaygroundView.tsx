import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import TranscriptionView from "./TranscriptionView";

interface PlaygroundViewProps {
  demoName: string;
  onDisconnect: () => void;
}

export default function PlaygroundView({
  demoName,
  onDisconnect,
}: PlaygroundViewProps) {
  const { state, audioTrack } = useVoiceAssistant();

  const getStatusText = () => {
    switch (state) {
      case "disconnected":
        return "Disconnected";
      case "connecting":
        return "Connecting...";
      case "initializing":
        return "Initializing...";
      case "listening":
        return "Listening";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking";
      default:
        return state;
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case "listening":
        return "text-cyan-400";
      case "thinking":
        return "text-amber-400";
      case "speaking":
        return "text-green-400";
      case "connecting":
      case "initializing":
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Image src="/Site.png" alt="Ocot Logo" width={32} height={32} />
          <div>
            <h1 className="text-white text-sm font-semibold">
              Octosignals Voice Agents Playground
            </h1>
            <p className="text-cyan-400 text-xs">{demoName}</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visualizer area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 repeating-square-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 w-full max-w-lg"
          >
            {/* Audio Visualizer */}
            <div className="w-full h-40 flex items-center justify-center">
              <BarVisualizer
                state={state}
                barCount={5}
                trackRef={audioTrack}
                className="w-full h-full"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col items-center gap-2">
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Transcription panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col h-64 lg:h-full">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white text-sm font-medium">Transcription</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <TranscriptionView />
          </div>
        </div>
      </div>

      {/* Audio components */}
      <RoomAudioRenderer />
      <StartAudio label="Click to enable audio" />
    </div>
  );
}
