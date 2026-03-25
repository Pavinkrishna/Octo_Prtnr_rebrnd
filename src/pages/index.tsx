import React, { useState, useEffect, useCallback } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import ApiKeyScreen from "@/components/ApiKeyScreen";
import ConnectScreen from "@/components/ConnectScreen";
import PlaygroundView from "@/components/PlaygroundView";
import type { TokenResult } from "@/lib/types";

type Screen = "apikey" | "connect" | "playground";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("apikey");
  const [wsUrl, setWsUrl] = useState("");
  const [token, setToken] = useState("");
  const [demoName, setDemoName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/validate-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkSession: true }),
        });
        const data = await res.json();
        if (data.hasValidSession) {
          setWsUrl(data.url);
          setDemoName(data.name);
          setScreen("connect");
        }
      } catch {
        // No valid session, stay on API key screen
      }
    };
    checkSession();
  }, []);

  const handleApiKeyValidated = useCallback(
    (url: string, name: string) => {
      setWsUrl(url);
      setDemoName(name);
      setScreen("connect");
    },
    []
  );

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setError("");

    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to get token");
        setConnecting(false);
        return;
      }

      const data: TokenResult = await res.json();
      setToken(data.accessToken);
      setScreen("playground");
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  }, [agentName]);

  const handleDisconnect = useCallback(() => {
    setToken("");
    setAgentName("");
    setScreen("connect");
  }, []);

  if (screen === "apikey") {
    return <ApiKeyScreen onValidated={handleApiKeyValidated} />;
  }

  if (screen === "connect") {
    return (
      <div>
        <ConnectScreen
          demoName={demoName}
          agentName={agentName}
          onAgentNameChange={setAgentName}
          onConnect={handleConnect}
          loading={connecting}
        />
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Playground screen
  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={handleDisconnect}
      onError={(e) => {
        console.error("LiveKit error:", e);
        setError(e.message);
      }}
      className="flex flex-col h-full"
    >
      <PlaygroundView demoName={demoName} onDisconnect={handleDisconnect} />
    </LiveKitRoom>
  );
}
