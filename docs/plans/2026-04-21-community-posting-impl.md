# Implementation Plan: Community Posting (Ephemeral)

**Goal:** Implement a modal for creating threads in the community hub with in-memory persistence.

---

### Task 1: Create Modal Component

**Files:**
- Create: `components/social/create-thread-dialog.tsx`

- [ ] **Step 1: Implement `CreateThreadDialog` using `shadcn/ui` Dialog.**
- [ ] **Step 2: Add Title and Body fields.**
- [ ] **Step 3: Add "Broadcast" button that calls an `onSubmit` prop.**

---

### Task 2: Integrate with CommunityHub

**Files:**
- Modify: `components/social/community-hub.tsx`

- [ ] **Step 1: Convert `CommunityHub` to manage `threads` in local state.**
- [ ] **Step 2: Add state for modal visibility.**
- [ ] **Step 3: Implement `handleCreateThread` to update the state.**
- [ ] **Step 4: Connect the "Initialize Discussion" button to the modal.**

---

### Task 3: Validation

- [ ] **Step 1: Manual testing of thread creation.**
- [ ] **Step 2: Verify responsive behavior of the modal.**
- [ ] **Step 3: Run `npm run build` to ensure no regressions.**
