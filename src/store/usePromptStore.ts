import { create } from 'zustand'

export type PromptRequest = {
  kind: 'prompt'
  title: string
  message?: string
  label?: string
  placeholder?: string
  defaultValue?: string
  confirmLabel?: string
  cancelLabel?: string
}

export type ConfirmRequest = {
  kind: 'confirm'
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ActiveRequest = PromptRequest | ConfirmRequest

type PromptResult = string | null
type ConfirmResult = boolean

interface PromptState {
  active: ActiveRequest | null
  value: string
  showPrompt: (request: Omit<PromptRequest, 'kind'>) => Promise<PromptResult>
  showConfirm: (request: Omit<ConfirmRequest, 'kind'>) => Promise<ConfirmResult>
  setValue: (value: string) => void
  submit: () => void
  cancel: () => void
}

let resolvePrompt: ((value: PromptResult) => void) | null = null
let resolveConfirm: ((value: ConfirmResult) => void) | null = null

function clearResolver() {
  resolvePrompt = null
  resolveConfirm = null
}

export const usePromptStore = create<PromptState>((set, get) => ({
  active: null,
  value: '',

  showPrompt: (request) =>
    new Promise((resolve) => {
      if (get().active) {
        resolve(null)
        return
      }
      resolvePrompt = resolve
      set({
        active: { kind: 'prompt', ...request },
        value: request.defaultValue ?? '',
      })
    }),

  showConfirm: (request) =>
    new Promise((resolve) => {
      if (get().active) {
        resolve(false)
        return
      }
      resolveConfirm = resolve
      set({
        active: { kind: 'confirm', ...request },
        value: '',
      })
    }),

  setValue: (value) => set({ value }),

  submit: () => {
    const { active, value } = get()
    if (!active) return

    if (active.kind === 'prompt') {
      resolvePrompt?.(value)
      clearResolver()
      set({ active: null, value: '' })
      return
    }

    resolveConfirm?.(true)
    clearResolver()
    set({ active: null, value: '' })
  },

  cancel: () => {
    const { active } = get()
    if (!active) return

    if (active.kind === 'prompt') {
      resolvePrompt?.(null)
    } else {
      resolveConfirm?.(false)
    }
    clearResolver()
    set({ active: null, value: '' })
  },
}))

export async function promptForText(
  request: Omit<PromptRequest, 'kind'>
): Promise<PromptResult> {
  return usePromptStore.getState().showPrompt(request)
}

export async function confirmAction(
  request: Omit<ConfirmRequest, 'kind'>
): Promise<ConfirmResult> {
  return usePromptStore.getState().showConfirm(request)
}
