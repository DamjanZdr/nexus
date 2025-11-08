'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Board, BoardAccess } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

interface BoardWithAccess extends Board {
  board_access?: BoardAccess[]
}

interface BoardListProps {
  boards: BoardWithAccess[]
  currentBoardId?: string
  onCreateBoard: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

type TabType = 'shared' | 'private'

export function BoardList({ boards, currentBoardId, onCreateBoard, isCollapsed, onToggleCollapse }: BoardListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('shared')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getCurrentUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    getCurrentUser()
  }, [])

  // Auto-switch to the tab containing the current board
  useEffect(() => {
    if (!currentBoardId || !currentUserId) return
    
    const currentBoard = boards.find(b => b.id === currentBoardId)
    if (!currentBoard) return

    // Determine which tab this board belongs to
    if (currentBoard.is_system) {
      setActiveTab('shared')
    } else {
      const accessCount = currentBoard.board_access?.length || 0
      const isOwner = currentBoard.owner_id === currentUserId
      
      if (isOwner && accessCount === 1) {
        setActiveTab('private')
      } else {
        setActiveTab('shared')
      }
    }
  }, [currentBoardId, boards, currentUserId])

  // Categorize boards
  const categorizedBoards = boards.reduce((acc, board) => {
    // System boards (like Cases) always go to SHARED
    if (board.is_system) {
      acc.shared.push(board)
      return acc
    }

    if (!currentUserId) return acc

    const accessCount = board.board_access?.length || 0
    const isOwner = board.owner_id === currentUserId

    // Private: Owner and only owner has access (access count = 1)
    // Shared: 
    //   - Owner with others (access count > 1)
    //   - User is not owner (someone shared it with them)
    if (isOwner && accessCount === 1) {
      acc.private.push(board)
    } else if (accessCount > 1 || !isOwner) {
      acc.shared.push(board)
    }

    return acc
  }, { private: [] as BoardWithAccess[], shared: [] as BoardWithAccess[] })

  const displayBoards = activeTab === 'shared' ? categorizedBoards.shared : categorizedBoards.private

  const handleBoardClick = (boardId: string) => {
    router.push(`/board/${boardId}`)
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-[hsl(var(--color-surface-hover))] rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5 text-[hsl(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">Boards</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-[hsl(var(--color-surface-hover))] rounded-lg transition-colors"
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Tabs - evenly split */}
      <div className="grid grid-cols-2 border-b border-[hsl(var(--color-border))]">
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 font-medium transition-colors relative text-center ${
            activeTab === 'shared'
              ? 'text-[hsl(var(--color-primary))]'
              : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]'
          }`}
        >
          Shared
          <span className="ml-1 text-xs">({categorizedBoards.shared.length})</span>
          {activeTab === 'shared' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--color-primary))]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`px-4 py-2 font-medium transition-colors relative text-center ${
            activeTab === 'private'
              ? 'text-[hsl(var(--color-primary))]'
              : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]'
          }`}
        >
          Private
          <span className="ml-1 text-xs">({categorizedBoards.private.length})</span>
          {activeTab === 'private' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--color-primary))]" />
          )}
        </button>
      </div>

      {/* Create Board Button (only on Private tab) */}
      {activeTab === 'private' && (
        <Button onClick={onCreateBoard} className="w-full">
          + Create Board
        </Button>
      )}

      {/* Board List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {displayBoards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[hsl(var(--color-text-secondary))] text-sm">
              {activeTab === 'private' 
                ? 'No private boards yet. Create one to get started!' 
                : 'No shared boards yet.'}
            </p>
          </div>
        ) : (
          displayBoards.map(board => (
            <Card
              key={board.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                currentBoardId === board.id
                  ? 'border-2 border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))]/5'
                  : 'border border-[hsl(var(--color-border))]'
              }`}
              onClick={() => handleBoardClick(board.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[hsl(var(--color-text-primary))] truncate">
                      {board.name}
                    </h3>
                    {board.is_system && (
                      <span className="px-2 py-0.5 text-xs bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text-secondary))] rounded border border-[hsl(var(--color-border))]">
                        System
                      </span>
                    )}
                  </div>
                  {board.description && (
                    <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-1 line-clamp-2">
                      {board.description}
                    </p>
                  )}
                  {activeTab === 'shared' && board.board_access && board.board_access.length > 1 && (
                    <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-1">
                      Shared with {board.board_access.length - 1} {board.board_access.length - 1 === 1 ? 'person' : 'people'}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
