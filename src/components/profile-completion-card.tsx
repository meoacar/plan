'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileCompletion } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileField {
  name: string;
  label: string;
  completed: boolean;
}

interface ProfileCompletionCardProps {
  fields: ProfileField[];
}

export function ProfileCompletionCard({ fields }: ProfileCompletionCardProps) {
  const completedCount = fields.filter(f => f.completed).length;
  const totalCount = fields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Profil Tamamlama
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileCompletion 
          completedFields={completedCount} 
          totalFields={totalCount}
          className="border-0 shadow-none p-0"
        />
        
        <div className="space-y-2">
          {fields.map((field) => (
            <div 
              key={field.name}
              className="flex items-center gap-2 text-sm"
            >
              {field.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={field.completed ? 'text-gray-700' : 'text-gray-500'}>
                {field.label}
              </span>
            </div>
          ))}
        </div>

        {percentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900 font-medium">
              💡 Profilini %100 tamamla ve daha fazla özelliğe erişim kazan!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
