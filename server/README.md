## API Server for [Backend](Github_URL)


This project is my own take on building Twitter clone and I have tried to keep things simple and concise. With minimal modules needed, it is very lightweight and fast, yet very functional and feature-rich. Three parts of project viz, Front-end, Database and API server are separately hosted. This repo contains the source code for the server API providing REST API for interacting with database and authentication.
## Things used

- `Express` for server.

- `MongoDB` for database and a full text search!

- `Mongoose` as *Mongo* driver and for model and schema validation.

- `Passport` with Local strategy for authentication.

- `Bcryptjs` for password hashing.

- `Cookies/express-session/connect-mongo` for session management and storage

## File structure.

- `app.js` - main express app file.
- `passport.js` auth strategy and serialization.
- `models/`
  - contains `Mongoose` schema's and models for database collections.
- `routes/`
  - `auth.js` - contains authentication related routes, like `/auth/login`, `/auth/logout`, etc.
  - `api.js` - contains all other app routes.
- `controllers/`
  - contains functions to interact with database and return data to routes.
- `serializers/`
  - contains functions to serialize data returned from database to be sent to client.
- `utils/`
  - contains some utility functions.


```bash
#Backend server running on this Port
PORT=8000
#Database URL
MONGO_URL=mongodb+srv://deepakgauttam88:Taj124deep@cluster0.2sfwryh.mongodb.net/twitter_demo
#JWT_SESSION_SECRET
SESSION_SECRET=BAwi0cI4J2PtPUGjsM-cyOMAYnWiKHsBHXrYHi0YRBW284hfCV5_NQpaypjQFaNOT5NQbtjje6BnYHTO-is5pG4
# Push notifications keys. generated from this website https://vapidkeys.com/
PUBLIC_VAPID_KEY=BAwi0cI4J2PtPUGjsM-cyOMAYnWiKHsBHXrYHi0YRBW284hfCV5_NQpaypjQFaNOT5NQbtjje6BnYHTO-is5pG4
PRIVATE_VAPID_KEY=1cFtoRYKFp9Vn8yHAPUYQol7se7Znbe9CszqYT70OLk
# This must be either a URL or a 'mailto:' address.
WEB_PUSH_CONTACT="mailto: deepakgauttam88@gmail.com"
```

- `npm install` to install dependencies.
- `npm run dev` it will start both Frontend and backend 
