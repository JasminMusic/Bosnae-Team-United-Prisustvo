# Bosnae Teamu United BJJ: Coach App

A mobile app for **Bosnae Teamu United Brazilian Jiu-Jitsu** for tracking:

- **Attendance:** tap names to check students in to the **Gi** or **No-Gi** class for any day.
- **Belts:** adult belts (white → black, stripes or degrees) and IBJJF kids belts (grey, yellow, orange, green).
- **Gi / No-Gi / Both:** what each student trains.
- **Start date:** when each student started training, plus how long they have been training.
- **Promotions:** the history of belts and stripes, and classes since the last promotion.
- **Stats:** check-ins per week, belt breakdown, top attendees, and who hasn't trained for 3+ weeks.
- **CSV export** of students and attendance (opens in Excel or Google Sheets).

It works on **iPhone and Android** as an installable web app (PWA). You open it once in the
browser, tap **Add to Home Screen**, and it then opens full-screen with its own icon, like a normal app.

---

## Why a web app and not App Store / Play Store apps?

| | Web app on Vercel (this) | Native store apps |
|---|---|---|
| Works on iPhone + Android | ✅ one app for both | needs two builds |
| Cost | free (Vercel + Neon free tiers) | Apple $99/year + Google $25 |
| Updates | instant, nobody has to update | store review for every change |
| Install | "Add to Home Screen" | download from the store |
| Shared data between coaches | ✅ same login on any phone | needs a server anyway |

For a club tool used by a few coaches, a web app is simpler and cheaper. If you ever want it
in the App Store too, the same app can later be wrapped with Capacitor.

---

## Deploy to Vercel (about 10 minutes, no coding)

You need free accounts on **GitHub** and **Vercel** (sign up to Vercel *with* GitHub).

### 1. Put the code on GitHub
Create a new **private** repository (e.g. `bosnae-bjj`) and upload this folder to it.
(Ask Claude to push it for you if you give it the repository name.)

### 2. Import into Vercel
1. Go to <https://vercel.com/new> and pick the `bosnae-bjj` repository → **Import**.
2. Open **Environment Variables** and add:
   - `APP_PASSWORD`: the password coaches will type to log in. Make it a long one.
3. Click **Deploy**. It will build. The app still needs a database, so it will tell you so.

### 3. Add the database (Neon Postgres, free)
1. In your Vercel project open the **Storage** tab → **Create Database** → **Neon** (Serverless Postgres).
2. Pick region **Frankfurt (eu-central-1)**, which is closest to Bosnia, and the **Free** plan.
3. Connect it to the project (keep all environments ticked). This adds `DATABASE_URL` automatically.
4. Go to **Deployments** → the latest one → **⋯** → **Redeploy**.

The app creates its tables by itself on first use. There is nothing else to set up.

### 4. Open it and install on your phone
Open your app's address (e.g. `https://bosnae-bjj.vercel.app`) and log in with `APP_PASSWORD`.

- **iPhone (Safari):** Share button → **Add to Home Screen** → Add.
- **Android (Chrome):** ⋮ menu → **Install app** (or **Add to Home screen**).

You stay logged in for 6 months on each phone.

> **Custom domain:** you can use e.g. `app.bjj.ba` under Vercel → Settings → Domains.

---

## Everyday use

- **Attendance tab:** the date defaults to today. Pick **Gi class** or **No-Gi class**, then tap each student who came.
  The change saves at once (a green tick means saved). Use ‹ › or tap the date to fix past days.
  Students who only train the other style are under "Usually train … only".
- **New person on the mat?** Tap **+** on the attendance screen. After saving they are added *and*
  checked in to the current class.
- **Promotions:** open a student → **Add stripe**, or **Edit** to change the belt. The promotion date
  is saved in the history.
- **Student stopped coming?** Use **Archive** rather than Delete. They disappear from the attendance
  list but their history stays. **Restore** brings them back.
- **Backups:** Stats tab → **Students CSV** / **Attendance CSV**. Doing this once a month is a good habit.

### Changing the password
Change `APP_PASSWORD` in Vercel → Settings → Environment Variables, then redeploy.
Everyone is logged out and has to use the new password.

---

## Customising

- **Logo / icon:** replace the PNGs in `public/icons/` (`icon-192.png`, `icon-512.png`,
  `maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`) with the club logo at the same sizes.
- **Colours:** `--primary` and `--accent` at the top of `app/globals.css` (both light and dark mode).
- **Time zone:** "today" uses `Europe/Sarajevo`. Change it with the `CLUB_TIMEZONE` environment variable.

---

## For developers

Next.js 16 (App Router) + React 19 + Postgres via [`postgres`](https://github.com/porsager/postgres).
No ORM. The schema lives in `lib/db.ts` and is applied automatically (`CREATE TABLE IF NOT EXISTS`).

```bash
cp .env.example .env.local   # set DATABASE_URL and APP_PASSWORD
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
```

| Path | What |
|---|---|
| `app/(app)/page.tsx`, `AttendanceBoard.tsx` | attendance screen |
| `app/(app)/students/…` | list, profile, add/edit form, server actions |
| `app/(app)/stats/…` | stats + weekly chart |
| `app/api/attendance` | check-in endpoint (fast, parallel taps) |
| `app/api/export/[kind]` | CSV export |
| `lib/data.ts` | all SQL queries |
| `lib/belts.ts` | belt definitions (IBJJF order) |
| `lib/session.ts`, `lib/auth.ts`, `proxy.ts` | password login (signed cookie) |
| `public/sw.js`, `app/manifest.ts` | PWA (installable, offline page) |

Works with any Postgres (Neon, Supabase, etc.). It reads `DATABASE_URL` or `POSTGRES_URL`.
