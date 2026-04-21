# DESIGN DOCUMENT: Community Posting (Ephemeral)

## 1. Objective
Enable users to create and view discussion threads in the Community Hub. This implementation is for testing purposes and will use ephemeral memory (state-based), meaning posts will vanish upon page refresh.

## 2. UI/UX Design
- **Entry Point**: The existing "Initialize Discussion" button in `CommunityHub.tsx`.
- **Modal**: A `shadcn/ui` Dialog containing:
    - **Title**: String input (required).
    - **Content**: Textarea (optional for now, or integrated into the title if simple).
    - **Action**: "Broadcast" or "Initialize" button.
- **Feedback**: Immediate update of the "Active Transmissions" feed.

## 3. Implementation Strategy
- **Persistence**: React `useState` within the `CommunityHub` component.
- **Default User**: All posts will be authored by "Guest" (`{ name: "Guest" }`).
- **Data Structure**:
    ```typescript
    interface Thread {
      id: string;
      title: string;
      author: { name: string };
      createdAt: Date;
      _count: { comments: number };
    }
    ```

## 4. Components
- `CreateThreadDialog.tsx`: New component wrapping the form logic.
- `CommunityHub.tsx`: Updated to handle list state and modal trigger.

## 5. Testing
- Verify modal opens on click.
- Verify "Initialize" adds a new card to the list.
- Verify the list persists during navigation (unless page is hard-refreshed).
