import { useIsMobileLayout } from '@/hooks/useMediaQuery'
import { useFullscreen } from '@/hooks/useFullscreen'
import { isMacPlatform } from '@/lib/platform'

/** Extra left inset for macOS window traffic lights (windowed desktop only). */
export function useMacTitleBarInset(): boolean {
  const isMobile = useIsMobileLayout()
  const fullscreen = useFullscreen()
  return isMacPlatform() && !isMobile && !fullscreen
}
