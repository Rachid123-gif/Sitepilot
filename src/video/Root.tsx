import { Composition, registerRoot } from 'remotion'
import { SitePilotPresentation } from './SitePilotPresentation'

export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080
export const DURATION = 92 * FPS // 2760 frames

// Sequence timing (in seconds → frames)
export const SEQ = {
  intro:     { from: 0,   dur: 8  },
  problem:   { from: 8,   dur: 10 },
  dashboard: { from: 18,  dur: 12 },
  map:       { from: 30,  dur: 8  },
  budget:    { from: 38,  dur: 10 },
  photoAI:   { from: 48,  dur: 12 },
  planning:  { from: 60,  dur: 8  },
  report:    { from: 68,  dur: 8  },
  features:  { from: 76,  dur: 8  },
  closing:   { from: 84,  dur: 8  },
} as const

function Root() {
  return (
    <Composition
      id="SitePilotPresentation"
      component={SitePilotPresentation}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}

registerRoot(Root)
