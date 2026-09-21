import { useEditorStore } from '@/store/useEditorStore'

const FLASH_CLASS = 'outline-heading-flash'
export const OUTLINE_FLASH_MS = 2600

export function flashHeadingElement(el: HTMLElement) {
  el.classList.remove(FLASH_CLASS)
  // Force reflow so re-adding the class retriggers the animation
  void el.offsetWidth
  el.classList.add(FLASH_CLASS)
  window.setTimeout(() => el.classList.remove(FLASH_CLASS), OUTLINE_FLASH_MS)
}

export function navigateToOutlineHeading(slug: string) {
  useEditorStore.getState().scrollToHeading?.(slug)
}

export function scrollElementIntoEditorView(el: HTMLElement) {
  const scrollParent = el.closest('.editor-scroll')
  if (scrollParent instanceof HTMLElement) {
    const parentRect = scrollParent.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offset =
      elRect.top - parentRect.top - parentRect.height / 2 + elRect.height / 2
    scrollParent.scrollTo({
      top: scrollParent.scrollTop + offset,
      behavior: 'smooth',
    })
    return
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
