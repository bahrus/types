# Conversion Instructions

## Introduction

This document provides step-by-step instructions for converting legacy "be-*" enhancement projects to the modern architecture. The conversion process has been successfully applied to several projects including:

- [be-a-beacon](https://github.com/bahrus/be-a-beacon)
- [be-committed](https://github.com/bahrus/be-committed)
- [be-decked-with](https://github.com/bahrus/be-decked-with)

Each of these repositories contains a "legacy" folder showing the original implementation for reference.

## What This Conversion Achieves

The conversion modernizes HTML element enhancement libraries that follow the "be-enhanced" pattern. These enhancements add declarative behaviors to HTML elements through attributes, enabling progressive enhancement without requiring custom elements.

The new architecture provides:

- **Simplified configuration**: Streamlined setup using be-hive's mount observer pattern
- **Better type safety**: Centralized type definitions in a shared types submodule
- **Cleaner separation**: Distinct interfaces for end-user props, internal props, and actions
- **Improved maintainability**: Consistent structure across all enhancement projects
- **Enhanced DX**: Better IDE support through TypeScript definitions

## High-Level Conversion Overview

The conversion transforms projects from a legacy architecture to a modern one that:

1. Uses `be-hive` for enhancement registration and lifecycle management
2. Centralizes type definitions in a shared `types` submodule
3. Separates concerns between end-user properties, internal state, and actions
4. Adopts a declarative configuration approach for defining enhancement behavior
5. Leverages modern ES modules and import patterns

The process involves updating:
- Project structure and file organization
- Type definitions and interfaces
- Enhancement registration and initialization
- Configuration and property handling
- Import/export patterns

## Conversion Steps

### Step 1: Migrate Type Definitions to New Submodule

The first step is to move your project's type definitions from the `ts-refs` submodule to the `types` submodule.

**Why this step?** The legacy architecture used a git submodule called `ts-refs` to share type definitions across all be-* projects. The modern approach uses a renamed submodule called `types` with a clearer, more intuitive name that better communicates its purpose.

**Instructions:**

1. Check if a `ts-refs` folder exists in your project root (it's a git submodule)
2. If it exists, locate the subfolder matching your project name (e.g., `ts-refs/be-clonable` for the be-clonable project)
3. Copy that folder and its contents into the `types` folder (e.g., copy `ts-refs/be-clonable/` to `types/be-clonable/`)
4. Delete the entire `ts-refs` folder using `Remove-Item -Recurse -Force ts-refs` (or `rm -rf ts-refs` on Unix-like systems)

**Result:** You should now have your type definitions at `types/[project-name]/types.d.ts` and the `ts-refs` submodule should be removed.

### Step 2: Archive Legacy Implementation

Before converting to the new architecture, preserve the existing implementation in a `legacy` folder for reference.

**Why this step?** Keeping the original implementation allows you to compare the old and new approaches, verify behavior during conversion, and provides a fallback if needed. It also serves as documentation for others learning about the architectural changes.

**Instructions:**

1. Create a `legacy` folder in your project root if it doesn't exist
2. If the `legacy` folder already exists, empty its contents: `Remove-Item -Path legacy/* -Force` (or `rm -rf legacy/*` on Unix-like systems)
3. Copy all `.js`, `.mjs`, and `.json` files from the root directory to the `legacy` folder, excluding `package.json` and `package-lock.json`
   - Example: `Copy-Item -Path *.js -Destination legacy/`
   - For .json files: `Get-ChildItem -Filter *.json | Where-Object { $_.Name -notlike 'package*.json' } | Copy-Item -Destination legacy/`

**Result:** Your `legacy` folder should now contain copies of all implementation files that will be converted in subsequent steps.

---

*This document is a living guide that will be expanded with detailed instructions for each conversion step.*
