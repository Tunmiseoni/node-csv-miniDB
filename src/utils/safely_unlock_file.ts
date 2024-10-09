import lockfile from "proper-lockfile";

export default async (
  unlockFn: (() => Promise<void>) | undefined,
  name: string,
  reject?: Function
) => {
  if (!unlockFn) return;
  try {
    lockfile.check(name).then(async (isLocked) => {
      if (isLocked) unlockFn();
    });
  } catch (err) {
    if (reject) {
      reject(new Error(`Failed to unlock file: ${err}`));
    } else {
      throw new Error(`Failed to unlock file: ${err}`);
    }
  }
};
