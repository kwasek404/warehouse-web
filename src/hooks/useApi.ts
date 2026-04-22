import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export function useBoxes(parentId?: string | null) {
  return useQuery({
    queryKey: ['boxes', parentId],
    queryFn: () => api.boxes.list(parentId),
  })
}

export function useBox(id: string) {
  return useQuery({
    queryKey: ['box', id],
    queryFn: () => api.boxes.get(id),
  })
}

export function useAllBoxes() {
  return useQuery({
    queryKey: ['boxes', 'all'],
    queryFn: () => api.boxes.list(),
  })
}

export function useItems(params: { box_id?: string; q?: string; tags?: string } = {}) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => api.items.list(params),
    enabled: params.q !== undefined ? params.q.length > 1 : true,
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => api.items.get(id),
  })
}

export function useCheckouts() {
  return useQuery({
    queryKey: ['checkouts'],
    queryFn: api.checkouts.list,
  })
}

export function useCreateBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.boxes.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boxes'] }),
  })
}

export function useUpdateBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof api.boxes.update>[1]) =>
      api.boxes.update(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['boxes'] })
      qc.invalidateQueries({ queryKey: ['box', vars.id] })
    },
  })
}

export function useDeleteBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.boxes.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boxes'] }),
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.items.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['boxes'] })
    },
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof api.items.update>[1]) =>
      api.items.update(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', vars.id] })
      qc.invalidateQueries({ queryKey: ['boxes'] })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.items.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['boxes'] })
    },
  })
}

export function useCreateCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.checkouts.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkouts'] })
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item'] })
    },
  })
}

export function useReturnCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, returned_quantity }: { id: string; returned_quantity?: number }) =>
      api.checkouts.return(id, returned_quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkouts'] })
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item'] })
    },
  })
}
