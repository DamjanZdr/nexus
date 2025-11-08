'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get all boards accessible by the current user
 * Returns boards with access information for categorization
 */
export async function getUserBoards() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // First, get all boards the user can access
  const { data: boards, error: boardsError } = await supabase
    .from('boards')
    .select('*')
    .order('is_system', { ascending: false })
    .order('created_at', { ascending: false })

  if (boardsError) {
    return { error: boardsError.message }
  }

  // Then, for each board, get the access count
  const boardsWithAccess = await Promise.all(
    (boards || []).map(async (board) => {
      const { data: accessData, error: accessError } = await supabase
        .from('board_access')
        .select('id, user_id, access_level')
        .eq('board_id', board.id)

      return {
        ...board,
        board_access: accessError ? [] : accessData
      }
    })
  )

  return { data: boardsWithAccess }
}

/**
 * Create a new custom board
 */
export async function createBoard(name: string, description?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!name || name.trim().length === 0) {
    return { error: 'Board name is required' }
  }

  // Create the board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({
      name: name.trim(),
      description: description?.trim(),
      owner_id: user.id,
      is_system: false
    })
    .select()
    .single()

  if (boardError) {
    return { error: boardError.message }
  }

  // Grant owner access
  const { data: accessData, error: accessError } = await supabase
    .from('board_access')
    .insert({
      board_id: board.id,
      user_id: user.id,
      access_level: 'owner',
      granted_by: user.id
    })
    .select()
    .single()

  if (accessError) {
    // Rollback: delete the board if access creation fails
    await supabase.from('boards').delete().eq('id', board.id)
    return { error: 'Failed to set board permissions: ' + accessError.message }
  }

  // Create default statuses: To Do, In Progress, Done
  const defaultStatuses = [
    { name: 'To Do', position: 0, color: '#94a3b8' }, // slate-400
    { name: 'In Progress', position: 1, color: '#3b82f6' }, // blue-500
    { name: 'Done', position: 2, color: '#22c55e' } // green-500
  ]

  const { error: statusError } = await supabase
    .from('board_statuses')
    .insert(
      defaultStatuses.map(status => ({
        board_id: board.id,
        ...status
      }))
    )

  if (statusError) {
    console.error('Default status creation error:', statusError)
    // Don't rollback - board is still usable, user can add statuses manually
  }

  revalidatePath('/board')
  return { data: board }
}

/**
 * Update board details (name, description)
 */
export async function updateBoard(boardId: string, updates: { name?: string; description?: string }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { error: 'Board name cannot be empty' }
  }

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name.trim()
  if (updates.description !== undefined) updateData.description = updates.description.trim()

  const { data, error } = await supabase
    .from('boards')
    .update(updateData)
    .eq('id', boardId)
    .eq('owner_id', user.id)
    .eq('is_system', false)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/board')
  revalidatePath(`/board/${boardId}`)
  return { data }
}

/**
 * Delete a custom board (must be owner, cannot delete system boards)
 */
export async function deleteBoard(boardId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('owner_id', user.id)
    .eq('is_system', false)

  if (error) return { error: error.message }
  
  revalidatePath('/board')
  return { success: true }
}

/**
 * Get board with all data (statuses, cards, access)
 * For Cases board, returns null as it uses different data sources
 */
export async function getBoardWithData(boardId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if this is the Cases board
  if (boardId === '00000000-0000-0000-0000-000000000001') {
    return { isCasesBoard: true }
  }

  // Get board with statuses
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select(`
      *,
      board_statuses (
        id,
        name,
        position,
        color,
        created_at,
        updated_at
      )
    `)
    .eq('id', boardId)
    .single()

  if (boardError) return { error: boardError.message }

  // Get board access separately (no join to users since there's no FK)
  const { data: boardAccess, error: accessError } = await supabase
    .from('board_access')
    .select('id, user_id, access_level, granted_at')
    .eq('board_id', boardId)

  if (accessError) {
    console.error('Error fetching board access:', accessError)
  }

  return { 
    data: {
      ...board,
      board_access: boardAccess || []
    }
  }
}

/**
 * Get Cases board data (cases + statuses from existing tables)
 */
export async function getCasesBoardData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch statuses
  const { data: statuses, error: statusError } = await supabase
    .from('status')
    .select('*')
    .order('position', { ascending: true })

  if (statusError) return { error: statusError.message }

  // Fetch cases with relations
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select(`
      *,
      clients (
        id,
        client_code,
        first_name,
        last_name,
        contact_email
      ),
      status (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (casesError) return { error: casesError.message }

  return { data: { statuses, cases } }
}

// ============================================
// CARD ACTIONS
// ============================================

/**
 * Get cards for a specific board
 */
export async function getBoardCards(boardId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error) return { error: error.message }
  
  return { data }
}

/**
 * Create a new card
 */
export async function createCard(
  boardId: string, 
  statusId: string, 
  title: string, 
  description?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!title || title.trim().length === 0) {
    return { error: 'Card title is required' }
  }

  // Get the highest position in this status
  const { data: existingCards } = await supabase
    .from('cards')
    .select('position')
    .eq('status_id', statusId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existingCards && existingCards.length > 0 
    ? existingCards[0].position + 1 
    : 0

  const { data, error } = await supabase
    .from('cards')
    .insert({
      board_id: boardId,
      status_id: statusId,
      title: title.trim(),
      description: description?.trim(),
      position: nextPosition,
      created_by: user.id
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath(`/board/${boardId}`)
  return { data }
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string, 
  updates: { title?: string; description?: string; status_id?: string }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (updates.title !== undefined && updates.title.trim().length === 0) {
    return { error: 'Card title cannot be empty' }
  }

  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title.trim()
  if (updates.description !== undefined) updateData.description = updates.description.trim()
  if (updates.status_id !== undefined) updateData.status_id = updates.status_id

  const { data, error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)
    .select()
    .single()

  if (error) return { error: error.message }
  
  // Get board_id to revalidate
  const { data: card } = await supabase
    .from('cards')
    .select('board_id')
    .eq('id', cardId)
    .single()
  
  if (card) revalidatePath(`/board/${card.board_id}`)
  return { data }
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get board_id before deleting
  const { data: card } = await supabase
    .from('cards')
    .select('board_id')
    .eq('id', cardId)
    .single()

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) return { error: error.message }
  
  if (card) revalidatePath(`/board/${card.board_id}`)
  return { success: true }
}

/**
 * Move card to different status
 */
export async function moveCard(cardId: string, newStatusId: string, newPosition: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('cards')
    .update({ 
      status_id: newStatusId,
      position: newPosition
    })
    .eq('id', cardId)
    .select('board_id')
    .single()

  if (error) return { error: error.message }
  
  if (data) revalidatePath(`/board/${data.board_id}`)
  return { success: true }
}
