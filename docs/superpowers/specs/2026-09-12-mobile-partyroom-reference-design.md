# Mobile Partyroom Reference UI Design

## Goal

Align the mobile partyroom experience with the supplied reference screens while preserving the existing realtime playback, chat, queue, playlist, and music-search behavior.

The target is a 390px-class portrait viewport (the supplied reference is 780px wide at 2x density). The visual language is a dark stage: black surfaces, a red accent, a full-bleed partyroom background on the room screen, large white headings, and rounded translucent overlays.

## Screen states

### Main Stage

- The room is a full-height viewport with `Partyroom.png` as a cover background and a dark overlay for legibility.
- The header overlays the background and contains a back action, centered `Main Stage` title, and crew count.
- The notice banner sits below the header. It keeps the speaker icon, two-line message, and dismiss action.
- Empty playback shows the PFPlay mark and the two-line empty-state copy centered in the stage.
- Active playback shows the full-width YouTube frame, playback metadata/reaction controls, and the existing playback lifecycle behavior.
- The chat panel is a dark card above the bottom action bar. It is compact by default and shows the input; when the input receives focus it expands into the large chat card, shows messages, and exposes a close button that returns it to compact mode.
- The bottom action bar is a translucent rounded pill with profile, playlist, DJ queue, and share actions. DJ queue opens the Now DJing screen.

### Now DJing

- Fullscreen black surface, safe-area aware.
- Header has a left close icon and centered `Now DJing` title.
- Empty message is vertically centered.
- Notice banner is positioned above two full-width CTA buttons near the bottom.
- The primary CTA opens song selection. The secondary CTA opens playlist selection/management using the existing playlist flow.

### Song selection and song addition

- Fullscreen black surface with a back icon and centered Korean title (`곡 선택` or `곡 추가`).
- Search field is a wide dark-gray rounded rectangle below the header, with a large search icon.
- Empty search state is centered in the remaining viewport.
- Search results use the existing music API and thumbnails. Each row has a fixed thumbnail, two-line title, and right-aligned duration.
- The selected row uses the reference dark-red background.
- The registration CTA is fixed to the bottom, separated by a border, and disabled until a result is selected.

## Component boundaries

- `partyroom-page-mobile/room.component.tsx` owns the room shell and composes the background, display board, chat overlay, and bottom action bar.
- `partyroom-display-board` keeps playback/query logic but receives the visual shell state required to render full-bleed mobile layout.
- `partyroom-chat-panel` owns message filtering, send behavior, and the compact/expanded state. The state is local to the mobile chat panel; closing only collapses the panel and does not discard the draft.
- `partyroom-djing-sheet` remains the fullscreen navigation host. Its header/body/footer styling is updated to match the reference. The queue action pushes a Now DJing entry, and its CTAs push song selection or the existing playlist flow.
- `features-mobile/playlist/add-tracks/ui/music-search.component.tsx` keeps the shared query and result behavior but adopts the reference row/input layout.

## Interaction rules

- Focus or pointer interaction with the chat input expands the chat card. The close button collapses it.
- Back/close actions use the existing router/history-backed sheet behavior.
- Selecting a track updates the selected row and enables the fixed registration action. Registration invokes the existing mutation and closes the selection flow on success.
- Existing chat moderation filters, scroll anchoring, autoplay gesture gating, playlist selection, and API contracts remain unchanged.

## Verification

- Add or update unit tests for compact/expanded chat, close behavior, fullscreen sheet navigation, track selection, and CTA enablement.
- Run targeted mobile widget tests, typecheck, lint, and a production build if the environment permits.
- Visually inspect the mobile room and fullscreen flows at a 390px portrait viewport, including empty playback, active playback, expanded chat, empty search, and selected search result.

## Out of scope

- Desktop layout changes unless a shared component must be adjusted to support the mobile styling.
- New dependencies, new APIs, or changes to websocket/store contracts.
- Replacing the existing YouTube player or playlist business logic.
