'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    variant?: 'default' | 'compact';
}

export default function FollowButton({
    userId,
    initialIsFollowing = false,
    onFollowChange,
    variant = 'default',
}: FollowButtonProps) {
    const { data: session } = useSession();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Takip durumunu kontrol et
    useEffect(() => {
        if (!session?.user?.id || session.user.id === userId) {
            setIsChecking(false);
            return;
        }

        const checkFollowStatus = async () => {
            try {
                const res = await fetch(`/api/follow/check?userId=${userId}`);
                const data = await res.json();
                setIsFollowing(data.isFollowing);
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkFollowStatus();
    }, [userId, session?.user?.id]);

    const handleFollow = async () => {
        if (!session?.user?.id) {
            alert('Takip etmek için giriş yapmalısınız');
            return;
        }

        setIsLoading(true);
        try {
            if (isFollowing) {
                // Unfollow
                const res = await fetch(`/api/follow?userId=${userId}`, {
                    method: 'DELETE',
                });

                if (!res.ok) throw new Error('Unfollow failed');

                setIsFollowing(false);
                onFollowChange?.(false);
            } else {
                // Follow
                const res = await fetch('/api/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });

                if (!res.ok) throw new Error('Follow failed');

                setIsFollowing(true);
                onFollowChange?.(true);
            }
        } catch (error) {
            console.error('Follow/Unfollow error:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    // Kendi profilinde gösterme
    if (session?.user?.id === userId) {
        return null;
    }

    // Giriş yapmamışsa gösterme
    if (!session?.user?.id) {
        return null;
    }

    if (isChecking) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed ${variant === 'compact' ? 'text-sm px-3 py-1.5' : ''
                    }`}
            >
                <Loader2 className={`animate-spin ${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isFollowing
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'compact' ? 'text-sm px-3 py-1.5' : ''
                }`}
        >
            {isLoading ? (
                <Loader2 className={`animate-spin ${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'}`} />
            ) : isFollowing ? (
                <>
                    <UserMinus className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
                    {variant === 'default' && 'Takipten Çık'}
                </>
            ) : (
                <>
                    <UserPlus className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
                    {variant === 'default' && 'Takip Et'}
                </>
            )}
        </button>
    );
}
