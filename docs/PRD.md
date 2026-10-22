# LocoUni: Product and Implementation Overview

## 1. Product
LocoUni is a web campus guide. University administrators can publish campus locations, faculty and staff details, and notices. Students can join an approved university and browse that information or ask a campus assistant.

This document describes the current repository implementation as well as clearly marked product goals. It is not a claim that the application has been deployed or that the targets below have been measured.

## 2. Users and permissions
| Role | Current experience |
|---|---|
| **Admin** | Registers a university, then manages its settings, locations, faculty, and notices. |
| **Student** | Searches approved universities, joins one, and views its home, assistant, faculty directory, map, and notices. Joining another approved university changes the student's profile to that university. |
| **Visitor** | Views public marketing and information pages and can search approved universities or start university registration. |

Admin actions and pages check the authenticated profile on the server. A student's university is read from their server-side profile for the assistant; it is not accepted from the chat request.

## 3. Implemented scope
- Public landing, About, How it works, FAQ, Contact, Privacy, and Terms pages.
- Email/password login and logout.
- University registration with an admin account, optional logo, and optional campus coordinates. New universities start as `pending`.
- University search by name or city; search and join flows only offer `approved` universities.
- Admin settings for university details and logo.
- Admin create, edit, and delete flows for locations, faculty, and notices.
- Student campus home with university details, high/urgent notices, and quick links.
- Faculty directory with search/filtering, campus map with location filters and focus links, and notice board with category/priority filters.
- Campus assistant backed by the Google Gemini API.
- Responsive layouts and light/dark theme support.

## 4. Current behavior and limits

### University approval
There is no in-app approval dashboard. A newly registered university is pending and must be approved by an operator in the Supabase database before it appears in search or can be joined.

### Campus assistant
The server builds campus context from the student's university's locations, faculty, and up to 15 recent notices, then sends the context and conversation to Gemini. It does not use Gemini function/tool calling. The system instruction asks the model to answer only from this context and not invent missing details. Location links can focus the map on a location.

The route accepts up to 10 messages (up to 500 characters each) and limits uncached requests to 10 per user per hour by default. `CHAT_HOURLY_LIMIT` can change that default. Usage timestamps are stored in Supabase; single-message replies are cached in process memory for 10 minutes, and a cache hit does not consume an hourly usage entry. The cache is per application process. The hourly limit uses a shared database count, though concurrent requests can race because the count and insert are separate operations.

### Data visibility
The SQL policies in [DATABASE.md](./DATABASE.md) allow unauthenticated reads of campus content tables. Application pages filter by university and student pages verify that the signed-in student's profile matches the route, but these policies do not make campus content confidential or provide tenant-isolated reads at the database layer. Do not store private information in these campus records under the current policy model.

### Uploads
University logos, location photos, and faculty photos are optional JPG, PNG, or WebP images, limited to 2 MB in the relevant admin flows. Uploads use the server-only Supabase service-role client; public image URLs are used for display.

## 5. Product goals not yet verified
- Pages should work well from small phones through desktop sizes and remain keyboard-accessible.
- Students should be able to find campus information quickly.
- Assistant answers should be grounded in the university's published data.

No performance or answer-accuracy benchmark is included in this repository, so these goals have not been certified.

## 6. Not implemented / possible future work
- In-app university approval and administrative analytics.
- Private, tenant-isolated campus content or role-specific sharing rules.
- Persistent/distributed assistant rate limiting and caching.
- Native mobile app, push notifications, indoor maps, multilingual UI, semantic search, and student-to-student features.
- OAuth/social login.

These are potential follow-ups, not current application capabilities.
