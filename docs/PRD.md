# LocoUni: Product Requirements Document (MVP)

## 1. Problem
New students struggle to learn who the faculty are, where offices and facilities are, and what is happening on campus. Information is scattered across notice boards, WhatsApp groups, and word of mouth.

## 2. Goal
One place where each university publishes its campus information, and new students can find it quickly, including by asking an AI assistant in plain language.

## 3. Users
| Role | Description | Can do |
|---|---|---|
| **Admin** | Principal or administrator of a university | Create university, manage locations, faculty, notices |
| **Student** | New or existing student | Join a university, browse info, use AI assistant |
| **Visitor** | Not logged in | See landing page, search universities |

## 4. Scope

### In scope (MVP)
- Landing page with "Add University" and "Join University"
- Admin: university registration, map locations, faculty/staff directory, notices
- Student: home, AI assistant, faculty directory, campus map, notice board
- Email + password authentication
- Responsive web design

### Out of scope (after MVP)
Mobile app, push notifications, vector/semantic search, multi-language, Google login, indoor floor maps, admin approval dashboard, analytics, student-to-student features.

## 5. User flows

**Admin flow**
1. Landing → "Add University"
2. Sign up and fill in university details (name, city, country, website, description, logo)
3. University is created with status `pending` (manually approved for MVP)
4. Admin dashboard: manage Locations, Faculty, Notices

**Student flow**
1. Landing → "Join University"
2. Sign up or log in, then search and select university
3. Land on university home with navigation: Home, Assistant, Faculty, Map, Notices

## 6. Functional requirements

### Landing page
- FR-1: Two primary buttons, "Add University" and "Join University".
- FR-2: Link to log in for returning users.

### Add University (Admin)
- FR-3: Form fields: university name (required), city, country, website, description, logo, campus center location, admin name, email, password.
- FR-4: On submit, create auth user, university (`pending`), and admin profile.
- FR-5: Pending universities are not searchable by students.

### Admin: Locations
- FR-6: Create, edit, delete locations with name, type (block, canteen, library, hostel, etc.), description, and a pin dropped on the map.
- FR-7: View all locations on a map.

### Admin: Faculty and staff
- FR-8: Create, edit, delete a person with name, role, department, cabin/room number, linked location (block), photo, email, phone.
- FR-9: Photo upload with size and type limits (max 2 MB, jpg/png/webp).

### Admin: Notices
- FR-10: Create, edit, delete notices with title, body, category, priority, optional event date.
- FR-11: Categories: academic, exams, placements, emergency, events, hostel.
- FR-12: Priorities: urgent, high, normal.

### Student: Join
- FR-13: Search bar to find approved universities by name or city.
- FR-14: Selecting a university saves it to the student's profile.

### Student: Home
- FR-15: Shows university name, logo, description, latest urgent notices, quick links.

### Student: AI assistant
- FR-16: Chat interface. Answers use only the student's university data.
- FR-17: Handles questions such as "Where is Dr. Sharma?", "Where is the canteen?", "Any exam notices?".
- FR-18: Answers include the room/block and a link to the map pin when relevant.
- FR-19: If data is missing, the assistant says it does not know rather than guessing.
- FR-20: Rate limit per user (e.g. 20 messages per hour).

### Student: Faculty directory
- FR-21: Search by name, department, or role. Filter by department.
- FR-22: Card shows photo, role, department, cabin, and a "view on map" link.

### Student: Campus map
- FR-23: Interactive map with all locations as pins, filter by type, search a location, popup with details.

### Student: Notice board
- FR-24: List notices, filter by category tabs and by priority (All, Urgent, High, Normal).
- FR-25: Urgent notices are visually highlighted. Sorted by priority then newest.

## 7. Non-functional requirements
- **Security:** Data isolated per university with Row-Level Security. AI always uses server-side `university_id`.
- **Performance:** Pages load under 3 seconds on a normal mobile connection.
- **Responsive:** Works from 360 px phones to desktop.
- **Cost control:** AI rate limiting, short responses, cheaper model where possible.
- **Accessibility:** Readable contrast, labeled form fields, keyboard navigable.

## 8. Success metrics
- At least 1 demo university fully populated
- A student can find any faculty member in under 30 seconds
- AI answers correctly on at least 90% of a 20-question test set

## 9. Risks
| Risk | Mitigation |
|---|---|
| Fake universities | `pending` status, manual approval |
| AI gives wrong info | Tool calling over real data, "answer only from tool results" |
| AI cost abuse | Login required, rate limit |
| Only 3 days | Strict MVP scope, no extras |
| Admins give bad map pins | Click-to-place pin picker with preview |

## 10. Open questions
- Should one admin account manage several universities? (MVP: no, one each)
- Should students be able to switch universities? (MVP: yes, via re-join)
- Domain name and branding for LocoUni
