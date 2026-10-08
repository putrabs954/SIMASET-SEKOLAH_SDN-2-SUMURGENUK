import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Extract up to 2 initials (e.g. "Putra Bagus" -> "PB")
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-bold',
    '2xl': 'w-24 h-24 text-2xl font-black',
  };

  const hasPhoto = Boolean(avatarUrl && !imgError);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden aspect-square select-none ${
        sizeClasses[size]
      } ${
        showBorder ? 'ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs' : ''
      } ${
        !hasPhoto
          ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold'
          : 'bg-slate-100 dark:bg-slate-800'
      } ${className}`}
    >
      {hasPhoto ? (
        <img
          src={avatarUrl!}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="leading-none">{getInitials(name)}</span>
      )}
    </div>
  );
};
