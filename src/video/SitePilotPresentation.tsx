import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion'
import { FPS, SEQ } from './Root'
import { Intro } from './sequences/01-Intro'
import { Problem } from './sequences/02-Problem'
import { Dashboard } from './sequences/03-Dashboard'
import { MapSeq } from './sequences/04-Map'
import { BudgetDetail } from './sequences/05-BudgetDetail'
import { PhotoIA } from './sequences/06-PhotoIA'
import { Planning } from './sequences/07-Planning'
import { Report } from './sequences/08-Report'
import { Features } from './sequences/09-Features'
import { Closing } from './sequences/10-Closing'

const f = (s: number) => s * FPS

// Audio files are placed in public/voiceover/ after running generate-voiceover.ts
// Remotion's staticFile() resolves from the public/ directory at render time.
// Set VOICEOVER=true below once you've generated the audio files.
const VOICEOVER_READY = true

function VO({ seg }: { seg: string }) {
  if (!VOICEOVER_READY) return null
  return <Audio src={staticFile(`voiceover/${seg}.mp3`)} />
}

export function SitePilotPresentation() {
  return (
    <AbsoluteFill style={{ background: '#0a0f1e' }}>
      <Audio src={staticFile('music/bg.mp3')} volume={0.12} />

      <Sequence from={f(SEQ.intro.from)} durationInFrames={f(SEQ.intro.dur)}>
        <VO seg="segment-01" />
        <Intro />
      </Sequence>

      <Sequence from={f(SEQ.problem.from)} durationInFrames={f(SEQ.problem.dur)}>
        <VO seg="segment-02" />
        <Problem />
      </Sequence>

      <Sequence from={f(SEQ.dashboard.from)} durationInFrames={f(SEQ.dashboard.dur)}>
        <VO seg="segment-03" />
        <Dashboard />
      </Sequence>

      <Sequence from={f(SEQ.map.from)} durationInFrames={f(SEQ.map.dur)}>
        <VO seg="segment-04" />
        <MapSeq />
      </Sequence>

      <Sequence from={f(SEQ.budget.from)} durationInFrames={f(SEQ.budget.dur)}>
        <VO seg="segment-05" />
        <BudgetDetail />
      </Sequence>

      <Sequence from={f(SEQ.photoAI.from)} durationInFrames={f(SEQ.photoAI.dur)}>
        <VO seg="segment-06" />
        <PhotoIA />
      </Sequence>

      <Sequence from={f(SEQ.planning.from)} durationInFrames={f(SEQ.planning.dur)}>
        <VO seg="segment-07" />
        <Planning />
      </Sequence>

      <Sequence from={f(SEQ.report.from)} durationInFrames={f(SEQ.report.dur)}>
        <VO seg="segment-08" />
        <Report />
      </Sequence>

      <Sequence from={f(SEQ.features.from)} durationInFrames={f(SEQ.features.dur)}>
        <VO seg="segment-09" />
        <Features />
      </Sequence>

      <Sequence from={f(SEQ.closing.from)} durationInFrames={f(SEQ.closing.dur)}>
        <VO seg="segment-10" />
        <Closing />
      </Sequence>
    </AbsoluteFill>
  )
}
