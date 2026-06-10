import mongoose from 'mongoose';

// Це дозволяє імпортувати будь-які CSS файли без помилок
declare module '*.css';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

export {};