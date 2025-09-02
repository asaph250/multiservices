import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch requests by role
export async function fetchRequests(role, userId) {
  if (role === 'client') {
    // Only requests submitted by this user
    const { data, error } = await supabase
      .from('government_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
  if (role === 'agent') {
    // Only requests assigned to this agent
    const { data, error } = await supabase
      .from('government_requests')
      .select('*')
      .eq('assigned_agent_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
  // Admin: all requests
  const { data, error } = await supabase
    .from('government_requests')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Update request status
export async function updateRequestStatus(requestId, status, agentId = null) {
  let updateObj: { status: string; assigned_agent_id?: string | null } = { status }
  if (agentId) updateObj.assigned_agent_id = agentId
  const { data, error } = await supabase
    .from('government_requests')
    .update(updateObj)
    .eq('id', requestId)
    .select()
  return { data, error }
}

// Subscribe to real-time changes
export function subscribeRequests(callback) {
  return supabase
    .channel('government_requests')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'government_requests' }, payload => {
      callback(payload)
    })
    .subscribe()
}
