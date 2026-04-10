# README

Bugs found. Fix later

1. Frontend datetime doesn't match the time and minutes when created. Issue with formatting & timezone
2. Create stock. Validation doesn't work when location hasn't been selected. Actually works, but need to press "add location" first to see the input error
3. Remove add permissions button
4. Table data fix ordering should display the most recent first (based on updated at). Or don't create asc and desc filters
5. Replace tanstack hooks usage (useMutation and useQuery) with plain JavaScript fetch & useState
6. In request, the data at the top should match status order: pending, approved. Same as number 4
7. Hide tanstack developer tools

