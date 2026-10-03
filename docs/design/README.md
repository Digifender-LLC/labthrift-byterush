# ByteRush design documents

Separate documents cover business intent, product behavior, requirements, and implementation. TDD means **technical design document** here. SDD means **software design description**; ADR is a numbered decision register.

- [BRD — Business Requirements Document](BRD.md)
- [PRD — Product Requirements Document](PRD.md)
- [FRD — Functional Requirements Document](FRD.md)
- [SRS — Software Requirements Specification](SRS.md)
- [TDD — Technical Design Document](TDD.md)
- [SDD — Software Design Description](SDD.md)
- [HLD — High-Level Design](HLD.md)
- [LLD — Low-Level Design](LLD.md)
- [ADR — Architecture Decision Records](ADR.md)

Read BRD → PRD → FRD/SRS for scope; HLD → SDD → TDD/LLD for implementation. ADR records why the boundaries were chosen. Changes to requirements must update their IDs, affected designs, tests, and release evidence together.

ByteRush absorbs the Runs walkthrough content. Labthrift Plan and the main website remain independent. See [release status](release-status.md).

[Universal completion roadmap](../ROADMAP.md) sequences work across all three products, with dependencies, acceptance criteria, and coverage of all 100 numbered requirements.
