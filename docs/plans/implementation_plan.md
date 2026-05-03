# Auth, Guest Comments, UX Fixes, Skill Updates & Vercel Analytics

## Goal

1. Implement email/password authentication with persistent sessions
2. Enable guest commenting with physics-themed names (no sign-in required)
3. Track completed articles (green ✓ on modules)
4. Fix share button to include sim state
5. Update article pipeline skills to enforce UX requirements
6. Add Vercel Analytics

---

## Decisions Made (User Approved)

- ✅ Physics-themed random names for anonymous commenters (e.g., "Curious Photon")
- ✅ No "Sign in to comment" bar — everyone can comment
- ✅ Email/password auth with persistent login + welcome email concept
- ✅ Username choosable at signup (many users won't share real name on new site)
- ✅ Admin status via manual DB/script — no admin UI for now (user will share emails)
- ✅ Completed articles tracked in DB (logged-in) / localStorage (guests)
- ✅ Manual verification done by USER, not browser agent

---

## Proposed Changes

### Component 1: Prisma Schema Updates

#### [MODIFY] [schema.prisma](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/prisma/schema.prisma)

Add to `User` model:
- `username String? @unique` — choosable at signup
- `password String?` — hashed, only for credentials auth

Add `guestId` and `guestName` to `Comment` model, make `authorId` optional:
```prisma
model Comment {
  id        String    @id @default(cuid())
  body      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  isDeleted Boolean   @default(false)
  authorId  String?                    // nullable for guests
  guestId   String?                    // localStorage-persisted ID
  guestName String?                    // "Curious Photon" etc.
  articleId String?
  threadId  String?
  parentId  String?
  article   Article?  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  thread    Thread?   @relation(fields: [threadId], references: [id], onDelete: Cascade)
  author    User?     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}
```

Add `CompletedArticle` model:
```prisma
model CompletedArticle {
  id        String   @id @default(cuid())
  userId    String
  slug      String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, slug])
}
```

---

### Component 2: Email/Password Authentication

#### [MODIFY] [auth.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/lib/auth.ts)
- Add `Credentials` provider with email/password validation via bcrypt
- Switch session strategy to `"jwt"` (required for Credentials in NextAuth v5)
- Keep Google/GitHub providers defined but they won't work without OAuth keys

#### [NEW] [register/route.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/api/auth/register/route.ts)
- Validate input with zod (username, email, password)
- Check username/email uniqueness
- Hash password with bcrypt
- Create user in DB
- Return success

#### [MODIFY] [signin/page.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/auth/signin/page.tsx)
- Enable email + password form fields with actual `signIn("credentials", {...})` call
- Google/GitHub buttons stay visible but marked "Coming Soon"
- Add form validation and error display

#### [MODIFY] [signup/page.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/auth/signup/page.tsx)
- Enable full signup form: **username**, email, password
- POST to `/api/auth/register`
- On success → redirect to signin with success message

---

### Component 3: Guest Commenting System

#### [NEW] [guest-identity.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/lib/guest-identity.ts)
- Physics-themed display names: adjective + particle/concept
  - Adjectives: `Curious, Wandering, Silent, Brave, Quantum, Hidden, Restless, Drifting, Spinning, Orbiting`
  - Nouns: `Photon, Muon, Neutron, Quark, Lepton, Boson, Fermion, Gluon, Meson, Tachyon`
- Stable guest ID: `guest_<random-8-chars>`
- Stored in localStorage key `physova_guest`
- Helper: `getGuestIdentity()` → `{ guestId, displayName }`

#### [MODIFY] [comments/route.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/api/comments/route.ts)
- POST: Allow unauthenticated — accept `guestId` + `guestName` in body
- If session → use `authorId`; if not → require `guestId`/`guestName`
- GET: Include guest fields in response

#### [MODIFY] [comments/[id]/route.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/api/comments/%5Bid%5D/route.ts)
- Allow guest deletion via `x-guest-id` header matching `guestId` on comment

#### [MODIFY] [comments-section.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/components/social/comments-section.tsx)
- Remove "Sign in to comment" block entirely
- Always show comment input for everyone
- Existing comments render FIRST, then comment input at bottom
- For guests: send `guestId` + `guestName` from localStorage
- Show subtle `"Guest"` badge next to anonymous usernames
- Guest avatar: first letter of display name on dark background

---

### Component 4: Article Completion Tracking

#### [NEW] [completed/route.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/api/completed/route.ts)
- `POST { slug }` — mark article as completed for current user
- `GET` — return list of completed slugs for current user

#### [MODIFY] [reading-progress.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/components/ui/reading-progress.tsx)
- On 99% completion: POST to `/api/completed` if logged in, save to localStorage if guest

#### [MODIFY] topics-list component
- Fetch completed slugs (API for logged-in, localStorage for guests)
- Show green ✓ on completed module cards

---

### Component 5: Share Button Fix

#### [MODIFY] [topic-actions.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/components/social/topic-actions.tsx)
- Share button: encode current simulation state via `useSimulationStore.getState().serialize()`
- Construct URL: `origin + pathname + "?sim=" + encoded`
- Copy that to clipboard instead of bare `window.location.href`

#### [NEW] [sim-state-loader.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/components/simulations/sim-state-loader.tsx)
- Client component that reads `?sim=` query param on mount
- Deserializes and applies to simulation store
- Used in article page

---

### Component 6: Skill/Agent File Updates

The article pipeline skills aren't enforcing these requirements on new articles. Add mandatory rules:

#### [MODIFY] [build-master SKILL.md](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/.agent/skills/build-master/SKILL.md)
Already has Task 5 (Related Articles) and Task 6 (Reading Progress) — these are good. Add:
- **Task 4b: Update equation-sim-map.ts (MANDATORY, not optional)** — Every simulation MUST have at least one equation mapped to it so "Simulate This Equation" buttons work. The `id` on the LabContainer (`lab-{slug}`) is what `equation-block.tsx` scrolls to.
- **Task 5b: Share button sim state** — Verify that new sim's parameters are included in the `SIM_PARAMS` array in `simulation-store.ts` OR (for local-state sims) document that share button only works with store-based sims.

#### [MODIFY] [simulation-engineer SKILL.md](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/.agent/skills/simulation-engineer/SKILL.md)
Add to verification checklist:
- **Phase G: Equation-Sim Map Integration**
  - [ ] At least ONE equation from the article is mapped in `lib/equation-sim-map.ts`
  - [ ] The `type` in the map matches the `simType` prop on the LabContainer
  - [ ] The `id` prop on LabContainer is `lab-{slug}` — this is what "Simulate This Equation" scrolls to
- **Phase H: Simulation Start Behavior**
  - [ ] Simulation does NOT auto-play on page load. `isPlaying` starts as `false` — user must click Play
  - [ ] Exception: ambient/decorative animations (gentle rotation) can run, but physics calculations must NOT start until Play

#### [MODIFY] [article-orchestrator SKILL.md](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/.agent/skills/article-orchestrator/SKILL.md)
Add to Phase 5 (Stitching & Validation) requirements:
- Verify equation-sim-map has entries for the new simulation
- Verify LabContainer `id` matches `lab-{slug}` pattern

---

### Component 7: Vercel Analytics

#### Install `@vercel/analytics`

#### [MODIFY] [layout.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Quanim-main/app/layout.tsx)
- Import `{ Analytics }` from `"@vercel/analytics/next"`
- Add `<Analytics />` inside `<body>` after `<Providers>`

---

## Verification Plan

### Automated
- `npx prisma db push` — verify schema changes apply
- `npm run build` — no TypeScript errors
- Install `@vercel/analytics` and `bcrypt`/`bcryptjs` packages

### Manual (USER will test)
- Sign up with username + email + password
- Sign in with same credentials
- Post a comment as guest (no login)
- Verify guest name is physics-themed and persists on refresh
- Scroll to bottom of article → verify ✓ appears on topics page
- Click share → paste URL → verify sim state loads
- Check network tab for Vercel analytics script
