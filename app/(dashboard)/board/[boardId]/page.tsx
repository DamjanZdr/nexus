'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getBoardWithData, getCasesBoardData, getUserBoards } from '@/app/actions/boards'
import { BoardHeader } from '../components/BoardHeader'
import { KanbanBoard } from '../components/KanbanBoard'
import { CustomKanbanBoard } from '../components/CustomKanbanBoard'
import { BoardList } from '../components/BoardList'
import { CreateBoardModal } from '../components/CreateBoardModal'
import { BoardSettingsModal } from '../components/BoardSettingsModal'
import type { Case, Status, Client, Board, BoardStatus, BoardAccess } from '@/types/database'

interface CaseWithRelations extends Case {
  clients?: Client
  status?: Status
}

interface BoardWithAccess extends Board {
  board_access?: BoardAccess[]
}

const CASES_BOARD_ID = '00000000-0000-0000-0000-000000000001'

export default function IndividualBoardPage() {
  const params = useParams()
  const boardId = params.boardId as string

  const [boards, setBoards] = useState<BoardWithAccess[]>([])
  const [board, setBoard] = useState<Board | null>(null)
  const [isCasesBoard, setIsCasesBoard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Cases board data
  const [cases, setCases] = useState<CaseWithRelations[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])

  // Custom board data (future)
  const [customStatuses, setCustomStatuses] = useState<BoardStatus[]>([])

  useEffect(() => {
    fetchBoards()
  }, [])

  useEffect(() => {
    if (boardId) {
      fetchBoardData()
    }
  }, [boardId])

  async function fetchBoards() {
    const result = await getUserBoards()
    if (result?.data) {
      setBoards(result.data as BoardWithAccess[])
    }
  }

  async function fetchBoardData() {
    setLoading(true)
    setError(null)

    // Check if this is the Cases board
    if (boardId === CASES_BOARD_ID) {
      setIsCasesBoard(true)
      const result = await getCasesBoardData()
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.data) {
        setStatuses(result.data.statuses)
        setCases(result.data.cases as CaseWithRelations[])
      }
    } else {
      // Custom board
      setIsCasesBoard(false)
      const result = await getBoardWithData(boardId)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.data) {
        setBoard(result.data)
        setCustomStatuses(result.data.board_statuses || [])
      }
    }

    setLoading(false)
  }

  const handleUpdate = () => {
    fetchBoardData()
  }

  const handleCreateSuccess = () => {
    fetchBoards()
  }

  return (
    <div className="flex h-full">
      {/* Sidebar with Board List */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} border-r border-[hsl(var(--color-border))] flex flex-col transition-all duration-300`}>
        <div className="p-4 h-full flex flex-col">
          <BoardList
            boards={boards}
            currentBoardId={boardId}
            onCreateBoard={() => setIsCreateModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      </div>

      {/* Main Board Content */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-[hsl(var(--color-text-secondary))]">Loading board...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchBoardData}
              className="px-4 py-2 bg-[hsl(var(--color-primary))] text-white rounded-lg hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <BoardHeader 
              boardName={isCasesBoard ? 'Cases' : board?.name}
              boardDescription={isCasesBoard ? 'System board displaying all cases with their current status' : board?.description}
              isSystem={isCasesBoard}
              onSettingsClick={!isCasesBoard ? () => setIsSettingsModalOpen(true) : undefined}
            />
            
            {isCasesBoard ? (
              <KanbanBoard 
                cases={cases}
                statuses={statuses}
                onUpdate={handleUpdate}
              />
            ) : (
              <CustomKanbanBoard 
                statuses={customStatuses}
                boardId={boardId}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <BoardSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        board={board}
        onUpdate={() => {
          fetchBoards()
          fetchBoardData()
        }}
      />
    </div>
  )
}
