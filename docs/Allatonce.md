
## `PRD.md`

# Custom CRM Product Requirements Document

## 1. Product Summary

The Custom CRM is a relationship and sales management platform for teams that need one reliable place to manage companies, contacts, opportunities, communication history, tasks, and sales pipeline activity.

The product should feel faster and more focused than a traditional enterprise CRM. Users should be able to find a record, understand its current state, take an action, and move to the next task without navigating through unnecessary screens.

## 2. Problem

Sales and account teams commonly manage customer information across spreadsheets, email, messaging applications, task tools, and disconnected CRM systems.

This creates several problems:

- Customer information is incomplete or duplicated.
- Sales activity is difficult to audit.
- Follow-ups are missed.
- Managers lack reliable pipeline visibility.
- Users avoid updating the CRM because it is slow or cumbersome.
- Teams cannot easily understand the full history of a customer relationship.

The CRM should reduce administrative work while improving visibility and accountability.

## 3. Target Users

### Sales Representative

Needs to:

- Manage assigned companies and contacts.
- Track leads and deals.
- Record calls, meetings, emails, and notes.
- See upcoming follow-ups.
- Move deals through the pipeline.
- Quickly search for customer history.

### Sales Manager

Needs to:

- View team pipeline.
- Inspect deal health and activity.
- Reassign ownership.
- Identify stalled opportunities.
- Review performance metrics.
- Maintain consistent pipeline stages.

### Operations Administrator

Needs to:

- Configure workspaces.
- Manage users and roles.
- Import and export data.
- Configure custom fields.
- Review audit history.
- Resolve data quality issues.

### Executive or Read-Only User

Needs to:

- View pipeline and activity summaries.
- Search customer records.
- Review account history.
- Avoid accidentally changing operational data.

## 4. Product Goals

1. Make customer and deal information accessible within seconds.
2. Make common CRM actions possible without leaving the current context.
3. Provide a trustworthy view of pipeline health.
4. Reduce duplicate and inconsistent customer records.
5. Enforce workspace-level data isolation.
6. Make the system usable with keyboard navigation and assistive technology.
7. Provide a foundation for future integrations without coupling the core product to one provider.

## 5. Non-Goals for V1

The following are not part of the initial release:

- Full marketing automation.
- Email campaign management.
- Native email inbox replacement.
- Built-in telephony.
- Support ticketing.
- Invoicing or payment processing.
- Complex approval workflows.
- AI-generated sales recommendations.
- Territory planning.
- Custom report builders.
- Native mobile applications.

## 6. Core Modules

### Dashboard

Provides an operational overview:

- Open deals by stage.
- Deals requiring attention.
- Upcoming tasks.
- Recent activity.
- Activity and pipeline summary.
- Recently viewed records.

### Companies

Users can:

- Create, view, edit, archive, and restore companies.
- Store company name, domain, industry, size, location, and owner.
- View associated contacts, deals, activities, and notes.
- Add tags and custom fields.
- See the latest interaction and next scheduled task.

### Contacts

Users can:

- Create, view, edit, archive, and restore contacts.
- Store name, job title, email, phone, location, and lifecycle status.
- Associate contacts with one or more companies.
- Assign an owner.
- View all related deals and activities.
- Add notes, tags, and custom fields.

### Leads

A lead is a potential relationship that has not yet become an active opportunity.

Users can:

- Create a lead manually.
- Convert a lead into a contact, company, and deal.
- Assign a lead to a user.
- Update lead status.
- Record qualification notes.
- Mark a lead as qualified, unqualified, or converted.

### Deals

Users can:

- Create and edit deals.
- Associate deals with companies and contacts.
- Assign a deal owner.
- Define value, currency, expected close date, and probability.
- Move deals between configurable pipeline stages.
- Record win and loss reasons.
- View deal activity and task history.
- Archive deals without deleting historical data.

### Activities

Supported activity types:

- Call.
- Meeting.
- Email.
- Note.
- Other.

Users can:

- Log an activity against a company, contact, lead, or deal.
- Set activity date and duration.
- Add a description.
- Mark an activity as completed.
- View activities in a chronological timeline.

### Tasks

Users can:

- Create a task.
- Assign a task to themselves or another permitted user.
- Associate the task with a record.
- Set due date and priority.
- Mark the task complete.
- Filter tasks by owner, date, status, and priority.

### Search

Global search should support:

- Companies.
- Contacts.
- Leads.
- Deals.
- Tasks.

Search results should display:

- Record type.
- Name or title.
- Owner.
- Related company.
- Status or stage.
- Last updated time.

Search must support keyboard activation through a command palette.

### Imports and Exports

Administrators can:

- Upload a CSV file.
- Map CSV columns to CRM fields.
- Preview imported data.
- Detect duplicate records.
- Confirm or cancel the import.
- Review import errors.
- Export records based on current filters.

### Workspace Settings

Administrators can configure:

- Workspace name and logo.
- Users and invitations.
- Roles.
- Pipeline stages.
- Custom fields.
- Tags.
- Default currency.
- Data import settings.

## 7. Primary Workflows

### Create and Qualify a Lead

1. User opens the lead creation form.
2. User enters lead name and available contact information.
3. User assigns an owner.
4. User sets lead status to `New`.
5. User optionally adds a note or follow-up task.
6. User qualifies the lead.
7. User converts the lead into a company, contact, and optional deal.
8. The original lead remains available as historical context.

### Manage an Opportunity

1. User creates a deal.
2. User associates the deal with a company and one or more contacts.
3. User selects a pipeline stage.
4. User enters deal value and expected close date.
5. User records activities.
6. User creates follow-up tasks.
7. User moves the deal through the pipeline.
8. User marks the deal as won, lost, or archived.

### Review a Company

1. User searches for a company.
2. User opens the company record.
3. User sees key details and owner.
4. User sees related contacts.
5. User sees active and historical deals.
6. User reviews the activity timeline.
7. User adds a note or schedules a task.

### Import Existing CRM Data

1. Administrator uploads a CSV file.
2. System validates the file format and size.
3. Administrator maps source columns to CRM fields.
4. System displays a preview.
5. System identifies likely duplicates.
6. Administrator chooses a duplicate strategy.
7. System processes the import asynchronously.
8. Administrator receives an import summary with successes and failures.

## 8. Functional Requirements

### Authentication

- Users must authenticate before accessing workspace data.
- Sessions must expire according to the selected identity provider policy.
- Users may belong to multiple workspaces.
- A user must explicitly select or switch the active workspace.
- Invited users must accept an invitation before gaining access.

### Authorization

- Every business record must belong to exactly one workspace.
- Users may only access records in their active workspace.
- Permissions must be enforced server-side.
- The frontend must not be treated as an authorization boundary.
- Record ownership and role permissions must be evaluated consistently across UI and API operations.

### Records

- Records must have stable identifiers.
- Records must retain creation and update timestamps.
- Records must record the creating and last-updating user where appropriate.
- Archiving must be preferred over destructive deletion.
- User-facing lists must support loading, empty, error, and permission-denied states.

### Pipeline

- Each workspace must have at least one pipeline.
- A pipeline must have at least one active stage.
- Stages must have an explicit order.
- Closed stages must distinguish between won and lost.
- Moving a deal to a closed stage must record the close timestamp.

### Activities and Tasks

- Activities must be append-only from the user perspective.
- Editing an activity must preserve audit history.
- Tasks must have a status of `Open`, `Completed`, or `Canceled`.
- Overdue tasks must be visually distinct without relying on color alone.
- Completing a task must record completion time and user.

### Data Quality

- Email fields must be validated.
- Required fields must be explicit.
- Duplicate detection must be deterministic where possible.
- Imports must never silently discard invalid rows.
- Import errors must identify the row and field involved.

## 9. Acceptance Criteria

### Workspace Isolation

- A user from workspace A cannot retrieve, update, or delete records belonging to workspace B.
- Directly modifying an identifier in a request must not bypass workspace checks.
- Automated tests cover all major record types.

### Contact Management

- A user can create a contact with required fields.
- A user can associate the contact with a company.
- A user can view the contact timeline.
- A user can archive and restore the contact if permitted.
- A read-only user cannot modify the contact.

### Deal Management

- A user can create a deal from a company record.
- A deal appears in the correct pipeline stage.
- Drag-and-drop stage movement has an accessible non-drag alternative.
- Won and lost states record close metadata.
- Deal updates appear in the activity history or audit history as appropriate.

### Tasks

- A user can create a task from a record page.
- The task appears in the assigned user's task list.
- Completing a task removes it from the open-task view.
- Overdue tasks are included in the overdue filter.
- Unauthorized users cannot modify tasks outside their permitted scope.

### Search

- Search results return only records available to the current user.
- Search supports partial text matching.
- Search handles no results gracefully.
- Search is usable with keyboard navigation.
- Search response time remains acceptable with at least 100,000 records in a workspace.

## 10. Success Metrics

Initial product metrics:

- Percentage of active users completing at least one meaningful CRM action per session.
- Median time to locate a known company or contact.
- Percentage of open deals with an upcoming task.
- Percentage of active deals updated within the configured activity window.
- Duplicate record rate after imports.
- Task completion rate.
- Weekly active users by workspace.
- API and page error rate.

Technical targets:

- Core authenticated pages render usable content within 2.5 seconds on a normal broadband connection.
- Standard list queries complete within 500 ms at the 95th percentile under expected load.
- No critical or high-severity accessibility defects at release.
- No known tenant-isolation defects at release.

## 11. Open Decisions

These decisions should be confirmed before implementation begins:

- Identity provider.
- Billing model.
- Whether contacts may belong to multiple companies.
- Whether users can see all workspace records or only assigned records.
- Required third-party integrations.
- Data retention policy.
- Custom field types required in v1.
- Whether multiple pipelines are required initially.
- Whether email activity will be manual or provider-integrated.

## 12. Definition of Done

A feature is complete when:

- Requirements and edge cases are documented.
- Server-side authorization is implemented.
- Loading, empty, error, and permission states exist.
- Responsive behavior is verified.
- Keyboard and screen reader behavior is verified.
- Unit and integration tests exist for business logic.
- End-to-end coverage exists for the primary workflow.
- Audit behavior is defined.
- Analytics events are documented where applicable.
- Documentation is updated.
- No unresolved high-severity defects remain.

## `architecture.md`

# Custom CRM Architecture

## 1. Architectural Direction

Use a modular monolith for v1.

A modular monolith keeps deployment and local development simple while enforcing clear domain boundaries. Each domain owns its validation, authorization checks, database access patterns, and user-facing workflows.

The system should not begin as a collection of microservices. The CRM has tightly related transactions across companies, contacts, deals, tasks, activities, and audit events. Splitting these systems too early would add operational complexity without improving the product.

## 2. Recommended Stack

The baseline implementation assumes:

- TypeScript.
- React with a server-rendered web framework such as Next.js.
- PostgreSQL.
- Drizzle ORM or Prisma.
- Zod or equivalent runtime validation.
- An external identity provider using OIDC or OAuth.
- Object storage for import files and future attachments.
- Redis-compatible storage only if required for rate limiting, queues, or caching.
- Background worker for imports, exports, notifications, and other long-running jobs.
- REST API for external interoperability.
- OpenAPI generation from validated route schemas where practical.

The stack is an implementation recommendation, not a product requirement.

## 3. Logical Layers

### Presentation Layer

Responsible for:

- Routes.
- Server-rendered pages.
- Client-side interactive components.
- Forms.
- Loading and error states.
- URL-based filters and pagination.
- Accessibility behavior.

The presentation layer must not contain business authorization logic that is not also enforced on the server.

### Application Layer

Responsible for:

- Use cases.
- Transaction boundaries.
- Permission checks.
- Input validation.
- Record lifecycle rules.
- Audit event creation.
- Domain-specific error mapping.

Examples:

- `CreateContact`
- `ConvertLead`
- `MoveDealStage`
- `CompleteTask`
- `ImportCompanies`

### Domain Layer

Responsible for:

- Core entities.
- Status transitions.
- Invariants.
- Value normalization.
- Domain events where needed.

### Infrastructure Layer

Responsible for:

- Database access.
- Identity provider integration.
- File storage.
- Background jobs.
- Email delivery.
- Search implementation.
- Observability.

## 4. Suggested Repository Layout

```text
src/
  app/
    (public)/
    (authenticated)/
      overview/
      companies/
      contacts/
      leads/
      deals/
      tasks/
      search/
      settings/
    api/
      v1/
  components/
    ui/
    layout/
    records/
    forms/
    tables/
  modules/
    auth/
    workspaces/
    companies/
    contacts/
    leads/
    deals/
    activities/
    tasks/
    search/
    imports/
    audit/
  server/
    db/
    permissions/
    validation/
    jobs/
    integrations/
  lib/
    dates/
    formatting/
    telemetry/
    errors/
  styles/
    tokens.css
    globals.css
  tests/
    fixtures/
    helpers/
```

## 5. Domain Boundaries

Each module should expose a small public surface:

- Input schemas.
- Use-case functions.
- Query functions.
- Permission definitions.
- Event or audit helpers.
- UI-specific view models where necessary.

Database tables must not be queried directly from arbitrary UI components.

A component should call a server action, route handler, or application service. The service performs validation, authorization, transaction handling, and persistence.

## 6. Request Flow

A typical mutation should follow this sequence:

1. Authenticate the request.
2. Resolve the active workspace.
3. Validate input using a runtime schema.
4. Resolve the target record.
5. Confirm the record belongs to the active workspace.
6. Evaluate the user's permission.
7. Execute the application use case.
8. Write the domain mutation and audit event in one transaction where possible.
9. Return a stable response shape.
10. Revalidate or refresh affected views.

## 7. Multi-Tenancy

Every business table must include `workspace_id` unless the table is globally scoped.

The workspace identifier must be derived from the authenticated session and active workspace context. It must not be trusted solely from a client-submitted body.

All list, get, update, archive, and delete queries must include workspace scoping.

Recommended defense-in-depth measures:

- Repository methods require `workspaceId`.
- Database queries use workspace predicates by default.
- Integration tests attempt cross-workspace access.
- PostgreSQL row-level security may be added if supported by the deployment model.
- Audit events include workspace context.
- Background jobs carry workspace context explicitly.

## 8. Server and Client Components

Prefer server-rendered components for:

- Lists.
- Record detail pages.
- Dashboard summaries.
- Static configuration.
- Initial data loading.

Use client components only for:

- Drag-and-drop interactions.
- Inline editing.
- Command palette behavior.
- Dialogs and popovers.
- Rich filters.
- Optimistic updates.
- Keyboard-driven interactions.

Client components must not receive secrets or unnecessary full record payloads.

## 9. Data Fetching

- Use URL parameters for filters, sorting, pagination, and view state.
- Use cursor pagination for large datasets.
- Avoid loading every record into the browser.
- Return only fields required by the current view.
- Use explicit query objects rather than arbitrary SQL fragments from user input.
- Debounce global search input.
- Cancel stale search requests where supported.

## 10. Background Jobs

Use background jobs for:

- CSV imports.
- CSV exports.
- Bulk updates.
- Notification delivery.
- Search indexing.
- Periodic cleanup.
- Future third-party synchronization.

Each job must be:

- Idempotent where possible.
- Retryable.
- Observable.
- Associated with a workspace.
- Safe to resume after partial failure.

## 11. Observability

Log:

- Request identifier.
- Workspace identifier.
- User identifier.
- Route or operation name.
- Duration.
- Result status.
- Error classification.

Do not log:

- Access tokens.
- Passwords.
- Full authentication cookies.
- Unredacted sensitive customer data.
- Full uploaded file contents.

Capture metrics for:

- API latency.
- Database latency.
- Error counts.
- Import success and failure rates.
- Background job retries.
- Search latency.

## 12. Performance Requirements

- Use indexes for workspace-scoped list queries.
- Avoid unbounded joins on list pages.
- Use aggregate queries for dashboard cards.
- Lazy-load noncritical panels.
- Virtualize very large tables if necessary.
- Keep initial JavaScript small for detail pages.
- Prefer server-side filtering and sorting.

## 13. Deployment Environments

The application should support:

- Local development.
- Preview or staging.
- Production.

Environment-specific configuration must be injected through environment variables or a secret manager.

Production migrations must be reviewed and run in a controlled deployment step. Destructive migrations require an explicit migration plan.

## `AGENTS.md`

# AI Agent Implementation Rules

## 1. General Rules

- Read the relevant product and architecture documentation before changing code.
- Do not invent new product behavior when an existing requirement is ambiguous.
- Prefer the smallest change that fully satisfies the requirement.
- Preserve unrelated user changes in the working tree.
- Do not reset, revert, or overwrite changes that were not created by the current task.
- Do not modify generated files manually.
- Do not add dependencies unless the dependency provides clear value and its maintenance cost is understood.
- Keep implementation, tests, and documentation changes together.

## 2. Repository Conventions

- Use TypeScript strict mode.
- Prefer named exports.
- Use explicit return types for public application services.
- Keep domain logic outside presentation components.
- Keep reusable visual primitives in `components/ui`.
- Keep CRM-specific components in the relevant domain module.
- Use the existing formatter and linter configuration.
- Use the existing test framework rather than adding a competing framework.
- Use semantic HTML before adding ARIA attributes.
- Prefer composition over deeply configurable components.

## 3. Data and API Rules

- All business queries must be workspace-scoped.
- Never trust `workspace_id` from the client.
- Validate all external input at the API or server-action boundary.
- Use typed error codes instead of matching error strings.
- Use transactions for multi-record mutations.
- Create audit events for meaningful record changes.
- Prefer archive behavior to hard deletion.
- Do not expose internal database columns unnecessarily.
- Do not return secrets, access tokens, or private integration credentials.
- Use cursor pagination for large lists.

## 4. Authorization Rules

Authorization must be checked on the server for every mutation and protected read.

A UI control being hidden is not sufficient authorization.

Permission checks must cover:

- Workspace membership.
- Role.
- Record ownership where applicable.
- Resource state.
- Operation type.
- Workspace configuration.

Tests must include both permitted and denied cases.

## 5. UI Rules

Every data-driven view must implement:

- Loading state.
- Empty state.
- Error state.
- Permission-denied state where applicable.
- Mobile layout.
- Keyboard interaction.
- Visible focus state.

Do not use color as the only indication of state.

Avoid:

- Full-screen loading spinners for small updates.
- Unlabeled icon-only buttons.
- Horizontal overflow on mobile unless the content is a deliberately scrollable table.
- Forms with unclear required fields.
- Destructive actions without confirmation.
- Optimistic updates when failure would create dangerous ambiguity.

## 6. Forms

Forms must:

- Use labels associated with controls.
- Show field-level errors.
- Preserve valid entered values after validation failures.
- Disable duplicate submission.
- Announce submission errors to assistive technologies.
- Distinguish required and optional fields.
- Normalize values consistently.
- Confirm before destructive actions.

## 7. Testing Rules

Every new use case requires:

- Validation tests.
- Authorization tests.
- Successful-path tests.
- Failure-path tests.
- Persistence or integration coverage where data behavior is important.

Every new user-facing workflow requires:

- One end-to-end happy path.
- One permission or validation failure path.
- Responsive verification.
- Keyboard verification for interactive controls.

## 8. Migration Rules

- Every schema change must have a migration.
- Migrations must be reversible where practical.
- Large backfills must be performed in batches.
- Do not rename or drop production columns without a rollout plan.
- Add indexes concurrently where the database supports it.
- Document data migration assumptions.

## 9. Review Checklist

Before considering a change complete, verify:

- The requirement is implemented.
- Workspace isolation is preserved.
- Authorization is enforced server-side.
- Tests pass.
- Type checking passes.
- Linting and formatting pass.
- Empty and error states exist.
- Accessibility behavior is acceptable.
- Documentation is updated.
- No unrelated files were changed.

## `DESIGN_SYSTEM.md`

# Custom CRM Design System

## 1. Visual Direction

The CRM should feel like a high-quality operations tool rather than a generic SaaS dashboard.

Design language:

- Warm paper surfaces.
- Graphite navigation and typography.
- Burnt orange for primary action and emphasis.
- Muted teal for positive progression.
- Thin rules and compact data density.
- Editorial typography for section titles and major metrics.
- Strong alignment and intentional whitespace.
- Subtle texture or grid detail in page backgrounds.
- Contextual drawers and split panes instead of excessive page transitions.

Avoid:

- Purple-on-white dashboards.
- Excessive card grids.
- Rounded containers around every element.
- Generic gradient hero sections.
- Decorative motion that slows operational work.
- Color-only status indicators.

