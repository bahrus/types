# Conversion Template

This spec template provides a structured approach to converting legacy be-* enhancement projects to the modern architecture.

## When to Use This Template

Use this template when:
- You want to track conversion progress step-by-step
- You're converting a be-* project for the first time
- You want to review each step before proceeding
- Multiple people are involved in the conversion
- You want a record of the conversion process

## How to Use This Template

### Option 1: Copy to Project (Recommended)

1. Copy this entire folder to your project's `.kiro/specs/` directory:
   ```bash
   cp -r types/.kiro/specs/conversion-template .kiro/specs/conversion-[project-name]
   ```

2. Update placeholders in all files:
   - Replace `[PROJECT_NAME]` with your project name (e.g., "be-clonable")
   - Replace `[project-name]` with kebab-case name (e.g., "be-clonable")
   - Replace `[ClassName]` with PascalCase name (e.g., "BeClonable")
   - Replace `[emoji]` with actual emoji if applicable (e.g., "⿻")

3. Work through the tasks in `tasks.md` sequentially

4. Use Kiro to execute tasks: "execute task 1", "execute task 2", etc.

### Option 2: Use as Reference

Simply reference this template while doing a manual conversion:
- Follow the requirements in `requirements.md`
- Understand the architecture from `design.md`
- Use `tasks.md` as a checklist

## Template Structure

### requirements.md
- User stories for each conversion step
- Correctness properties to verify
- Success criteria
- Non-functional requirements

### design.md
- Architecture overview with diagrams
- Component design for each file type
- Data flow explanations
- Design decisions and rationale
- Alternatives considered

### tasks.md
- Detailed task breakdown (11 major tasks, 60+ subtasks)
- Task dependencies
- Execution notes for each step
- Reference to ConversionInstructions.md

## Key Features

### Comprehensive Coverage
All 10 conversion steps from ConversionInstructions.md are covered with detailed subtasks

### Verification Built-in
Task 11 provides comprehensive verification steps to ensure conversion success

### Reference Integration
All files reference ConversionInstructions.md for detailed step-by-step instructions

### Kiro-Optimized
- Uses file references: `#[[file:../../ConversionInstructions.md]]`
- Task format compatible with Kiro's task execution
- Structured for spec-driven development workflow

## Example Usage with Kiro

```
User: "I want to convert be-clonable to the modern architecture"

Kiro: "I can help you with that. Would you like to:
1. Create a tracked conversion spec (recommended for first-time conversions)
2. Do a direct conversion (faster, for experienced users)

User: "Create a spec"

Kiro: [Creates spec from template, updates placeholders]
      "I've created a conversion spec at .kiro/specs/conversion-be-clonable/
       Let's start with Task 1: Migrate Type Definitions. Ready to begin?"

User: "Yes"

Kiro: [Executes Task 1, marks subtasks complete]
      "Task 1 complete. Type definitions migrated to types/be-clonable/.
       Ready for Task 2: Archive Legacy Implementation?"
```

## Success Criteria

A successful conversion using this template should result in:
- ✅ All tasks marked complete
- ✅ `npm run build` succeeds
- ✅ `npm test` passes
- ✅ No TypeScript errors
- ✅ Legacy code preserved in legacy/ folder
- ✅ Modern architecture verified

## Related Files

- `../../ConversionInstructions.md` - Detailed step-by-step instructions
- `../../.kiro/steering/conversion-guide.md` - Kiro steering guidance
- Reference implementations:
  - [be-a-beacon](https://github.com/bahrus/be-a-beacon)
  - [be-committed](https://github.com/bahrus/be-committed)
  - [be-decked-with](https://github.com/bahrus/be-decked-with)

## Customization

Feel free to customize this template for your specific needs:
- Add project-specific tasks
- Modify verification steps
- Add additional correctness properties
- Extend design documentation

## Feedback

If you find issues with this template or have suggestions for improvement, please update the template in the types repository so all projects benefit.
