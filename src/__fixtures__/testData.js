export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  isAdmin: false
};

export const mockAdminUser = {
  id: 2,
  username: 'adminuser',
  email: 'admin@example.com',
  isAdmin: true
};

export const mockPosts = [
  {
    id: 1,
    title: 'Test Post 1',
    content: '<p>This is test post content</p>',
    published: true,
    authorId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    User: {
      id: 1,
      username: 'testuser'
    },
    Images: []
  },
  {
    id: 2,
    title: 'Test Post 2',
    content: '<p>Another test post</p>',
    published: false,
    authorId: 1,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    User: {
      id: 1,
      username: 'testuser'
    },
    Images: [
      {
        id: 1,
        filename: 'test-image.jpg',
        s3Key: 'posts/1/test-image.jpg',
        url: 'https://example.com/test-image.jpg'
      }
    ]
  }
];

export const mockAuthResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token'
};

export const mockError = {
  message: 'Mock error message'
};
