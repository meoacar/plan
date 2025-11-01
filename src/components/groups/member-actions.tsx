'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface MemberActionsProps {
  memberId: string;
  memberRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  groupId: string;
  currentUserRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  onRemove?: () => void;
}

export function MemberActions({
  memberId,
  memberRole,
  groupId,
  currentUserRole,
  onRemove,
}: MemberActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Yetki kontrolü
  const canChangeRole = currentUserRole === 'ADMIN';
  const canRemove =
    currentUserRole === 'ADMIN' ||
    (currentUserRole === 'MODERATOR' && memberRole === 'MEMBER');

  if (!canChangeRole && !canRemove) {
    return null;
  }

  const handleRoleChange = async (newRole: 'ADMIN' | 'MODERATOR' | 'MEMBER') => {
    if (isLoading) return;

    const roleLabels = {
      ADMIN: 'Yönetici',
      MODERATOR: 'Moderatör',
      MEMBER: 'Üye',
    };

    const confirmed = confirm(
      `Bu üyeyi ${roleLabels[newRole]} yapmak istediğinizden emin misiniz?`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}/role`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rol değiştirilemedi');
      }

      addToast({
        type: 'success',
        title: `Üye rolü ${roleLabels[newRole]} olarak güncellendi`,
      });
      setShowMenu(false);
      router.refresh();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: error.message || 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;

    const confirmed = confirm(
      'Bu üyeyi gruptan çıkarmak istediğinizden emin misiniz?'
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Üye çıkarılamadı');
      }

      addToast({
        type: 'success',
        title: 'Üye gruptan çıkarıldı',
      });
      setShowMenu(false);
      onRemove?.();
      router.refresh();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: error.message || 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 flex items-center gap-1"
      >
        <span>⚙️</span>
        <span>İşlemler</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {canChangeRole && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Rol Değiştir
                </div>
                {memberRole !== 'ADMIN' && (
                  <button
                    onClick={() => handleRoleChange('ADMIN')}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    👑 Yönetici Yap
                  </button>
                )}
                {memberRole !== 'MODERATOR' && (
                  <button
                    onClick={() => handleRoleChange('MODERATOR')}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    🛡️ Moderatör Yap
                  </button>
                )}
                {memberRole !== 'MEMBER' && (
                  <button
                    onClick={() => handleRoleChange('MEMBER')}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    👤 Üye Yap
                  </button>
                )}
                {canRemove && <div className="border-t border-gray-200 my-1" />}
              </>
            )}

            {canRemove && (
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                🚫 Gruptan Çıkar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
