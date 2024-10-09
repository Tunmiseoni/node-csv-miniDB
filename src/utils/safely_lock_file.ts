import lockfile from "proper-lockfile";

export default async function lockFile(name: string, retries: number = 0): Promise<() => Promise<void>> {
  try {
    const isLocked = await lockfile.check(name);
    if (isLocked) throw new Error("File is already locked.");

    const unlock = await lockfile.lock(name, { retries });
    return async () => {
      await unlock();
    };
  } catch (err) {
    throw new Error(`Failed to lock file: ${err instanceof Error ? err.message : err}`);
  }
}
