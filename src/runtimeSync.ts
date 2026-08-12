import type { EditorState } from './types'

export const editorStorageKey = 'deeoverlays-stage-one'
export const runtimeChannelName = 'deeoverlays-runtime'

export type RuntimeMessage =
  | { type: 'configuration'; state: EditorState }
  | { type: 'test-alert' }

export function createRuntimeChannel() {
  return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(runtimeChannelName)
}
