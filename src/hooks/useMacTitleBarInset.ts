import { useIsMobileLayout } from '@/hooks/useMediaQuery'
import { isMacPlatform } from '@/lib/platform'

/** Extra left inset for macOS window controls (desktop layout only). */
export function useMacTitleBarInset(): boolean {
  const isMobile = useIsMobileLayout()
  return isMacPlatform() && !isMobile
}
