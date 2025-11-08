'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserBoards } from '@/app/actions/boards'
import { BoardList } from './components/BoardList'
import { CreateBoardModal } from './components/CreateBoardModal'
import type { Board, BoardAccess } from '@/types/database'

interface BoardWithAccess extends Board {
  board_access?: BoardAccess[]
}

const CASES_BOARD_ID = '00000000-0000-0000-0000-000000000001'

export default function BoardPage() {
  const [boards, setBoards] = useState<BoardWithAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBoards()
  }, [])

  async function fetchBoards() {
    setLoading(true)
    const result = await getUserBoards()
    
    if (result?.data) {
      setBoards(result.data as BoardWithAccess[])
      
      // Redirect to Cases board by default on first load
      router.push(`/board/${CASES_BOARD_ID}`)
    }
    
    setLoading(false)
  }

  const handleCreateSuccess = () => {
    fetchBoards()
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-[hsl(var(--color-border))] p-4">
          <p className="text-[hsl(var(--color-text-secondary))] text-sm">Loading boards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Sidebar with Board List */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} border-r border-[hsl(var(--color-border))] flex flex-col transition-all duration-300`}>
        <div className="p-4 h-full flex flex-col">
          <BoardList
            boards={boards}
            onCreateBoard={() => setIsCreateModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      </div>

      {/* Main Content Area - Show message to select a board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))] mb-2">
            Welcome to Boards
          </h2>
          <p className="text-[hsl(var(--color-text-secondary))]">
            Select a board from the sidebar to get started
          </p>
        </div>
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
