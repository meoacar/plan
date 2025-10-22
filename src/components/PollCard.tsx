"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  allowMultiple: boolean;
  endsAt?: string;
  options: PollOption[];
  _count: {
    votes: number;
  };
  userVotes?: string[];
}

export default function PollCard({ poll, isAuthenticated }: { poll: Poll; isAuthenticated: boolean }) {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.userVotes || []);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState((poll.userVotes?.length || 0) > 0);

  const totalVotes = poll._count.votes;
  const isExpired = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;

  const handleOptionToggle = (optionId: string) => {
    if (hasVoted || isExpired) return;

    if (poll.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (selectedOptions.length === 0) return;

    setIsVoting(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selectedOptions }),
      });

      if (res.ok) {
        setHasVoted(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Oy kullanılamadı");
      }
    } catch (error) {
      console.error("Vote error:", error);
      alert("Bir hata oluştu");
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all hover:border-green-200 hover:shadow-xl">
      {/* Decorative gradient overlay */}
      <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-br from-green-50 to-transparent opacity-50"></div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-100 opacity-20 blur-2xl"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="mb-5 flex items-start gap-4 border-b border-gray-100 pb-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900">{poll.question}</h3>
            {poll.description && (
              <p className="text-sm leading-relaxed text-gray-600">{poll.description}</p>
            )}
          </div>
        </div>

        {isExpired && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 p-4 text-sm font-semibold text-red-700 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Bu anket sona ermiştir
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const percentage = getPercentage(option._count.votes);
            const isSelected = selectedOptions.includes(option.id);
            const showResults = hasVoted || isExpired;

            return (
              <div 
                key={option.id} 
                className="relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => handleOptionToggle(option.id)}
                  disabled={hasVoted || isExpired || isVoting}
                  className={`group/option relative w-full rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                    isSelected && !hasVoted
                      ? "border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 shadow-md shadow-green-500/20"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                  } ${hasVoted || isExpired ? "cursor-default" : "cursor-pointer hover:shadow-md hover:-translate-y-0.5"}`}
                >
                  {showResults && (
                    <>
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-green-200 via-green-100 to-green-50 transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </>
                  )}
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {!showResults && (
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          isSelected 
                            ? "scale-110 border-green-600 bg-green-600 shadow-lg shadow-green-500/50" 
                            : "border-gray-300 group-hover/option:border-green-400"
                        }`}>
                          {isSelected && (
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      {showResults && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
                          <span className="text-xs font-bold text-green-600">{index + 1}</span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{option.text}</span>
                    </div>
                    {showResults && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {percentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {option._count.votes} oy
                          </div>
                        </div>
                        {percentage > 0 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {!hasVoted && !isExpired && (
          <button
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || isVoting}
            className="group/btn relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-green-600 to-green-700 px-6 py-4 font-bold text-white shadow-xl shadow-green-600/40 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
            <div className="relative flex items-center justify-center gap-2">
              {isVoting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oy kullanılıyor...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Oy Ver
                </>
              )}
            </div>
          </button>
        )}

        {hasVoted && !isExpired && (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 p-4 text-sm font-semibold text-green-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Oyunuz kaydedildi
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Toplam</div>
                <div className="font-bold text-gray-900">{totalVotes} oy</div>
              </div>
            </div>
            {poll.endsAt && (
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isExpired ? "bg-red-500" : "bg-gradient-to-br from-orange-500 to-orange-600"
                }`}>
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    {isExpired ? "Durum" : "Bitiş"}
                  </div>
                  <div className={`text-xs font-semibold ${isExpired ? "text-red-600" : "text-gray-900"}`}>
                    {isExpired ? (
                      "Sona erdi"
                    ) : (
                      new Date(poll.endsAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {poll.allowMultiple && !hasVoted && !isExpired && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Çoklu seçim
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
