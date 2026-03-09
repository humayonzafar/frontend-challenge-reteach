<template>
  <AwesomeSection>
    <h2>Users List</h2>
    <input type="text" placeholder="Search..." v-model="search" name="search" />
    <ul>
      <li v-for="user in filteredUsers" :key="user.id">
        <NuxtLink :to="`/user/${user.id}`">
          <p>Name: {{ user.name }}</p>
          <p>Email: {{ user.email }}</p>
          <p>Username: {{ user.username }}</p>
          <hr />
        </NuxtLink>
      </li>
    </ul>
  </AwesomeSection>
</template>

<script setup>
import { useAsyncData } from 'nuxt/app';

// Improvements:
// TODO: Use refDebounced (@vueuse/core) to debounce search and avoid filtering on every keystroke.
// TODO: Normalize user data once after fetch (toLowerCase()) to avoid redundant string operations on every filter call

const search = ref('');
const { data: users } = useAsyncData('users', () => $fetch('https://jsonplaceholder.typicode.com/users'));

const filteredUsers = computed(() => {
  const searchValue = search.value.trim().toLowerCase();
  return users.value?.filter((user) => {
    return (user.name?.toLowerCase().includes(searchValue) ||
      user.username?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue));
  }) ?? [];
})
</script>
