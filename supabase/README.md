# Supabase setup

1. Create a Supabase project and run `schema.sql` in its SQL editor.
2. Run `seed.sql` to install six original stories. Three are free; three require an active or trialing subscription. The seed does not overwrite CMS edits when run again.
3. Enable email authentication. In Authentication → URL Configuration, set the application site URL and allow its `/auth/callback` URL, including the local development callback when developing locally.
4. Put the project URL and anonymous key in the public Supabase environment variables listed in `.env.example`. Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only.

The schema creates the `users`, `stories`, `progress`, `stickers`, and `stripe_events` tables. It also creates private `little-lights-media` and `little-lights-coloring` buckets. CMS uploads and signed media links are handled by authenticated server routes; there are deliberately no public storage mutation policies.

Row-level security permits parents to read their own account and progress. Browser clients can update only the child's name, age, and bedtime; they cannot change subscription status, create awards, or write webhook receipts. A new account trigger creates its profile with free access, even if signup metadata claims a paid subscription. Published free stories are readable anonymously. Full paid stories require a verified subscribed parent, while the application API supplies only safe metadata for locked stories.

Completion records are unique per parent, story, and UTC day. Re-reading a story on another night can count toward the streak; repeating the same request on the same night does not duplicate the reward. Database dates use UTC; present them in the parent's local time in the interface where appropriate.

The SQL is repeatable on a new database and checks story page length and quiz shape. If adapting an already-deployed earlier schema, create and review explicit migrations rather than assuming `create table if not exists` changes existing columns.
