# SIH-project

## Run locally

1. Create `server/.env` by copying `server/.env.example`.
2. Replace `DATABASE_URL` with the PostgreSQL/Supabase connection string for the project.
3. Run `server/db/schema_stage1.sql` and `server/db/schema_stage3.sql` in the database SQL editor.
4. Run one or more seed files from `server/db/` if demo records are needed.
5. Start the API:

	```powershell
	cd server
	npm run dev
	```

6. Start the client in a second terminal:

	```powershell
	cd client
	npm run dev
	```

The client uses `/api` through the Vite proxy and the API runs on port `5001`.

## Map records

The map requests records only after a location is selected, and only within 50 km of that location. For the demo seeds, search for `Guwahati`, `Silchar`, or `Haflong` after the database setup is complete.