import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ConnectScreenProps {
  demoName: string;
  agentName: string;
  onAgentNameChange: (value: string) => void;
  onConnect: () => void;
  loading: boolean;
}

export default function ConnectScreen({
  demoName,
  agentName,
  onAgentNameChange,
  onConnect,
  loading,
}: ConnectScreenProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/Site.png"
            alt="Octo Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            Octosignals Voice Agents Playground
          </h1>
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 mt-2">
            <p className="text-cyan-400 text-sm font-medium">{demoName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="agentName"
              className="block text-gray-400 text-sm mb-2"
            >
              Agent Name (Optional)
            </label>
            <input
              id="agentName"
              type="text"
              value={agentName}
              onChange={(e) => onAgentNameChange(e.target.value)}
              placeholder="e.g. my-agent-worker"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            <p className="text-gray-500 text-xs mt-1">
              Leave blank for automatic agent dispatch
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
