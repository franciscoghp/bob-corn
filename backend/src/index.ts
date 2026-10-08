import { createApp } from './app';

const PORT = process.env.PORT || 3000;

// Local / long-running server. On Vercel the app is exported from api/index.ts instead.
createApp().listen(PORT, () => {
  console.log(`🌽 Bob's Corn API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
