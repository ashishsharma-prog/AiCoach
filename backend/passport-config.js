const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { pool } = require('./config/database');

// Serialize/deserialize user for session (required by Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Helper: Find or create user for social login
async function findOrCreateSocialUser({ provider, providerId, name, email }) {
  // Try to find by provider/provider_id
  let { rows } = await pool.query(
    'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
    [provider, providerId]
  );
  if (rows.length > 0) return rows[0];

  // Try to find by email (link account)
  ({ rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]));
  if (rows.length > 0) {
    // Link provider to existing user
    await pool.query(
      'UPDATE users SET provider = $1, provider_id = $2 WHERE id = $3',
      [provider, providerId, rows[0].id]
    );
    return { ...rows[0], provider, provider_id: providerId };
  }

  // Create new user (no password for social login)
  const insert = await pool.query(
    'INSERT INTO users (name, email, provider, provider_id, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, provider, providerId, '']
  );
  return insert.rows[0];
}

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateSocialUser({
      provider: 'google',
      providerId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// // Facebook Strategy
// passport.use(new FacebookStrategy({
//   clientID: process.env.FB_CLIENT_ID,
//   clientSecret: process.env.FB_CLIENT_SECRET,
//   callbackURL: '/auth/facebook/callback',
//   profileFields: ['id', 'displayName', 'emails'],
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const user = await findOrCreateSocialUser({
//       provider: 'facebook',
//       providerId: profile.id,
//       name: profile.displayName,
//       email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
//     });
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// })); 