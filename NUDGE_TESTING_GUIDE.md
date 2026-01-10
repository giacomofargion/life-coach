# Nudge Feature - Testing Guide

## Implementation Status ✅

### Phase 1: Core Feature (MVP) - ✅ COMPLETE

- ✅ Dialog component created (`components/ui/dialog.tsx`)
- ✅ Database migration created (`supabase/migrations/003_add_nudges_table.sql`)
- ✅ Type definitions added (`lib/types.ts` - Nudge interface)
- ✅ `NudgeModal` component created
- ✅ `NudgeButton` component created with badge
- ✅ Added to `NavHeader` (desktop) and `MobileMenu` (mobile)
- ✅ API routes created:
  - ✅ `POST /api/nudges` - Create new nudge
  - ✅ `GET /api/nudges` - Get user's active nudges with count
  - ✅ `PATCH /api/nudges/[id]` - Mark nudge as complete
- ✅ Email service setup (Resend)
- ✅ Environment variables configured

### Phase 2: Scheduling & Email - ✅ COMPLETE

- ✅ Vercel Cron configuration (`vercel.json`)
- ✅ `POST /api/cron/nudge-reminder` endpoint
- ✅ Email template (HTML) with personalized greeting
- ✅ `GET /api/nudges/[id]/complete` endpoint with signed URL validation

---

## Pre-Testing Checklist

Before testing, ensure you have:

1. **✅ Run database migration**:

   ```sql
   -- Execute this in your Neon SQL Editor:
   -- Copy contents from: supabase/migrations/003_add_nudges_table.sql
   ```

2. **✅ Installed packages**:

   ```bash
   npm install
   ```

3. **✅ Environment variables set in `.env.local`**:

   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=onboarding@resend.dev
   NUDGE_SECRET_KEY=your_64_char_hex_string
   CRON_SECRET=your_optional_cron_secret (optional)
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=your_existing_secret
   ```

4. **✅ Dev server running**:
   ```bash
   npm run dev
   ```

---

## Testing Checklist

### Test 1: Create a Nudge ✅

**Steps:**

1. Log into your app at `http://localhost:3000`
2. Look for "Need a Nudge?" button in the navbar (desktop) or mobile menu
3. Click the button - a modal should open
4. Enter a test nudge: "Call mom tomorrow"
5. Click "I'll remember that"
6. You should see a success message: "Nudge set!" with animation
7. Modal should close automatically after ~1.5 seconds

**Expected Results:**

- ✅ Modal opens smoothly with gentle animation
- ✅ Form validates (empty input disabled, max 150 chars)
- ✅ Success state shows with checkmark
- ✅ Modal closes after success
- ✅ Badge count updates (if you have existing nudges)

**Check Database:**

```sql
SELECT * FROM nudges WHERE user_id = 'your-user-id' ORDER BY created_at DESC;
```

Should show your new nudge with `is_completed = false`.

---

### Test 2: Active Count Badge ✅

**Steps:**

1. Create a nudge (see Test 1)
2. Check the "Need a Nudge?" button - it should show a badge with "1"
3. Create another nudge - badge should update to "2"
4. The badge should be visible on both desktop and mobile

**Expected Results:**

- ✅ Badge appears when you have active nudges
- ✅ Badge shows correct count (1, 2, 3, etc.)
- ✅ Badge shows "9+" if you have more than 9 nudges
- ✅ Badge disappears when all nudges are completed

---

### Test 3: Get Active Nudges ✅

**Steps:**

1. Create 2-3 nudges using the modal
2. Open browser DevTools → Network tab
3. Look for a request to `/api/nudges`
4. Check the response - should return your nudges

**Manual API Test:**

```bash
# Get auth token (or use browser session)
curl http://localhost:3000/api/nudges \
  -H "Cookie: next-auth.session-token=your-session-token"
```

**Expected Response:**

```json
{
  "nudges": [
    {
      "id": "...",
      "content": "Call mom tomorrow",
      "is_completed": false,
      "created_at": "...",
      ...
    }
  ],
  "activeCount": 2
}
```

---

### Test 4: Mark Nudge as Complete (In-App) ✅

**Note:** Currently, there's no UI to mark nudges complete in-app (this is Phase 3).

**Test via API:**

```bash
# Get a nudge ID from Test 3
curl -X PATCH http://localhost:3000/api/nudges/[nudge-id] \
  -H "Cookie: next-auth.session-token=your-session-token"
```

**Expected Results:**

- ✅ Nudge marked as `is_completed = true`
- ✅ `completed_at` timestamp set
- ✅ Active count decreases
- ✅ Badge updates

**Check Database:**

```sql
SELECT * FROM nudges WHERE id = 'nudge-id';
```

Should show `is_completed = true` and `completed_at` timestamp.

---

### Test 5: Email Completion Link ✅

**Steps:**

1. Create a test nudge
2. Get the nudge ID from database or API
3. Generate a test completion URL manually (or trigger cron to send email)
4. Copy the completion URL from email
5. Visit the URL in browser (or use curl)

**Generate Test URL:**

```javascript
// In Node.js REPL or test script
const crypto = require("crypto");
const nudgeId = "your-nudge-id";
const secretKey = process.env.NUDGE_SECRET_KEY;
const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
const message = `${nudgeId}-${expires}`;
const signature = crypto
  .createHmac("sha256", secretKey)
  .update(message)
  .digest("hex");
const url = `http://localhost:3000/api/nudges/${nudgeId}/complete?sig=${signature}&expires=${expires}`;
console.log(url);
```

**Expected Results:**

- ✅ URL redirects to home page: `/?nudge=completed`
- ✅ Nudge marked as complete in database
- ✅ Success message displayed on homepage
- ✅ Badge count updated

**Test Invalid/Expired URLs:**

- Invalid signature → redirects to `/?error=verification-failed`
- Expired token (use past timestamp) → redirects to `/?error=expired-link`
- Missing params → redirects to `/?error=invalid-link`

---

### Test 6: Cron Job Email Sending ✅

**Steps:**

1. Create 2-3 active nudges for your test user
2. Ensure your email is set up in Resend (`RESEND_FROM_EMAIL`)
3. Manually trigger the cron endpoint:

```bash
# With CRON_SECRET set:
curl -X POST http://localhost:3000/api/cron/nudge-reminder \
  -H "Authorization: Bearer your-cron-secret"

# Without CRON_SECRET (development):
curl -X GET http://localhost:3000/api/cron/nudge-reminder
```

**Expected Results:**

- ✅ Returns JSON with results:
  ```json
  {
    "success": true,
    "message": "Processed 1 users, sent 1 emails, 0 failed",
    "results": {
      "processed": 1,
      "sent": 1,
      "failed": 0,
      "errors": []
    }
  }
  ```
- ✅ Email received at your user's email address
- ✅ Email contains all active nudges
- ✅ Each nudge has a "Mark as done" button
- ✅ Completion links work (test them)

**Check Email:**

- Subject: "Your Name, 2 gentle nudges from your coach" (or "1 gentle nudge")
- Personalized greeting with your name
- List of all active nudges
- Each nudge has a completion button/link
- Gentle styling matching app aesthetic

---

### Test 7: Multiple Users (If Testing with Multiple Accounts) ✅

**Steps:**

1. Create a second user account
2. Log in as user 2
3. Create nudges as user 2
4. Log in as user 1
5. Verify user 1 only sees their own nudges
6. Trigger cron job
7. Verify each user receives their own email with only their nudges

**Expected Results:**

- ✅ Users can only see their own nudges
- ✅ Badge count is user-specific
- ✅ Each user receives personalized email
- ✅ Emails are isolated (user 1 doesn't see user 2's nudges)

---

### Test 8: Edge Cases ✅

**Test Multiple Active Nudges:**

- Create 5+ nudges
- Verify badge shows count
- Verify email contains all nudges
- Verify completion links work for each

**Test Race Conditions:**

- Mark nudge complete right before cron runs
- Verify cron job skips already-completed nudges

**Test Validation:**

- Try creating nudge with 151+ characters → should fail
- Try creating empty nudge → should be disabled
- Try accessing other user's nudge → should be 404

**Test Character Limit:**

- Create nudge with exactly 150 characters → should work
- Create nudge with 151 characters → should be rejected

---

## Testing Cron Job Locally

Since Vercel Cron only works in production, here are ways to test locally:

### Option 1: Manual Trigger (Easiest)

```bash
# In terminal:
curl -X GET http://localhost:3000/api/cron/nudge-reminder

# Or with CRON_SECRET if set:
curl -X POST http://localhost:3000/api/cron/nudge-reminder \
  -H "Authorization: Bearer your-cron-secret"
```

### Option 2: Create Test Script

Create `scripts/test-cron.js`:

```javascript
const fetch = require("node-fetch");

async function testCron() {
  const response = await fetch(
    "http://localhost:3000/api/cron/nudge-reminder",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
      },
    }
  );
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testCron();
```

Run: `node scripts/test-cron.js`

---

## Production Deployment Checklist

Before deploying to production:

1. **✅ Run database migration on production database**
2. **✅ Set environment variables in Vercel**:

   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (use verified domain)
   - `NUDGE_SECRET_KEY` (different from dev!)
   - `CRON_SECRET` (optional but recommended)
   - `NEXTAUTH_URL` (your production URL)
   - `DATABASE_URL` (production database)
   - `NEXTAUTH_SECRET` (production secret)

3. **✅ Verify domain in Resend**:

   - Add and verify your domain
   - Update `RESEND_FROM_EMAIL` to use your domain
   - Update DNS records as instructed by Resend

4. **✅ Test in production**:

   - Create test nudge
   - Wait for cron job to run (or trigger manually)
   - Verify email delivery
   - Test completion links

5. **✅ Monitor logs**:
   - Check Vercel logs for cron job execution
   - Check Resend dashboard for email delivery
   - Monitor for errors

---

## Known Issues / Future Enhancements

From the plan, these are Phase 3 items (optional):

- ⏳ In-app nudge list view (`NudgeList` component)
- ⏳ Completed nudge history
- ⏳ Email unsubscribe functionality
- ⏳ Timezone support (currently UTC only)
- ⏳ Rate limiting for spam prevention
- ⏳ Edit/delete nudge functionality
- ⏳ Coach integration (mention nudges during sessions)

---

## Troubleshooting

### Modal doesn't open

- Check browser console for errors
- Verify `@radix-ui/react-dialog` is installed: `npm list @radix-ui/react-dialog`
- Check if Dialog component is imported correctly

### Badge count not updating

- Check browser console for errors
- Verify `useNudgeCount` hook is working
- Check Network tab for `/api/nudges` request
- Verify event listener is working (`nudgeCreated` event)

### Email not sending

- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for errors
- Verify `RESEND_FROM_EMAIL` is valid
- Check cron endpoint logs for errors
- Test Resend API directly with their dashboard

### Completion link not working

- Verify `NUDGE_SECRET_KEY` matches between email generation and validation
- Check if URL is expired (7 day limit)
- Verify signature is correct
- Check browser console for redirect errors

### Database errors

- Verify migration has been run
- Check table exists: `SELECT * FROM nudges LIMIT 1;`
- Verify indexes exist
- Check foreign key constraints

---

## Quick Test Script

Save as `test-nudge-feature.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🧪 Testing Nudge Feature..."
echo ""

echo "1. Testing GET /api/nudges..."
curl -s "$BASE_URL/api/nudges" | jq '.'
echo ""

echo "2. Testing POST /api/nudges (create)..."
curl -s -X POST "$BASE_URL/api/nudges" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test nudge from script"}' | jq '.'
echo ""

echo "3. Testing cron endpoint..."
curl -s -X GET "$BASE_URL/api/cron/nudge-reminder" | jq '.'
echo ""

echo "✅ Tests complete!"
```

Make executable: `chmod +x test-nudge-feature.sh`
Run: `./test-nudge-feature.sh`
