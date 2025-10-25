'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserMinus, Loader2, Clock, XCircle } from 'lucide-react';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    variant?: 'default' | 'compact';
}

type FollowStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;

export default function FollowButton({
    userId,
    initialIsFollowing = false,
    onFollowChange,
    variant = 'default',
}: FollowButtonProps) {
    const { data: session } = useSession();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [status, setStatus] = useState<FollowStatus>(null);
    const [followId, setFollowId] = useState<string | null>(null);
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
                setStatus(data.status);
                setFollowId(data.followId);
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
            if (status === 'ACCEPTED') {
                // Unfollow
                const res = await fetch(`/api/follow?userId=${userId}`, {
                    method: 'DELETE',
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Takipten çıkılamadı');
                }

                setIsFollowing(false);
                setStatus(null);
                setFollowId(null);
                onFollowChange?.(false);
            } else if (status === 'PENDING') {
                // İstek zaten gönderilmiş, iptal et
                const res = await fetch(`/api/follow?userId=${userId}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setStatus(null);
                    setFollowId(null);
                }
            } else {
                // Takip isteği gönder
                const res = await fetch('/api/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ followingId: userId }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Takip isteği gönderilemedi');
                }

                setStatus('PENDING');
                setFollowId(data.follow?.id);
                onFollowChange?.(false);
            }
        } catch (error: any) {
            console.error('Follow/Unfollow error:', error);
            alert(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
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

    // Status'a göre buton stili ve metni
    const getButtonConfig = () => {
        if (isLoading) {
            return {
                icon: <Loader2 className={`animate-spin ${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'}`} />,
                text: '',
                className: 'bg-gray-200 text-gray-700',
                disabled: true,
            };
        }

        switch (status) {
            case 'PENDING':
                return {
                    icon: <Clock className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />,
                    text: variant === 'default' ? 'İstek Gönderildi' : '',
                    className: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-yellow-300',
                    disabled: false,
                };
            case 'ACCEPTED':
                return {
                    icon: <UserMinus className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />,
                    text: variant === 'default' ? 'Takip Ediliyor' : '',
                    className: 'bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-300',
                    disabled: false,
                };
            case 'REJECTED':
                return {
                    icon: <XCircle className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />,
                    text: variant === 'default' ? 'Reddedildi' : '',
                    className: 'bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300',
                    disabled: false,
                };
            default:
                return {
                    icon: <UserPlus className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />,
                    text: variant === 'default' ? 'Takip Et' : '',
                    className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
                    disabled: false,
                };
        }
    };

    const config = getButtonConfig();

    return (
        <button
            onClick={handleFollow}
            disabled={config.disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${config.className} disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'compact' ? 'text-sm px-3 py-1.5' : ''
                }`}
            title={
                status === 'PENDING'
                    ? 'İstek beklemede - İptal etmek için tıklayın'
                    : status === 'ACCEPTED'
                        ? 'Takipten çıkmak için tıklayın'
                        : status === 'REJECTED'
                            ? 'Tekrar denemek için tıklayın'
                            : 'Takip etmek için tıklayın'
            }
        >
            {config.icon}
            {config.text && <span>{config.text}</span>}
        </button>
    );
}
