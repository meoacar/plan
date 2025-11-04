import { prisma } from '@/lib/prisma';
import { GameType } from '@prisma/client';
import { addCoins, COIN_SOURCES } from './coin-system';

/**
 * Mini Oyunlar Sistemi - Backend Altyapısı
 * 
 * Bu modül mini oyunlar sisteminin yönetimini sağlar.
 * Oyun oturumu başlatma, tamamlama, skor hesaplama, günlük limit kontrolü
 * ve liderlik tablosu işlemlerini içerir.
 */

// Oyun kodları - Prisma GameType enum'unu kullanıyoruz
export const GAME_CODES = {
  CALORIE_GUESS: GameType.CALORIE_GUESS,
  MEMORY_CARDS: GameType.MEMORY_CARDS,
  NUTRITION_QUIZ: GameType.NUTRITION_QUIZ,
  DAILY_PUZZLE: GameType.DAILY_PUZZLE,
} as const;

// Oyun ayarları
export const GAME_SETTINGS = {
  [GameType.CALORIE_GUESS]: {
    questionCount: 10,
    timePerQuestion: 30, // saniye
    accuracyTiers: {
      excellent: { range: 10, points: 100 }, // ±10%
      good: { range: 20, points: 50 },       // ±20%
      fair: { range: 30, points: 25 },       // ±30%
    },
    rewardTiers: {
      bronze: { minScore: 100, coins: 50 },
      silver: { minScore: 500, coins: 100 },
      gold: { minScore: 800, coins: 200 },
    },
  },
  [GameType.MEMORY_CARDS]: {
    gridSize: { rows: 4, cols: 4 },
    pairCount: 8,
    cardRevealTime: 1000, // ms
    rewardTiers: {
      bronze: { maxMoves: 40, coins: 25 },
      silver: { maxMoves: 30, coins: 50 },
      gold: { maxMoves: 20, coins: 100 },
    },
  },
  [GameType.NUTRITION_QUIZ]: {
    questionCount: 10,
    timePerQuestion: 30, // saniye
    rewardTiers: {
      bronze: { minScore: 100, coins: 40 },
      silver: { minScore: 200, coins: 80 },
      gold: { minScore: 300, coins: 150 },
    },
  },
  [GameType.DAILY_PUZZLE]: {
    duration: 60, // saniye
    rewardTiers: {
      bronze: { minScore: 50, coins: 30 },
      silver: { minScore: 100, coins: 60 },
      gold: { minScore: 150, coins: 100 },
    },
  },
} as const;

// Günlük oyun limiti
export const DAILY_GAME_LIMIT = 5;

// Hata kodları
export const GAME_ERROR_CODES = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_LIMIT_REACHED: 'GAME_LIMIT_REACHED',
  GAME_SESSION_INVALID: 'GAME_SESSION_INVALID',
  GAME_SESSION_NOT_FOUND: 'GAME_SESSION_NOT_FOUND',
  GAME_ALREADY_COMPLETED: 'GAME_ALREADY_COMPLETED',
  INVALID_GAME_CODE: 'INVALID_GAME_CODE',
} as const;

// Hata mesajları
export const GAME_ERROR_MESSAGES: Record<string, string> = {
  GAME_NOT_FOUND: 'Oyun bulunamadı',
  GAME_LIMIT_REACHED: 'Günlük oyun limitine ulaştınız',
  GAME_SESSION_INVALID: 'Geçersiz oyun oturumu',
  GAME_SESSION_NOT_FOUND: 'Oyun oturumu bulunamadı',
  GAME_ALREADY_COMPLETED: 'Bu oyun oturumu zaten tamamlanmış',
  INVALID_GAME_CODE: 'Geçersiz oyun kodu',
};

/**
 * Oyun oturumu başlatma fonksiyonu
 * 
 * @param userId - Kullanıcı ID
 * @param gameCode - Oyun kodu (CALORIE_GUESS, NUTRITION_QUIZ, DAILY_PUZZLE)
 * @returns Oluşturulan oyun oturumu
 */
export async function startGameSession(userId: string, gameCode: GameType) {
  try {
    // Oyun kodu kontrolü
    if (!Object.values(GameType).includes(gameCode)) {
      throw new Error(GAME_ERROR_MESSAGES.INVALID_GAME_CODE);
    }

    // Günlük limit kontrolü
    const canPlay = await checkDailyLimit(userId, gameCode);
    if (!canPlay) {
      throw new Error(GAME_ERROR_MESSAGES.GAME_LIMIT_REACHED);
    }

    // MiniGame'i bul veya oluştur
    let miniGame = await prisma.miniGame.findUnique({
      where: { code: gameCode },
    });

    if (!miniGame) {
      // Eğer oyun yoksa, varsayılan ayarlarla oluştur
      miniGame = await prisma.miniGame.create({
        data: {
          code: gameCode,
          name: getGameName(gameCode),
          description: getGameDescription(gameCode),
          settings: GAME_SETTINGS[gameCode],
          rewardTiers: GAME_SETTINGS[gameCode].rewardTiers,
          dailyLimit: DAILY_GAME_LIMIT,
          isActive: true,
        },
      });
    }

    // GameSession oluştur
    const gameSession = await prisma.gameSession.create({
      data: {
        userId,
        gameId: miniGame.id,
        score: 0,
        completed: false,
        coinsEarned: 0,
      },
    });

    console.log(
      `Oyun oturumu başlatıldı: ${gameCode} - Kullanıcı: ${userId} - Oturum ID: ${gameSession.id}`
    );

    return {
      sessionId: gameSession.id,
      gameCode,
      startedAt: gameSession.startedAt,
      settings: GAME_SETTINGS[gameCode],
    };
  } catch (error) {
    console.error('Oyun oturumu başlatma hatası:', error);
    throw error;
  }
}

/**
 * Oyun tamamlama fonksiyonu
 * 
 * @param sessionId - Oyun oturumu ID
 * @param score - Kullanıcının skoru
 * @param gameData - Oyuna özel ek veriler (opsiyonel)
 * @returns Kazanılan coin ve diğer bilgiler
 */
export async function completeGameSession(
  sessionId: string,
  score: number,
  gameData?: Record<string, any>
) {
  try {
    // Oyun oturumunu getir
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        game: true,
      },
    });

    if (!gameSession) {
      throw new Error(GAME_ERROR_MESSAGES.GAME_SESSION_NOT_FOUND);
    }

    // Tamamlanma kontrolü
    if (gameSession.completed) {
      throw new Error(GAME_ERROR_MESSAGES.GAME_ALREADY_COMPLETED);
    }

    // Oyun kodunu al
    const gameCode = gameSession.game.code as GameType;

    // Skor hesaplama
    const coinsEarned = calculateScore(gameCode, score);

    // Süre hesaplama
    const completedAt = new Date();
    const duration = Math.floor((completedAt.getTime() - gameSession.startedAt.getTime()) / 1000);

    // Oyun oturumunu güncelle
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        score,
        coinsEarned,
        completed: true,
        completedAt,
        duration,
        gameData: gameData || {},
      },
    });

    // Coin ekle
    if (coinsEarned > 0) {
      const coinSource = `GAME_${gameCode}` as keyof typeof COIN_SOURCES;
      await addCoins(
        gameSession.userId,
        coinsEarned,
        COIN_SOURCES[coinSource] || 'GAME_CALORIE_GUESS',
        {
          sessionId,
          score,
          gameType: gameCode,
        }
      );
    }

    // Yüksek skor kontrolü
    const highScore = await checkHighScore(gameSession.userId, gameCode, score);

    // Liderlik tablosu sıralaması
    const leaderboardRank = await getGameLeaderboard(gameCode, 'all-time', 100)
      .then((leaderboard) => {
        const userEntry = leaderboard.find((entry) => entry.userId === gameSession.userId);
        return userEntry?.rank;
      });

    console.log(
      `Oyun tamamlandı: ${gameCode} - Kullanıcı: ${gameSession.userId} - Skor: ${score} - Coin: ${coinsEarned}`
    );

    // Oyun rozetlerini kontrol et
    try {
      const { checkGameBadges } = await import('./gamification-badges');
      await checkGameBadges(gameSession.userId, gameCode);
    } catch (badgeError) {
      console.error('Oyun rozet kontrolü hatası:', badgeError);
      // Rozet hatası oyun tamamlamayı etkilemez
    }

    return {
      success: true,
      score,
      coinsEarned,
      duration,
      highScore,
      leaderboardRank,
      gameType: gameCode,
    };
  } catch (error) {
    console.error('Oyun tamamlama hatası:', error);
    throw error;
  }
}

/**
 * Skor hesaplama fonksiyonu
 * 
 * @param gameCode - Oyun kodu
 * @param score - Kullanıcının skoru
 * @returns Kazanılan coin miktarı
 */
export function calculateScore(gameCode: GameType, score: number): number {
  try {
    const settings = GAME_SETTINGS[gameCode];
    
    if (!settings || !settings.rewardTiers) {
      return 0;
    }

    const { rewardTiers } = settings;

    // Oyun tipine göre skor hesaplama
    if (gameCode === GameType.CALORIE_GUESS) {
      const tiers = rewardTiers as typeof GAME_SETTINGS.CALORIE_GUESS.rewardTiers;
      if (score >= tiers.gold.minScore) {
        return tiers.gold.coins;
      } else if (score >= tiers.silver.minScore) {
        return tiers.silver.coins;
      } else if (score >= tiers.bronze.minScore) {
        return tiers.bronze.coins;
      }
    } else if (gameCode === GameType.MEMORY_CARDS) {
      // Hafıza kartları için skor = coin (zaten hesaplanmış)
      return score;
    } else if (gameCode === GameType.NUTRITION_QUIZ || gameCode === GameType.DAILY_PUZZLE) {
      // Diğer oyunlar için genel skor hesaplama
      const tiers = rewardTiers as any;
      if (score >= tiers.gold.minScore) {
        return tiers.gold.coins;
      } else if (score >= tiers.silver.minScore) {
        return tiers.silver.coins;
      } else if (score >= tiers.bronze.minScore) {
        return tiers.bronze.coins;
      }
    }

    return 0;
  } catch (error) {
    console.error('Skor hesaplama hatası:', error);
    return 0;
  }
}

/**
 * Günlük limit kontrolü fonksiyonu
 * 
 * @param userId - Kullanıcı ID
 * @param gameCode - Oyun kodu (opsiyonel, belirtilmezse tüm oyunlar)
 * @returns Oyun oynayabilir mi (true/false)
 */
export async function checkDailyLimit(
  userId: string,
  gameCode?: GameType
): Promise<boolean> {
  try {
    // Bugünün başlangıcı
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtre oluştur
    const where: any = {
      userId,
      startedAt: {
        gte: today,
      },
    };

    // Eğer gameCode belirtilmişse, o oyun için limit kontrolü yap
    if (gameCode) {
      const miniGame = await prisma.miniGame.findUnique({
        where: { code: gameCode },
      });

      if (miniGame) {
        where.gameId = miniGame.id;
      }
    }

    // Bugün oynanan oyun sayısını say
    const playedToday = await prisma.gameSession.count({
      where,
    });

    // Limit kontrolü
    return playedToday < DAILY_GAME_LIMIT;
  } catch (error) {
    console.error('Günlük limit kontrolü hatası:', error);
    return false;
  }
}

/**
 * Liderlik tablosu fonksiyonu
 * 
 * @param gameCode - Oyun kodu
 * @param period - Periyot ('daily', 'weekly', 'all-time')
 * @param limit - Kaç kullanıcı gösterilecek (varsayılan: 50)
 * @returns Liderlik tablosu
 */
export async function getGameLeaderboard(
  gameCode: GameType,
  period: 'daily' | 'weekly' | 'all-time' = 'all-time',
  limit: number = 50
) {
  try {
    // MiniGame'i bul
    const miniGame = await prisma.miniGame.findUnique({
      where: { code: gameCode },
    });

    if (!miniGame) {
      return [];
    }

    // Tarih aralığını belirle
    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all-time':
      default:
        startDate = undefined;
        break;
    }

    // Filtre oluştur
    const where: any = {
      gameId: miniGame.id,
      completed: true,
    };

    if (startDate) {
      where.completedAt = {
        gte: startDate,
      };
    }

    // En yüksek skorları getir (her kullanıcı için en yüksek skor)
    const topScores = await prisma.gameSession.groupBy({
      by: ['userId'],
      where,
      _max: {
        score: true,
      },
      orderBy: {
        _max: {
          score: 'desc',
        },
      },
      take: limit,
    });

    // Kullanıcı bilgilerini getir
    const leaderboard = await Promise.all(
      topScores.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        });

        return {
          userId: entry.userId,
          userName: user?.name || user?.username || 'Anonim',
          userImage: user?.image || null,
          score: entry._max.score || 0,
          rank: index + 1,
        };
      })
    );

    return leaderboard;
  } catch (error) {
    console.error('Liderlik tablosu getirme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının oyun istatistiklerini getir
 * 
 * @param userId - Kullanıcı ID
 * @param gameCode - Oyun kodu (opsiyonel)
 * @returns Oyun istatistikleri
 */
export async function getUserGameStats(userId: string, gameCode?: GameType) {
  try {
    const where: any = { 
      userId,
      completed: true,
    };
    
    if (gameCode) {
      const miniGame = await prisma.miniGame.findUnique({
        where: { code: gameCode },
      });
      if (miniGame) {
        where.gameId = miniGame.id;
      }
    }

    const stats = await prisma.gameSession.aggregate({
      where,
      _count: true,
      _sum: {
        score: true,
        coinsEarned: true,
      },
      _max: {
        score: true,
      },
      _avg: {
        score: true,
      },
    });

    // Bugün oynanan oyun sayısı
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const playedToday = await prisma.gameSession.count({
      where: {
        userId,
        startedAt: {
          gte: today,
        },
      },
    });

    return {
      totalGames: stats._count,
      totalScore: stats._sum?.score || 0,
      totalCoinsEarned: stats._sum?.coinsEarned || 0,
      highScore: stats._max?.score || 0,
      averageScore: Math.round(stats._avg?.score || 0),
      playedToday,
      remainingPlays: Math.max(0, DAILY_GAME_LIMIT - playedToday),
    };
  } catch (error) {
    console.error('Kullanıcı oyun istatistikleri getirme hatası:', error);
    throw error;
  }
}

/**
 * Yüksek skor kontrolü
 * 
 * @param userId - Kullanıcı ID
 * @param gameCode - Oyun kodu
 * @param score - Yeni skor
 * @returns Yüksek skor mu (true/false)
 */
async function checkHighScore(
  userId: string,
  gameCode: GameType,
  score: number
): Promise<boolean> {
  try {
    const miniGame = await prisma.miniGame.findUnique({
      where: { code: gameCode },
    });

    if (!miniGame) {
      return true;
    }

    const previousHighScore = await prisma.gameSession.findFirst({
      where: {
        userId,
        gameId: miniGame.id,
        completed: true,
      },
      orderBy: {
        score: 'desc',
      },
      select: {
        score: true,
      },
    });

    if (!previousHighScore) {
      return true; // İlk oyun
    }

    return score > previousHighScore.score;
  } catch (error) {
    console.error('Yüksek skor kontrolü hatası:', error);
    return false;
  }
}

/**
 * Kullanıcının günlük oyun durumunu getir
 * 
 * @param userId - Kullanıcı ID
 * @returns Her oyun için günlük durum
 */
export async function getDailyGameStatus(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gameStatus = await Promise.all(
      Object.values(GameType).map(async (gameCode) => {
        const miniGame = await prisma.miniGame.findUnique({
          where: { code: gameCode },
        });

        if (!miniGame) {
          return {
            gameCode,
            playedToday: 0,
            remainingPlays: DAILY_GAME_LIMIT,
            canPlay: true,
            highScore: 0,
          };
        }

        const playedToday = await prisma.gameSession.count({
          where: {
            userId,
            gameId: miniGame.id,
            startedAt: {
              gte: today,
            },
          },
        });

        const highScore = await prisma.gameSession.findFirst({
          where: {
            userId,
            gameId: miniGame.id,
            completed: true,
          },
          orderBy: {
            score: 'desc',
          },
          select: {
            score: true,
          },
        });

        return {
          gameCode,
          playedToday,
          remainingPlays: Math.max(0, DAILY_GAME_LIMIT - playedToday),
          canPlay: playedToday < DAILY_GAME_LIMIT,
          highScore: highScore?.score || 0,
        };
      })
    );

    return gameStatus;
  } catch (error) {
    console.error('Günlük oyun durumu getirme hatası:', error);
    throw error;
  }
}

/**
 * Tüm oyunların genel istatistiklerini getir
 * 
 * @returns Genel oyun istatistikleri
 */
export async function getGlobalGameStats() {
  try {
    const stats = await Promise.all(
      Object.values(GameType).map(async (gameCode) => {
        const miniGame = await prisma.miniGame.findUnique({
          where: { code: gameCode },
        });

        if (!miniGame) {
          return {
            gameCode,
            totalGames: 0,
            totalCoinsDistributed: 0,
            highestScore: 0,
            averageScore: 0,
            uniquePlayers: 0,
          };
        }

        const gameStats = await prisma.gameSession.aggregate({
          where: {
            gameId: miniGame.id,
            completed: true,
          },
          _count: true,
          _sum: {
            coinsEarned: true,
          },
          _max: {
            score: true,
          },
          _avg: {
            score: true,
          },
        });

        // Benzersiz oyuncu sayısı
        const uniquePlayers = await prisma.gameSession.groupBy({
          by: ['userId'],
          where: {
            gameId: miniGame.id,
            completed: true,
          },
        });

        return {
          gameCode,
          totalGames: gameStats._count,
          totalCoinsDistributed: gameStats._sum?.coinsEarned || 0,
          highestScore: gameStats._max?.score || 0,
          averageScore: Math.round(gameStats._avg?.score || 0),
          uniquePlayers: uniquePlayers.length,
        };
      })
    );

    return stats;
  } catch (error) {
    console.error('Genel oyun istatistikleri getirme hatası:', error);
    throw error;
  }
}

/**
 * Oyun oturumunu iptal et
 * 
 * @param sessionId - Oyun oturumu ID
 * @param userId - Kullanıcı ID (güvenlik kontrolü için)
 * @returns İptal sonucu
 */
export async function cancelGameSession(sessionId: string, userId: string) {
  try {
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        game: true,
      },
    });

    if (!gameSession) {
      throw new Error(GAME_ERROR_MESSAGES.GAME_SESSION_NOT_FOUND);
    }

    if (gameSession.userId !== userId) {
      throw new Error('Bu oyun oturumu size ait değil');
    }

    if (gameSession.completed) {
      throw new Error('Tamamlanmış oyun oturumu iptal edilemez');
    }

    // Oturumu sil
    await prisma.gameSession.delete({
      where: { id: sessionId },
    });

    console.log(
      `Oyun oturumu iptal edildi: ${gameSession.game.code} - Kullanıcı: ${userId} - Oturum ID: ${sessionId}`
    );

    return {
      success: true,
      message: 'Oyun oturumu iptal edildi',
    };
  } catch (error) {
    console.error('Oyun oturumu iptal etme hatası:', error);
    throw error;
  }
}

/**
 * Oyun adını getir
 */
function getGameName(gameCode: GameType): string {
  const names: Record<GameType, string> = {
    [GameType.CALORIE_GUESS]: 'Kalori Tahmin Oyunu',
    [GameType.MEMORY_CARDS]: 'Hafıza Kartları',
    [GameType.NUTRITION_QUIZ]: 'Beslenme Bilgi Yarışması',
    [GameType.DAILY_PUZZLE]: 'Günlük Bulmaca',
  };
  return names[gameCode] || gameCode;
}

/**
 * Oyun açıklamasını getir
 */
function getGameDescription(gameCode: GameType): string {
  const descriptions: Record<GameType, string> = {
    [GameType.CALORIE_GUESS]: 'Yiyeceklerin kalorisini tahmin ederek puan kazan!',
    [GameType.MEMORY_CARDS]: 'Sağlıklı yiyeceklerin eşleşmelerini bularak hafızanı geliştir!',
    [GameType.NUTRITION_QUIZ]: 'Beslenme bilgini test et ve coin kazan!',
    [GameType.DAILY_PUZZLE]: 'Günlük bulmacayı çöz ve ödül kazan!',
  };
  return descriptions[gameCode] || 'Eğlenceli bir oyun!';
}
