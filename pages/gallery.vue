<template>
  <div>
    <h2>Gallery</h2>
    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Error loading images: {{ error.message }}</div>
    <div v-else>
      <!-- TODO: extract Object.keys(sortByUser).length check to a computed property and sepreate v-for and v-if from same div -->
      <div v-if="Object.keys(sortByUser).length !== 0" v-for="(userGallery, index) in Object.values(sortByUser)"
        :key="index">
        <hr v-if="index !== 0" />
        <h2>{{ userGallery.name }}</h2>
        <p>Albums: {{ userGallery.albums.length }}</p>
        <p>Posts: {{ userGallery.posts.length }}</p>
        <p>Comments: {{ userGallery.comments.length }}</p>
        <div class="gallery">
          <template v-for="img in userGallery.photos" :key="img.id">

            <!-- Improvement: eager load first images in viewport, lazy load the rest -->
            <img :src="img.picture" :alt="img.title" loading="lazy" class="photo" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * PROPOSED ARCHITECTURE FOR NEXT ITERATION:
 *
 * Current approach loads all users + all their stats + all photos in one request,
 * which is slow and transfers data the user may never view.
 *
 * Recommended change — "load on demand":
 *
 * 1. This page becomes a user card grid:
 *    - /api/gallery returns only users + 1 cover photo each
 *    - Each card shows the user name, cover photo, and a "View Gallery" button
 *
 * 2. On click, navigate to /gallery/[userId] (or open a modal):
 *    - api fetches full stats + all photos for that user only
 *    - Stats and photos are only loaded if the user actually views them
 *
 * Benefits:
 * - Initial load: less data transferred, faster time to interactive
 * - Data transferred: proportional to what's viewed, not everything upfront
 * - Per-user page/modal is naturally shareable and bookmarkable
 */

const { data, pending, error } = await useFetch('/api/gallery');

const sortByUser = computed(() => {
  if (!data.value) return {};
  const { photos, users } = data.value;

  // Improvement TODO: 
  // Can be made cleaner if we reduce by users instead of photos and 
  // and can be made siginficanltyy faster by grouping photos by userId first to avoid nested find() calls
  // Object.groupBy(photos, photo => photo.userId)
  return photos.reduce((acc, img) => {
    const user = users.find((u) => u.id === img.userId);
    if (!user) {
      return acc;
    }
    if (!acc[img.userId]) {
      acc[img.userId] = {
        name: img.userName,
        photos: [],
        albums: user.albums || [],
        posts: user.posts || [],
        comments: user.comments || [],
      };
    }
    acc[img.userId].photos.push(img);
    return acc;
  }, {});
});

if (error.value) {
  console.error('Failed to load gallery:', error.value);
}
</script>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1svw;
}

.img-gallery {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo {
  max-width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
