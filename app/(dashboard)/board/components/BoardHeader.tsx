import { Button } from '@/components/ui/Button'

interface BoardHeaderProps {
  boardName?: string
  boardDescription?: string
  isSystem?: boolean
  onSettingsClick?: () => void
}

export function BoardHeader({ boardName = 'Board', boardDescription, isSystem = false, onSettingsClick }: BoardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
            {boardName}
          </h1>
          {isSystem && (
            <span className="px-2 py-1 text-xs bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-secondary))] rounded border border-[hsl(var(--color-border))]">
              System Board
            </span>
          )}
        </div>
        {boardDescription && (
          <p className="text-[hsl(var(--color-text-secondary))] mt-2">
            {boardDescription}
          </p>
        )}
      </div>
      {!isSystem && onSettingsClick && (
        <Button onClick={onSettingsClick} variant="ghost">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Board Settings
        </Button>
      )}
    </div>
  )
}
