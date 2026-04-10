# be-* Enhancement Conversion Guide

## Purpose

This steering file provides guidance for converting legacy "be-*" enhancement projects to the modern architecture. When a user requests help with converting a be-* project, use this guide to structure the conversion process.

## Reference Documentation

The complete step-by-step conversion instructions are maintained in `ConversionInstructions.md` in the types repository root. Always reference that document for detailed instructions on each step.

## Conversion Approach

### When to Use Spec-Based Conversion

For systematic, trackable conversions, create a spec using the conversion template:
- User wants to track progress through the conversion
- User wants to review each step before proceeding
- User is learning the conversion process
- Multiple people are involved in the conversion

### When to Use Direct Conversion

For quick, automated conversions:
- User is familiar with the conversion process
- User wants rapid execution without step-by-step review
- The project is straightforward with no special cases

## Key Principles

1. **Preserve Legacy Code**: Always move existing implementation to the `legacy` folder before making changes
2. **Follow the Order**: The conversion steps have dependencies - follow them in sequence
3. **Verify Each Step**: After each major step, verify the changes work as expected
4. **Reference Examples**: Point to be-a-beacon, be-committed, and be-decked-with as reference implementations

## Common Patterns

### Project Structure Recognition

Identify legacy projects by these characteristics:
- Has `be-enhanced` or `trans-render` dependencies
- Class extends `BE` from be-enhanced
- Has static `config` object in the enhancement class
- Uses `emc.js` with `base`, `branches`, `map` pattern
- Has `ts-refs` submodule for types

### Modern Architecture Indicators

Recognize already-converted projects by:
- Has `be-hive` and `roundabout-lib` dependencies
- Has `emc.mjs` build script
- Has `types` submodule (not `ts-refs`)
- Class doesn't extend anything
- Uses constructor with `enhancedElement`, `ctx`, `initVals` parameters

## Conversion Workflow

When a user asks to convert a be-* project:

1. **Assess the project**: Determine if it's legacy or already converted
2. **Offer spec creation**: Ask if they want a tracked conversion (spec) or direct conversion
3. **Execute systematically**: Follow the 10 steps in ConversionInstructions.md
4. **Verify at milestones**: After steps 3, 7, and 10, suggest running `npm run build` and `npm test`
5. **Reference the guide**: Point users to specific sections of ConversionInstructions.md as needed

## Special Cases

### No Emoji Shorthand
If the README doesn't have an emoji in the title:
- Skip Step 10 (emoji .mjs creation)
- Update package.json build script to only generate emc.json

### Complex Static Config
If the legacy static config has unusual patterns:
- Carefully map `propDefaults` to the init method
- Preserve any custom logic in action methods
- Document any patterns that don't fit the standard conversion

### Custom Dependencies
If the project uses trans-render utilities:
- Keep those imports in the action methods
- Don't remove them unless they're only used in static config

## Success Criteria

A successful conversion should:
- ✅ Build without errors (`npm run build`)
- ✅ Pass existing tests (`npm test`)
- ✅ Have all legacy files in the `legacy` folder
- ✅ Have modern architecture files (emc.mjs, be-*.js, types)
- ✅ Have updated dependencies (be-hive, roundabout-lib)
- ✅ Generate valid JSON configuration files

## File Reference

Always reference `#[[file:ConversionInstructions.md]]` for the complete step-by-step instructions.
