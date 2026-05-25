"use client";

import React, { useState } from "react";
import { useGameStore } from "../lib/game-store";
import { BRAGA_CONFIG, getAddressFromPrivateKey } from "../lib/arkiv";
import { 
  Database, 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Info,
  Layers,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";

export default function ArkivLedger() {
  const { ledger, writePrivateKey, setWritePrivateKey } = useGameStore();
  const [showConfig, setShowConfig] = useState(false);
  const [inputKey, setInputKey] = useState(writePrivateKey);
  const [copied, setCopied] = useState(false);

  const HOST_PUBLIC_ADDRESS = getAddressFromPrivateKey(writePrivateKey);

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setWritePrivateKey(inputKey.trim());
      setShowConfig(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(HOST_PUBLIC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if there is any failed/insufficient funds transaction in the ledger
  const hasGasError = ledger.some(tx => tx.status === "error" && (tx.error?.toLowerCase().includes("gas") || tx.error?.toLowerCase().includes("funds") || tx.error?.toLowerCase().includes("balance") || tx.error?.toLowerCase().includes("insufficient")));

  return (
    <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl h-full flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <h3 className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider uppercase text-zinc-400">
          <Database className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-pulse" />
          Arkiv Braga Ledger
        </h3>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-2.5 py-1 text-[9px] font-bold font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 rounded-lg border border-zinc-800/80 hover:border-cyan-500/30 flex items-center gap-1.5 transition-all duration-300"
        >
          <Key className="w-3 h-3" />
          Settings
        </button>
      </div>

      {/* GAS FUNDING INSTRUCTION CARD - Highly prominent */}
      <div className="p-4 bg-amber-950/15 border border-amber-500/20 rounded-2xl mb-4 text-xs font-mono">
        <div className="flex items-start gap-2.5 mb-2">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-amber-300 uppercase text-[10px] tracking-wider">
              Braga Gas Required
            </h4>
            <p className="text-[9px] text-zinc-400 leading-normal mt-0.5">
              All transactions run on-chain. Deposit test GLM gas from Braga Faucet to the host account below to host and run games:
            </p>
          </div>
        </div>

        {/* Copyable Address Container */}
        <div className="flex items-center justify-between gap-2 bg-zinc-950/60 border border-zinc-800/60 p-2 rounded-xl text-[9px] text-zinc-300 font-bold mb-2.5">
          <span className="truncate">{HOST_PUBLIC_ADDRESS}</span>
          <button 
            onClick={handleCopy}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg transition-all"
            title="Copy address"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold">
          <a 
            href={BRAGA_CONFIG.faucetUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 bg-cyan-950/20 px-2 py-1 border border-cyan-900/40 rounded-lg transition-all"
          >
            Open Braga Faucet <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a 
            href={BRAGA_CONFIG.explorerUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-zinc-300 underline inline-flex items-center gap-0.5"
          >
            View on Explorer <ExternalLink className="w-2 h-2" />
          </a>
        </div>
      </div>

      {/* Insufficient funds warning alert if errors caught */}
      {hasGasError && (
        <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-start gap-2 text-[9px] font-mono text-red-400 animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="leading-normal">
            <span className="font-bold block uppercase">Insufficient Gas Warning!</span>
            Deployments are failing. Please send test GLM to the host address listed above to resume writes.
          </div>
        </div>
      )}

      {/* Private Key Config Overlay */}
      {showConfig && (
        <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-4 text-xs font-mono">
          <h4 className="font-bold text-zinc-200 mb-1 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Wallet Private Key Override
          </h4>
          <p className="text-[9px] text-zinc-500 mb-3 leading-relaxed">
            By default, we run using the host demo key. Paste your own Braga private key below to run operations using your funded developer wallet.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-[9px] rounded focus:outline-none focus:border-cyan-500 text-zinc-300 font-mono"
            />
            <button
              onClick={handleSaveKey}
              className="bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold px-3 py-1.5 rounded transition-all text-[10px]"
            >
              SAVE
            </button>
          </div>
        </div>
      )}

      {/* Ledger Feed */}
      <div className="flex-1 overflow-y-auto max-h-[220px] flex flex-col gap-2">
        {ledger.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/20">
            <Layers className="w-8 h-8 text-zinc-800 mb-2" />
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none">
              Awaiting session init...
            </span>
          </div>
        ) : (
          ledger.map((tx) => (
            <div
              key={tx.id}
              className={`p-3 border rounded-2xl bg-zinc-950/60 font-mono text-[9px] flex items-start justify-between gap-3 hover:bg-zinc-950/90 transition-colors duration-300 ${
                tx.status === "error"
                  ? "border-red-950/40"
                  : tx.status === "success"
                  ? "border-zinc-800"
                  : "border-cyan-950/40 animate-pulse"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {/* Status Badge */}
                  {tx.status === "pending" && (
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-950/20 px-1.5 py-0.5 rounded text-[8px] border border-amber-900/40 uppercase">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Pending
                    </span>
                  )}
                  {tx.status === "success" && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded text-[8px] border border-emerald-900/40 uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Success
                    </span>
                  )}
                  {tx.status === "error" && (
                    <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/20 px-1.5 py-0.5 rounded text-[8px] border border-red-900/40 uppercase">
                      <XCircle className="w-2.5 h-2.5" />
                      Error
                    </span>
                  )}

                  <span className="text-zinc-500 text-[8px] uppercase tracking-wider bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                    {tx.entityType}
                  </span>
                </div>

                <p className="text-zinc-300 leading-normal">{tx.details}</p>
                {tx.error && <p className="text-red-500/80 text-[8px] mt-1 italic font-sans">{tx.error}</p>}
              </div>

              {/* Tx Hash / Explorer Link */}
              {tx.txHash && (
                <a
                  href={`${BRAGA_CONFIG.explorerUrl}tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[8px] text-cyan-400 hover:text-cyan-300 font-bold shrink-0 self-center bg-cyan-950/40 border border-cyan-800/60 px-2 py-1 rounded-lg transition-all"
                >
                  EXPLORER
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Testnet Specs footer */}
      <div className="mt-4 border-t border-zinc-850 pt-3 flex justify-between items-center text-[8px] text-zinc-600 font-mono">
        <span>Braga RPC: braga.hoodi.arkiv.network</span>
        <span>ChainID: 60138453102</span>
      </div>
    </div>
  );
}
