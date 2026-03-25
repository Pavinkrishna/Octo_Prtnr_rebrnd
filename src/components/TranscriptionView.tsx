import React, { useEffect, useRef, useState } from "react";
import {
  useVoiceAssistant,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track, LocalParticipant, Participant, TranscriptionSegment } from "livekit-client";

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
}

function segmentToMessage(
  seg: TranscriptionSegment,
  participant: Participant,
  existing?: ChatMessage
): ChatMessage {
  const isSelf = participant instanceof LocalParticipant;
  return {
    id: seg.id,
    name: isSelf ? "You" : "Agent",
    text: seg.final ? seg.text : `${seg.text} ...`,
    timestamp: existing?.timestamp ?? Date.now(),
    isSelf,
  };
}

export default function TranscriptionView() {
  const { audioTrack } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const scrollRef = useRef<HTMLDivElement>(null);

  const agentTranscription = useTrackTranscription(audioTrack);
  const localTranscription = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const transcriptsRef = useRef<Map<string, ChatMessage>>(new Map());

  useEffect(() => {
    const transcripts = transcriptsRef.current;

    if (audioTrack?.participant) {
      for (const seg of agentTranscription.segments) {
        transcripts.set(
          seg.id,
          segmentToMessage(seg, audioTrack.participant, transcripts.get(seg.id))
        );
      }
    }

    for (const seg of localTranscription.segments) {
      transcripts.set(
        seg.id,
        segmentToMessage(
          seg,
          localParticipant.localParticipant,
          transcripts.get(seg.id)
        )
      );
    }

    const allMessages = Array.from(transcripts.values());
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages([...allMessages]);
  }, [
    agentTranscription.segments,
    localTranscription.segments,
    audioTrack?.participant,
    localParticipant.localParticipant,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-8">
            Conversation transcription will appear here...
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
          >
            <span
              className={`text-xs mb-1 ${msg.isSelf ? "text-gray-400" : "text-cyan-400"}`}
            >
              {msg.name}
            </span>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                msg.isSelf
                  ? "bg-cyan-900/40 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
