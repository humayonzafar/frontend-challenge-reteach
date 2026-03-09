import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import TodoPage from '~/pages/user/[id].vue';

mockNuxtImport('useRoute', () => () => ({
  params: { id: '1' },
}));

mockNuxtImport('useAsyncData', () => async () => ({
  data: ref([
    { id: 1, title: 'Task 1', completed: false },
    { id: 2, title: 'Task 2', completed: true }
  ]),
}));

describe('Todo page', () => {
  it('renders todo items', async () => {
    const wrapper = await mountSuspended(TodoPage);

    expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(2);
  });

  it('applies correct class based on completion status', async () => {
    const wrapper = await mountSuspended(TodoPage);

    expect(wrapper.find('[data-testid="todo-item-1"]').classes()).toContain('pending');
    expect(wrapper.find('[data-testid="todo-item-2"]').classes()).toContain('completed');
  });

  it('toggles todo completion on click', async () => {
    const wrapper = await mountSuspended(TodoPage);
    const item = wrapper.find('[data-testid="todo-item-1"]');

    expect(item.classes()).toContain('pending');
    await item.trigger('click');
    expect(item.classes()).toContain('completed');
  });

  it('select all marks all todos as completed', async () => {
    const wrapper = await mountSuspended(TodoPage);
    await wrapper.find('[data-testid="toggle-all"]').trigger('click');

    wrapper.findAll('[data-testid^="todo-item-"]').forEach(item => {
      expect(item.classes()).toContain('completed');
    });
  });

  it('deselect all clears all completed todos', async () => {
    const wrapper = await mountSuspended(TodoPage);
    const toggleBtn = wrapper.find('[data-testid="toggle-all"]');
    await toggleBtn.trigger('click');
    await toggleBtn.trigger('click');

    wrapper.findAll('[data-testid^="todo-item-"]').forEach(item => {
      expect(item.classes()).toContain('pending');
    });
  });
});
