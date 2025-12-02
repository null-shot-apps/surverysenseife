"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, wallets } from "../lib/thirdweb";
import { defineChain } from "thirdweb/chains";

// Define BSC chain
const bsc = defineChain(56);

// Placeholder contract address - replace with your actual contract address
const SURVEY_CONTRACT_ADDRESS = "0xYourSurveyRewardsAddress";

interface SurveyResponse {
  survey: {
    surveyId: string;
    totalReward: string;
    targetResponses: number;
    [key: string]: any;
  };
}

export default function SurveyApp() {
  const [surveyInput, setSurveyInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [surveyData, setSurveyData] = useState<SurveyResponse | null>(null);
  
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isTransactionPending } = useSendTransaction();

  const handleCreateSurvey = async () => {
    if (!account || !surveyInput.trim()) {
      setStatus("Please connect wallet and enter survey description");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Generating AI plan...");

      // Step A: API Call to generate survey
      const response = await fetch("https://surveysensei-agent.rahmandana08.workers.dev/agent/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `${surveyInput} Wallet saya: ${account.address}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: SurveyResponse = await response.json();
      setSurveyData(data);
      setStatus("AI plan generated! Preparing blockchain transaction...");

      // Step B: Blockchain Transaction
      const contract = getContract({
        client,
        chain: bsc,
        address: SURVEY_CONTRACT_ADDRESS,
      });

      const totalRewardInWei = toWei(data.survey.totalReward);

      const transaction = prepareContractCall({
        contract,
        method: "function createSurveyOnChain(string _surveyId, address _creator, uint256 _totalReward, uint256 _targetResponses)",
        params: [
          data.survey.surveyId,
          account.address,
          totalRewardInWei,
          BigInt(data.survey.targetResponses),
        ],
        value: totalRewardInWei,
      });

      setStatus("Waiting for transaction confirmation...");

      sendTransaction(transaction, {
        onSuccess: (result: any) => {
          setStatus(`Survey created successfully! Transaction: ${result.transactionHash}`);
          setIsLoading(false);
        },
        onError: (error: any) => {
          console.error("Transaction failed:", error);
          setStatus(`Transaction failed: ${error.message}`);
          setIsLoading(false);
        },
      });

    } catch (error) {
      console.error("Error creating survey:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Survey</h1>
          <p className="text-gray-600">Connect your wallet and describe your survey to get started</p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6 flex justify-center">
          <ConnectButton
            client={client}
            wallets={wallets}
            theme="light"
            connectButton={{
              label: "Connect Wallet",
            }}
            connectModal={{
              size: "wide",
            }}
          />
        </div>

        {/* Survey Input */}
        <div className="mb-6">
          <label htmlFor="survey-input" className="block text-sm font-medium text-gray-700 mb-2">
            Survey Description
          </label>
          <textarea
            id="survey-input"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your survey... (e.g., 'Make a survey about hoodies preferences for young adults')"
            value={surveyInput}
            onChange={(e) => setSurveyInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Create Survey Button */}
        <button
          onClick={handleCreateSurvey}
          disabled={!account || !surveyInput.trim() || isLoading || isTransactionPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading || isTransactionPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Survey...
            </div>
          ) : (
            "Create Survey"
          )}
        </button>

        {/* Status/Log Area */}
        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>
        )}

        {/* Survey Data Display */}
        {surveyData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Generated Survey Details:</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p><strong>Survey ID:</strong> {surveyData.survey.surveyId}</p>
              <p><strong>Total Reward:</strong> {surveyData.survey.totalReward} BNB</p>
              <p><strong>Target Responses:</strong> {surveyData.survey.targetResponses}</p>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        {account && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 mb-2">Connected Wallet:</h3>
            <p className="text-sm text-green-600 font-mono">{account.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}
