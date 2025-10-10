# Implementation Guide: User-Controlled Section Order

## Summary

The refactoring to allow user-controlled section ordering (instead of predefined MCQ-first) has been started but requires completion. Here's what needs to be done:

## Current State

- Started converting to unified `sections` array that maintains creation order
- Need to complete the rendering components to use this array
- Need to update all state management to work with unified structure

## Simpler Alternative Approach

Instead of the complex refactoring, here's a simpler solution:

### Keep existing state structure but add section order tracking:

```typescript
// Add this state
const [sectionOrder, setSectionOrder] = useState<
  Array<{ type: "mcq" | "qa"; id: string }>
>([]);

// When creating MCQ section:
setSectionOrder((prev) => [...prev, { type: "mcq", id: mcqSection.id }]);
setIsMCQSectionActive(true);

// When creating QA section:
const newSection = {
  /* ... */
};
setSectionOrder((prev) => [...prev, { type: "qa", id: newSection.id }]);
setQaSections((prev) => [...prev, newSection]);

// When removing section:
setSectionOrder((prev) => prev.filter((s) => s.id !== sectionId));

// When rendering, map over sectionOrder:
{
  sectionOrder.map((item) => {
    if (item.type === "mcq" && isMCQSectionActive) {
      return <MCQSectionComponent key={item.id} />;
    }
    if (item.type === "qa") {
      const section = qaSections.find((s) => s.id === item.id);
      return section ? (
        <QASectionComponent key={item.id} section={section} />
      ) : null;
    }
    return null;
  });
}
```

This approach:

- ✅ Keeps all existing functions working
- ✅ Minimal changes required
- ✅ Maintains creation order
- ✅ Allows any order (MCQ can come after QA)

Would you like me to implement this simpler approach instead?
