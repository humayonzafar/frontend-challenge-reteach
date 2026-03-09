import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import GalleryPage from '~/pages/gallery.vue';

const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }));
mockNuxtImport('useFetch', () => useFetchMock);

beforeEach(() => vi.clearAllMocks());

const mockData = {
  photos: [
    { id: 1, userId: 1, userName: 'Alice', picture: 'img1.jpg', title: 'Photo 1' },
    { id: 2, userId: 1, userName: 'Alice', picture: 'img2.jpg', title: 'Photo 2' },
  ],
  users: [
    { id: 1, name: 'Alice', albums: [1, 2], posts: [1], comments: [1, 2, 3] },
  ],
};

describe('Gallery page', () => {
  it('shows loading state', async () => {
    useFetchMock.mockReturnValue({ data: ref(null), pending: ref(true), error: ref(null) });
    const wrapper = await mountSuspended(GalleryPage);

    expect(wrapper.text()).toContain('Loading');
  });

  it('shows error message on failure', async () => {
    useFetchMock.mockReturnValue({ data: ref(null), pending: ref(false), error: ref(new Error('Network error')) });
    const wrapper = await mountSuspended(GalleryPage);

    expect(wrapper.text()).toContain('Error loading images');
    expect(wrapper.text()).toContain('Network error');
  });

  it('renders user name and photos when data loads', async () => {
    useFetchMock.mockReturnValue({ data: ref(mockData), pending: ref(false), error: ref(null) });
    const wrapper = await mountSuspended(GalleryPage);

    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.findAll('img')).toHaveLength(2);
  });

  it('images have loading="lazy" attribute', async () => {
    useFetchMock.mockReturnValue({ data: ref(mockData), pending: ref(false), error: ref(null) });
    const wrapper = await mountSuspended(GalleryPage);
    const images = wrapper.findAll('img');

    expect(images).toHaveLength(2);
    images.forEach(img => {
      expect(img.attributes('loading')).toBe('lazy');
    });
  });
});
