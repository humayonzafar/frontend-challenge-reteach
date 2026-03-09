<template>
  <AwesomeArticle>
    <h1>User Todo's</h1>

    <!-- only using this template as a roundway to make checkbox work without JS 
     and the input should be direct decendant for styling to work -->
    <span>Filters:</span>
    <input type="checkbox" id="completed" checked />
    <span><label for="completed">Show completed</label></span>
    <input type="checkbox" id="pending" checked />
    <span><label for="pending">Show pending</label></span>

    <label>
      Limit:
      <select v-model="limit">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="Infinity">All</option>
      </select>
    </label>

    <button data-testid="toggle-all" @click="toggleAll">
      {{ allSelected ? 'Deselect All' : 'Select All' }}
    </button>

    <ul class="todo-list" data-testid="todo-list">
      <li v-for="todo in filteredTodos" class="todo-list__item" :key="todo.id"
        :class="todo.completed ? 'completed' : 'pending'"
        :data-testid="`todo-item-${todo.id}`"
        @click="todo.completed = !todo.completed">
        <h4>{{ todo.title }}</h4>
        <p data-testid="todo-status">Status: {{ todo.completed ? 'Completed' : 'Pending' }}</p>
      </li>
    </ul>
  </AwesomeArticle>
</template>

<script setup>
const route = useRoute();
const userId = route.params.id;
const limit = ref(5);

const { data: todos } = await useAsyncData(`todos-${userId}`, () =>
  $fetch(`https://jsonplaceholder.typicode.com/users/${userId}/todos`)
);

const allSelected = computed(() => todos.value?.every(t => t.completed));

// Improvements: 
// TODO: add completed/pending filtering to computed property instead of relying on CSS to hide/show items
// TODO: add count of completed/pending items currently shown based on filters
const filteredTodos = computed(() => todos.value?.slice(0, limit.value));
const toggleAll = () => {
  const newValue = !allSelected.value;
  todos.value?.forEach(t => t.completed = newValue);
};
</script>

<style scoped>
#completed:not(:checked)~ul .completed {
  display: none;
}

#pending:not(:checked)~ul .pending {
  display: none;
}

.todo-list__item {
  cursor: pointer;
  width: fit-content;
}

.todo-list__item.completed {
  text-decoration: line-through;
  opacity: 0.6;
  color: #888;  
}
</style>
