/**
 * BFF: Gallery API
 *
 * Architecture decision (Task 4): Aggregate all data server-side so the client
 * makes a single request instead of multiple calls in client-side code.
 *
 * Performance notes (Task 3):
 * 1. Promise.all (can also use allSettled incase of granual control) parallelizes all user stat fetches — reduces sequential latency to parallel latency.
 * 2. Fetching on the server enables SSR — page renders fully on first load
 * 3. Add loading="lazy" on <img> tags for deferred off-screen image loading
 */

export default cachedEventHandler(async () => {
  try {
    const storage = useStorage('storage');
    const photos = await storage.getItem('/gallery/gallery-db.json');
    const users = await $fetch('https://jsonplaceholder.typicode.com/users');

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [albums, posts, comments] = await Promise.all([
          $fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/albums`),
          $fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/posts`),
          $fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/comments`),
        ]);
        return { ...user, albums, posts, comments };
      })
    );

    return { photos, users: usersWithStats };
  } catch (err) {
    throw createError({ statusCode: 502, message: 'Failed to fetch gallery data' });
  }
}, {
  maxAge: 60 * 60 // 1 hour
});
