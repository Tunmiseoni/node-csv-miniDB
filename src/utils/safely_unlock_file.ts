export default async (
    unlockFn: (() => Promise<void>) | undefined,
    reject?: Function
  ) => {
    if (!unlockFn) return;
    try {
      await unlockFn();
    } catch (err) {
      if (reject) {
        reject(new Error(`Failed to unlock file: ${err}`));
      } else {
        throw new Error(`Failed to unlock file: ${err}`);
      }
    }
  };