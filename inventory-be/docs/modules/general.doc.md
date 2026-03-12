# General Software Q&A (Presentation Guide)

This document contains 10 general questions that explain how the entire software system works. The answers are written using simple analogies specifically to help a beginner or student present the project to a lecturer or audience without using overly complicated programming jargon.

---

### Q1: What is the main purpose of this project, and what problem does it solve?
**Answer:**
Imagine a huge library where books are just thrown in piles, and the librarian uses a messy notebook to write down who borrowed what. If a book goes missing, it takes hours to figure out what happened. 
Our software replaces that notebook. It is a digital, centralized inventory system designed for the Automation Department. It solves the problem of human error in manual Excel sheets. We can instantly see exactly what stock is on what shelf, who requested it, and immediately know when we are running out of spare parts.
Use case: Centralizing the inventory of the Automation Department to track expensive Siemens sensors and avoid manual counting errors.

### Q2: How do the frontend (the website) and the backend (our code) talk to each other? What is an API?
**Answer:**
Think of the frontend as a customer at a restaurant looking at a menu, and the backend database is the kitchen filled with ingredients.
The API is the waiter. The customer can't just go into the kitchen and grab food. They tell the waiter their order (an HTTP Request), the waiter takes it to the kitchen, the kitchen cooks it, and the waiter brings the meal back out on a plate (an HTTP Response). Our API safely carries data between the user's screen and our database without ever letting the user directly touch the database.
Use case: The Dashboard module fetching real-time statistics from the database to display the total number of pending requests on the screen.

### Q3: Why did we choose a Relational Database (PostgreSQL) instead of something like MongoDB?
**Answer:**
A relational database is like a perfectly organized Excel workbook where sheets are linked together securely. For example, the `Stock` sheet strictly links to the `Location` sheet. You cannot physically put a stock item on a shelf that does not exist in the system. 
MongoDB is more like throwing loose paper documents into a folder. It's flexible, but for tracking expensive warehouse inventory, we needed strict, unbreakable rules (called Foreign Keys) so data never gets lost or messy.
Use case: We use "Foreign Keys" to ensure a Part Request can only be created if it is linked to a valid User who actually exists in our system.

### Q4: We are using a modern stack: Bun, Hono, and Drizzle. How do they work together?
**Answer:**
- **Bun** is the engine. It's like replacing an old car engine (Node.js) with a brand new, super-fast sports car engine. It runs our code instantly.
- **Hono** is our traffic cop. It figures out where API requests should go. If you ask for `/users`, Hono points you to the User department.
- **Drizzle** is our translator. The database speaks SQL, but we speak TypeScript. Drizzle sits in the middle and auto-translates our TypeScript code into safe database instructions, meaning we make fewer mistakes.
Use case: Using Hono to route requests to the `/stocks` department, and Drizzle to ensure our code "matches" our database table structure perfectly.

### Q5: How do we keep the system secure from hackers or unauthorized access?
**Answer:**
We use a "Bouncer and VIP list" approach. 
When a user logs in, the Bouncer hands them a secret wristband (a JWT Token). On all future requests, the user must show the wristband. 
However, just having a wristband isn't enough to go everywhere. We also have Role-Based Access Control (RBAC). This is the VIP list. A normal employee's wristband might only let them request parts, but an Admin's wristband lets them open the manager's office to add new stock. 
Use case: Checking that a user has the `stocks:write` permission before allowing them to use the Bulk Import feature to add 100 items at once.

### Q6: If the warehouse grows and we add 1,000,000 items, will the system crash or slow down?
**Answer:**
No, because we built the system using something called "Pagination." 
Imagine a lecturer asking a student to carry a textbook with 10,000 pages all at once—they would collapse. Instead, our software only gives the user 10 or 20 items (one page) at a time. The database only searches for exactly what fits on the active screen. Even if we have a million items, the server never breaks a sweat.
Use case: The `GET /stocks` API only pulls 10 items at a time from the database, even if we have 50,000 items in the warehouse.

### Q7: What happens when an employee "Requests" a part from the warehouse? What is the code process?
**Answer:**
It's an automated assembly line. 
First, the employee clicks "Request", making a ticket in the database labeled "PENDING". 
Next, an Admin sees the ticket and clicks "Approve", attaching a Purchase Order number.
The moment they click approve, the code hits two other departments automatically: It writes an un-erasable receipt in the `Audit` log, and it rings the doorbell in the `Notification` module, sending a pop-up alert straight to the employee saying "Your part is on the way!"
Use case: When an employee clicks "Request," the system creates a record, notifies the admin, and writes a log entry—all in one sequence.

### Q8: How does the "Low Stock Warning" feature actually work behind the scenes?
**Answer:**
It works exactly like a smart smoke detector. 
We set a "Minimum Threshold" number for every item (e.g., 5). 
Whenever an admin updates the quantity of an item, the code intercepts the action and does a quick math check. If the new stock quantity drips below 5, the smoke detector goes off right then and there. It triggers our `Notification` system to instantly blast a warning message to all Admin dashboards so they can order more.
Use case: Setting a "Minimum" of 10 for Electrical Cables; if an admin removes 5 and the total drops to 8, the system immediately flags it as "Low Stock."

### Q9: Why is there an "Audit Module"? Why don't we just trust the admins?
**Answer:**
Because even good people make mistakes, and in the real world, accountability is mandatory.
If an admin accidentally changes the stock from 50 to 0, they might forget they did it. If we didn't have the Audit log, it would just look like 50 expensive parts vanished into thin air. The Audit log is an automatic, permanent security camera. It records exactly who made the change, what time they did it, and what the old number used to be, so everything can be fixed easily.
Use case: Every time a stock quantity is changed, the system saves the "Old Quantity" and "New Quantity" in the `audit_logs` table for review.

### Q10: Why did we divide the code into 9 separate "Modules"? And can one item be in two places at once?
**Answer:**
Building in "Modules" is like building with Lego bricks. It keeps the project clean and safe. 
Regarding locations: Yes! We recently updated the "Stock" Lego brick. Before, the system was strict—one part model could only be in one box. But in a real warehouse, you might have 50 sensors in Aisle A and another 20 in Aisle B. Our system now allows this. We added a new "Distribution" API that can find every single shelf where a part is sitting and tell you the total count in each spot.
Use case: If we have Siemens PLCs in Shelf A and more PLCs in Shelf B, we use the `GET /stocks/:id/locations` API to see the total spread.

### Q11: What is a "UUID" and why do we use it for IDs instead of simple numbers like 1, 2, 3?
**Answer:**
A UUID is a long, random string of letters and numbers (like `a1b2c...`). 
If we just used numbers (ID: 1, ID: 2), and a hacker wanted to steal user data, they could write a script that just counts up (`/users/1`, `/users/2`, `/users/3`) and scrape everything. A UUID is like a unique, unguessable fingerprint. You can't just "guess" the next ID, which adds a huge layer of security to our API.
Use case: The ID for a specific stock item is a random string like `550e8400-e29b...` so a hacker can't guess the ID for the next item.

### Q12: Why do we have separate `CreatedAt` and `UpdatedAt` timestamps on every single table?
**Answer:**
Think of a birth certificate versus a driver's license photo. 
`CreatedAt` is the birth certificate. It never changes. It tells us the exact second a piece of stock or a user was added to the system for the first time.
`UpdatedAt` is the driver's license photo. Every time you move, or in our case, every time an admin changes the quantity of a stock, that timestamp updates to the current time. It helps us see exactly when a file was last touched.
Use case: Checking `CreatedAt` to see when a specific batch of sensors arrived, and `UpdatedAt` to see the last time an admin counted them.

### Q13: What does the "Seed" script do?
**Answer:**
The seed script is like buying a model house already fully furnished.
When a new developer joins the team, or a lecturer wants to test our app, starting with a completely blank database is annoying because there's nothing to click on. The seed script runs automatically and injects 20 fake locations, 15 fake stocks, and some admin users so the app immediately looks populated and ready to test.
Use case: Our `bun db:seed` command automatically populates the app with 20 fake stocks and 5 fake locations so you can demo it immediately.

### Q14: We use something called "Zod." What is that and why is it important?
**Answer:**
Zod is our strict bouncer at the front door doing a pat-down.
When a user tries to create an account, they send us a JSON "payload". Hackers might try to send us malicious code, or a user might accidentally type their phone number instead of their username. Zod strictly checks the shape of the data. If it says "I need an username and a 6-character password," and the user sends an empty password, Zod kicks them out before their bad data ever touches our database.
Use case: If a user tries to submit a Request with a quantity of "ABC" instead of a number, Zod catches the error and blocks the request.

### Q15: How does the system handle deleting things? Like if we delete an employee?
**Answer:**
We use a database technique called "Cascade Deletion," which works like knocking down dominoes.
If an employee named John has made 5 pending part requests, and we delete John's user account, the database automatically drops the dominoes and deletes all 5 of his pending requests instantly. This prevents the database from getting clogged with "ghost requests" that belong to a user who no longer exists.
Use case: If an employee leaves the company and their user account is deleted, all their pending stock requests are automatically cleaned up.

### Q16: Why did we build an API instead of just an app that connects to the database directly?
**Answer:**
Security and flexibility. 
If the mobile app connected directly to the database, we would have to put the database passwords inside the mobile app code. Someone could reverse-engineer the app and steal the passwords. 
By putting an API in the middle, the API safely holds the passwords on our private server. The app only talks to the API, and the API talks to the database. Plus, if we want to build an iOS app AND an Android app later, they can both use the exact same API.
Use case: The mobile QR scanner app talks to the API server, which holds the database credentials safely behind a firewall.

### Q17: What does the term "Stateless" mean when talking about our JWT Tokens?
**Answer:**
"Stateful" is returning to a hotel where the clerk remembers your face and name every time you walk by. The clerk has to use a lot of brainpower (server memory) to remember 500 guests. 
"Stateless" (our JWT approach) is the hotel giving you a keycard. The clerk doesn't have to remember you at all. The backend has no memory of who is logged in. Every time you ask for a page, you swipe your keycard. The door reads the cryptographic signature on the card, confirms it's valid, and opens. This means our server uses almost zero memory to keep track of logins.
Use case: When you move to the "Request History" page, the app just sends your "wristband" (JWT) so the server knows it's really you without asking for a password again.

### Q18: What is "Middleware" in the Hono API?
**Answer:**
Middleware is like a toll booth on a highway. 
Before a car (an HTTP Request) can drive into the actual city (the API Controller that fetches data), it has to pass through the toll booth. 
We have an `AuthMiddleware` toll booth. Every request has to stop there. The middleware checks if the user has a valid JWT token. If they do, the barrier opens. If they don't, the middleware blocks the car and returns a "401 Unauthorized" error, protecting the city.
Use case: Shielding the `/dashboard/summary` route so it completely ignores any request that doesn't have a valid login wristband.

### Q19: Why do we hash passwords? Why not just encrypt them so we can decrypt them later?
**Answer:**
Encryption is like putting a document inside a locked briefcase; if you have the key, you can open the briefcase and read the document. 
Hashing is like dropping the document into an industrial blender. It creates a chaotic string of letters and numbers that can *never* be turned back into the original document, even if we wanted to. When a user logs in, we just put their typed password into the exact same blender and see if the chaotic string matches the one we saved. This way, if a hacker steals the blender output, they still don't know the password.
Use case: We never see your actual password in our database; we only store a "blended" version like `$argon2id$v=11$m=65536...`.

### Q20: What is an "ORM" (like Drizzle) and why don't we just write raw SQL queries?
**Answer:**
Writing raw SQL is like trying to build a house by telling the builders exactly where to put every single nail. It's powerful, but it's very easy to make a typo (like forgetting a comma) and crash the database.
An ORM (Object-Relational Mapper) is like handing the builders a blueprint. We just write standard, easy-to-read TypeScript code like `db.insert(user).values(newUser)`, and Drizzle perfectly translates that into flawless SQL in the background. It saves time and prevents embarrassing syntax crashes during a presentation!
Use case: Writing `db.select().from(stockTable)` in our code instead of risky raw text commands like `SELECT * FROM stocks`.

### Q21: During the presentation, if the lecturer asks "Does the User API return passwords?", what should I say?
**Answer:**
You should say: "Absolutely not. Security is our priority." 
Even though our database stores hashed passwords, our backend code is specifically programmed to "filter" them out. Every time we ask the database for user information (like a list of employees), our code explicitly tells the database: "Give me the Name and Username, but leave the Password behind." This way, even if someone intercepts our API data, there is zero risk of password leakage.
Use case: Our `UserService` explicitly picks only the `name` and `username` columns, so the `password` column is physically impossible to see in the API output.
